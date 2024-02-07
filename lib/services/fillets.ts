import { OccHelper } from "../occ-helper";
import { BRepFilletAPI_MakeFillet2d_2, OpenCascadeInstance, TopAbs_ShapeEnum, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Vertex, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../api/inputs/inputs";

export class OCCTFillets {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    filletEdges(inputs: Inputs.OCCT.FilletDto<TopoDS_Shape>) {
        return this.och.filletEdges(inputs);
    }

    chamferEdges(inputs: Inputs.OCCT.ChamferDto<TopoDS_Shape>) {
        if (!inputs.indexes || (inputs.indexes.length && inputs.indexes.length === 0)) {
            if (inputs.distance === undefined) {
                throw (Error("Distance is undefined"));
            }
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            const anEdgeExplorer = new this.occ.TopExp_Explorer_2(
                inputs.shape, (this.occ.TopAbs_ShapeEnum.TopAbs_EDGE as TopAbs_ShapeEnum),
                (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)
            );
            const edges: TopoDS_Edge[] = [];
            while (anEdgeExplorer.More()) {
                const anEdge = this.occ.TopoDS.Edge_1(anEdgeExplorer.Current());
                edges.push(anEdge);
                mkChamfer.Add_2(inputs.distance, anEdge);
                anEdgeExplorer.Next();
            }
            const result = mkChamfer.Shape();
            mkChamfer.delete();
            anEdgeExplorer.delete();
            edges.forEach(e => e.delete());
            return result;
        } else if (inputs.indexes && inputs.indexes.length > 0) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            let foundEdges = 0;
            let curChamfer: TopoDS_Shape;
            let distanceIndex = 0;
            const inputIndexes = inputs.indexes;
            this.och.forEachEdge(inputs.shape, (index, edge) => {
                if (inputIndexes.includes(index)) {
                    let distance = inputs.distance;
                    if (inputs.distanceList) {
                        distance = inputs.distanceList[distanceIndex];
                        distanceIndex++;
                    }
                    if (distance === undefined) {
                        throw (Error("Distance not defined and/or distance list incorrect length"));
                    }
                    mkChamfer.Add_2(distance, edge);
                    foundEdges++;
                }
            });
            if (foundEdges === 0) {
                console.error("Chamfer Edges Not Found!  Make sure you are looking at the object _before_ the Fillet is applied!");
                curChamfer = inputs.shape;
            }
            else {
                curChamfer = mkChamfer.Shape();
            }
            mkChamfer.delete();
            const result = this.och.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        }
        return undefined;
    }

    filletTwoEdgesInPlaneIntoAWire(inputs: Inputs.OCCT.FilletTwoEdgesInPlaneDto<TopoDS_Edge>): TopoDS_Wire {
        if (inputs.shapes === undefined || inputs.shapes.length < 2) {
            throw (Error(("Shapes needs to be an array of length 2")));
        }
        const pln = this.och.gpPln(inputs.planeOrigin, inputs.planeDirection);
        const fil = new this.occ.ChFi2d_FilletAlgo_3(inputs.shapes[0], inputs.shapes[1], pln);
        fil.Perform(inputs.radius);
        const pt = this.och.gpPnt(inputs.planeOrigin);
        const edge1 = new this.occ.TopoDS_Edge();
        const edge2 = new this.occ.TopoDS_Edge();

        let solution = -1;
        if (inputs.solution !== undefined) {
            solution = inputs.solution;
        }
        const filletedEdge = fil.Result(pt, edge1, edge2, solution);

        const result = this.och.combineEdgesAndWiresIntoAWire({ shapes: [edge1, filletedEdge, edge2] });
        fil.delete();
        pt.delete();
        pln.delete();
        edge1.delete();
        edge2.delete();
        filletedEdge.delete();
        return result;
    }

    fillet3DWire(inputs: Inputs.OCCT.Fillet3DWireDto<TopoDS_Wire>) {
        return this.och.fillet3DWire(inputs);
    }

    fillet2d(inputs: Inputs.OCCT.FilletDto<TopoDS_Wire | TopoDS_Face>): TopoDS_Face | TopoDS_Wire {
        if (inputs.indexes && inputs.radiusList && inputs.radiusList.length !== inputs.indexes.length) {
            throw new Error("When using radius list, length of the list must match index list of corners that you want to fillet.");
        }
        let face;
        let isShapeFace = false;
        if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_FACE) {
            face = this.och.getActualTypeOfShape(inputs.shape);
            isShapeFace = true;
        } else if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE) {
            const faceBuilder = new this.occ.BRepBuilderAPI_MakeFace_15(inputs.shape, true);
            const messageProgress = new this.occ.Message_ProgressRange_1();
            faceBuilder.Build(messageProgress);
            const shape = faceBuilder.Shape();
            face = this.och.getActualTypeOfShape(shape);
            shape.delete();
            messageProgress.delete();
            faceBuilder.delete();
        } else {
            throw new Error("You can only fillet a 2d wire or a 2d face.");
        }

        const filletMaker = new this.occ.BRepFilletAPI_MakeFillet2d_2(face);

        const anVertexExplorer = new this.occ.TopExp_Explorer_2(
            inputs.shape, (this.occ.TopAbs_ShapeEnum.TopAbs_VERTEX as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)
        );
        let i = 1;
        const cornerVertices: TopoDS_Vertex[] = [];
        for (anVertexExplorer; anVertexExplorer.More(); anVertexExplorer.Next()) {
            const vertex: TopoDS_Vertex = this.occ.TopoDS.Vertex_1(anVertexExplorer.Current());
            if (i % 2 === 0) {
                cornerVertices.push(vertex);
            }
            i++;
        }
        if (!isShapeFace) {
            const wire = inputs.shape as TopoDS_Wire;
            if (!wire.Closed_1()) {
                cornerVertices.pop();
            }
        }
        let radiusAddedCounter = 0;
        cornerVertices.forEach((cvx, index) => {
            if (!inputs.indexes) {
                this.applyRadiusToVertex(inputs, filletMaker, cvx, index);
            } else if (inputs.indexes.includes(index + 1)) {
                this.applyRadiusToVertex(inputs, filletMaker, cvx, radiusAddedCounter);
                radiusAddedCounter++;
            }
        });
        const messageProgress = new this.occ.Message_ProgressRange_1();
        filletMaker.Build(messageProgress);
        let result;
        if (isShapeFace) {
            result = filletMaker.Shape();
        } else {
            const isDone = filletMaker.IsDone();
            if (isDone) {
                const shape = filletMaker.Shape();
                const filletedWires = this.och.getWires({ shape });
                if (filletedWires.length === 1) {
                    result = filletedWires[0];
                }
            }
            else {
                // Previous algorithm fails if the wire is not made up of circular or straight edges. This algorithm is a failover.
                const normal = this.och.faceNormalOnUV({ shape: face, paramU: 0.5, paramV: 0.5 });
                result = this.fillet3DWire({ shape: inputs.shape, radius: inputs.radius, radiusList: inputs.radiusList, indexes: inputs.indexes, direction: normal });
            }
        }
        anVertexExplorer.delete();
        filletMaker.delete();
        messageProgress.delete();
        cornerVertices.forEach(cvx => cvx.delete());
        return result;
    }

    private applyRadiusToVertex(inputs: Inputs.OCCT.FilletDto<TopoDS_Shape>, filletMaker: BRepFilletAPI_MakeFillet2d_2, cvx: TopoDS_Vertex, index: number) {
        if (inputs.radiusList) {
            const radiusList = inputs.radiusList;
            filletMaker.AddFillet(cvx, radiusList[index]);
        } else if (inputs.radius) {
            filletMaker.AddFillet(cvx, inputs.radius);
        }
    }
}
