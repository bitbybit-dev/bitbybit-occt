import {
    BRepFilletAPI_MakeFillet, ChFi3d_FilletShape, OpenCascadeInstance,
    TopAbs_ShapeEnum, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Wire
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { Base } from "../../api/inputs/base-inputs";
import { VectorHelperService } from "../../api/vector-helper.service";
import { IteratorService } from "./iterator.service";
import { ConverterService } from "./converter.service";
import { EntitiesService } from "./entities.service";
import { EdgesService } from "./edges.service";
import { ShapeGettersService } from "./shape-getters";
import { TransformsService } from "./transforms.service";
import { OperationsService } from "./operations.service";

export class FilletsService {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly vecHelper: VectorHelperService,
        private readonly iteratorService: IteratorService,
        private readonly converterService: ConverterService,
        private readonly entitiesService: EntitiesService,
        private readonly transformsService: TransformsService,
        private readonly shapeGettersService: ShapeGettersService,
        private readonly edgesService: EdgesService,
        private readonly operationsService: OperationsService,
    ) { }

    filletEdges(inputs: Inputs.OCCT.FilletDto<TopoDS_Shape>) {


        if (!inputs.indexes || (inputs.indexes.length && inputs.indexes.length === 0)) {
            if (inputs.radius === undefined) {
                throw (Error("Radius not defined"));
            }
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.ChFi3d_Rational as ChFi3d_FilletShape)
            );
            const anEdgeExplorer = new this.occ.TopExp_Explorer_2(
                inputs.shape, (this.occ.TopAbs_ShapeEnum.TopAbs_EDGE as TopAbs_ShapeEnum),
                (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)
            );
            const edges: TopoDS_Edge[] = [];
            while (anEdgeExplorer.More()) {
                const anEdge = this.occ.TopoDS.Edge_1(anEdgeExplorer.Current());
                edges.push(anEdge);
                mkFillet.Add_2(inputs.radius, anEdge);
                anEdgeExplorer.Next();
            }
            const result = mkFillet.Shape();
            mkFillet.delete();
            anEdgeExplorer.delete();
            edges.forEach(e => e.delete());
            return result;
        } else if (inputs.indexes && inputs.indexes.length > 0) {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.ChFi3d_Rational as ChFi3d_FilletShape)
            );
            let foundEdges = 0;
            let curFillet: TopoDS_Shape;
            let radiusIndex = 0;
            const inputIndexes = inputs.indexes;
            this.iteratorService.forEachEdge(inputs.shape, (index, edge) => {
                if (inputIndexes.includes(index)) {
                    let radius = inputs.radius;
                    if (inputs.radiusList) {
                        radius = inputs.radiusList[radiusIndex];
                        radiusIndex++;
                    }
                    if (radius === undefined) {
                        throw (Error("Radius not defined, or radiusList not correct length"));
                    }
                    mkFillet.Add_2(radius, edge);
                    foundEdges++;
                }
            });
            if (foundEdges === 0) {
                throw (new Error("Fillet Edges Not Found!  Make sure you are looking at the object _before_ the Fillet is applied!"));
            }
            else {
                curFillet = mkFillet.Shape();
            }
            mkFillet.delete();
            const result = this.converterService.getActualTypeOfShape(curFillet);
            curFillet.delete();
            return result;
        }
        return undefined;
    }

    filletEdgesListOneRadius(inputs: Inputs.OCCT.FilletEdgesListOneRadiusDto<TopoDS_Shape, TopoDS_Edge>) {
        if (inputs.edges && inputs.edges.length > 0) {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.ChFi3d_Rational as ChFi3d_FilletShape)
            );
            inputs.edges.forEach((edge) => {
                mkFillet.Add_2(inputs.radius, edge);
            });
            const curFillet = mkFillet.Shape();
            mkFillet.delete();
            const result = this.converterService.getActualTypeOfShape(curFillet);
            curFillet.delete();
            return result;
        }
        return undefined;
    }

    filletEdgesList(inputs: Inputs.OCCT.FilletEdgesListDto<TopoDS_Shape, TopoDS_Edge>) {
        if (inputs.edges && inputs.edges.length > 0 && inputs.radiusList && inputs.radiusList.length > 0 && inputs.edges.length === inputs.radiusList.length) {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.ChFi3d_Rational as ChFi3d_FilletShape)
            );
            inputs.edges.forEach((edge, index) => {
                mkFillet.Add_2(inputs.radiusList[index], edge);
            });
            const curFillet = mkFillet.Shape();
            mkFillet.delete();
            const result = this.converterService.getActualTypeOfShape(curFillet);
            curFillet.delete();
            return result;
        }
        return undefined;
    }

    filletEdgeVariableRadius(inputs: Inputs.OCCT.FilletEdgeVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>) {
        if (inputs.paramsU && inputs.paramsU.length > 0 && inputs.radiusList && inputs.radiusList.length > 0 && inputs.paramsU.length === inputs.radiusList.length) {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.ChFi3d_Rational as ChFi3d_FilletShape)
            );
            this.assignVariableFilletToEdge(inputs, mkFillet);
            const curFillet = mkFillet.Shape();
            mkFillet.delete();
            const result = this.converterService.getActualTypeOfShape(curFillet);
            curFillet.delete();
            return result;
        }
        return undefined;
    }

    filletEdgesSameVariableRadius(inputs: Inputs.OCCT.FilletEdgesSameVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>) {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.radiusList && inputs.radiusList.length > 0 &&
            inputs.paramsU.length === inputs.radiusList.length) {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.ChFi3d_Rational as ChFi3d_FilletShape)
            );
            inputs.edges.forEach((edge) => {
                this.assignVariableFilletToEdge({
                    edge, paramsU: inputs.paramsU, radiusList: inputs.radiusList, shape: inputs.shape,
                }, mkFillet);
            });
            const curFillet = mkFillet.Shape();
            mkFillet.delete();
            const result = this.converterService.getActualTypeOfShape(curFillet);
            curFillet.delete();
            return result;
        }
        return undefined;
    }

    filletEdgesVariableRadius(inputs: Inputs.OCCT.FilletEdgesVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>) {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.radiusLists && inputs.radiusLists.length > 0 &&
            inputs.paramsULists.length === inputs.radiusLists.length &&
            inputs.paramsULists.length === inputs.edges.length &&
            inputs.radiusLists.length === inputs.edges.length) {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.ChFi3d_Rational as ChFi3d_FilletShape)
            );
            inputs.edges.forEach((edge, index) => {
                this.assignVariableFilletToEdge({
                    edge, paramsU: inputs.paramsULists[index], radiusList: inputs.radiusLists[index], shape: inputs.shape,
                }, mkFillet);
            });
            const curFillet = mkFillet.Shape();
            mkFillet.delete();
            const result = this.converterService.getActualTypeOfShape(curFillet);
            curFillet.delete();
            return result;
        }
        return undefined;
    }

    private assignVariableFilletToEdge(inputs: Inputs.OCCT.FilletEdgeVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>, mkFillet: BRepFilletAPI_MakeFillet) {
        const array = new this.occ.TColgp_Array1OfPnt2d_2(1, inputs.paramsU.length);
        inputs.paramsU.forEach((param, index) => {
            array.SetValue(index + 1, this.entitiesService.gpPnt2d([param, inputs.radiusList[index]]));
        });
        mkFillet.Add_5(array, inputs.edge);
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
            this.iteratorService.forEachEdge(inputs.shape, (index, edge) => {
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
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        }
        return undefined;
    }

    chamferEdgesList(inputs: Inputs.OCCT.ChamferEdgesListDto<TopoDS_Shape, TopoDS_Edge>) {
        if (inputs.edges && inputs.edges.length > 0 && inputs.distanceList && inputs.distanceList.length > 0 && inputs.edges.length === inputs.distanceList.length) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            inputs.edges.forEach((edge, index) => {
                const distance = inputs.distanceList[index];
                if (distance === undefined) {
                    throw (Error("Distance is not defined"));
                }
                mkChamfer.Add_2(distance, edge);
            });
            const curChamfer = mkChamfer.Shape();
            mkChamfer.delete();
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        }
        return undefined;
    }

    chamferEdgeTwoDistances(inputs: Inputs.OCCT.ChamferEdgeTwoDistancesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>) {
        const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
            inputs.shape
        );
        mkChamfer.Add_3(inputs.distance1, inputs.distance2, inputs.edge, inputs.face);
        const curChamfer = mkChamfer.Shape();
        mkChamfer.delete();
        const result = this.converterService.getActualTypeOfShape(curChamfer);
        curChamfer.delete();
        return result;
    }

    chamferEdgesTwoDistances(inputs: Inputs.OCCT.ChamferEdgesTwoDistancesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>) {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.edges.length === inputs.faces.length) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            inputs.edges.forEach((edge, index) => {
                mkChamfer.Add_3(inputs.distance1, inputs.distance2, edge, inputs.faces[index]);
            });
            const curChamfer = mkChamfer.Shape();
            mkChamfer.delete();
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        } else {
            return undefined;
        }
    }

    chamferEdgesTwoDistancesLists(inputs: Inputs.OCCT.ChamferEdgesTwoDistancesListsDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>) {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.faces && inputs.faces.length > 0 &&
            inputs.distances1 && inputs.distances1.length > 0 &&
            inputs.distances2 && inputs.distances2.length > 0 &&
            inputs.edges.length === inputs.faces.length &&
            inputs.edges.length === inputs.distances1.length &&
            inputs.edges.length === inputs.distances2.length) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            inputs.edges.forEach((edge, index) => {
                mkChamfer.Add_3(inputs.distances1[index], inputs.distances2[index], edge, inputs.faces[index]);
            });
            const curChamfer = mkChamfer.Shape();
            mkChamfer.delete();
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        } else {
            return undefined;
        }
    }

    chamferEdgeDistAngle(inputs: Inputs.OCCT.ChamferEdgeDistAngleDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>) {
        const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
            inputs.shape
        );
        const radians = this.vecHelper.degToRad(inputs.angle);
        mkChamfer.AddDA(inputs.distance, radians, inputs.edge, inputs.face);
        const curChamfer = mkChamfer.Shape();
        mkChamfer.delete();
        const result = this.converterService.getActualTypeOfShape(curChamfer);
        curChamfer.delete();
        return result;
    }

    chamferEdgesDistsAngles(inputs: Inputs.OCCT.ChamferEdgesDistsAnglesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>) {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.faces && inputs.faces.length > 0 &&
            inputs.distances && inputs.distances.length > 0 &&
            inputs.angles && inputs.angles.length > 0 &&
            inputs.edges.length === inputs.distances.length &&
            inputs.edges.length === inputs.faces.length &&
            inputs.edges.length === inputs.angles.length) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            inputs.edges.forEach((edge, index) => {
                const radians = this.vecHelper.degToRad(inputs.angles[index]);
                mkChamfer.AddDA(inputs.distances[index], radians, edge, inputs.faces[index]);
            });
            const curChamfer = mkChamfer.Shape();
            mkChamfer.delete();
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        } else {
            return undefined;
        }
    }

    chamferEdgesDistAngle(inputs: Inputs.OCCT.ChamferEdgesDistAngleDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>) {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.faces && inputs.faces.length > 0 &&
            inputs.edges.length === inputs.faces.length
        ) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            const radians = this.vecHelper.degToRad(inputs.angle);
            inputs.edges.forEach((edge, index) => {
                mkChamfer.AddDA(inputs.distance, radians, edge, inputs.faces[index]);
            });
            const curChamfer = mkChamfer.Shape();
            mkChamfer.delete();
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        } else {
            return undefined;
        }
    }

    fillet3DWire(inputs: Inputs.OCCT.Fillet3DWireDto<TopoDS_Wire>) {
        let useRadiusList = false;
        if (inputs.radiusList && inputs.radiusList.length > 0 && inputs.indexes && inputs.indexes.length > 0) {
            if (inputs.radiusList.length !== inputs.indexes.length) {
                throw new Error("Radius list and indexes are not the same length");
            } else {
                useRadiusList = true;
            }
        }

        // the goal is to make this fillet the same corner indices as fillet 2d command does with the same radius list.
        // This makes this algorithm quite complex when counting which actual edge indices need to be rounded as it is based on
        // extrusion, which creates specific index definitions.

        // let adjustedRadiusList = [...inputs.radiusList];
        // radius list does not need to be adjusted

        // Closed shapes start corners differently on the connection of the first corner, so we need to readjust the edges
        let wireTouse = this.edgesService.fixEdgeOrientationsAlongWire({ shape: inputs.shape });
        if (useRadiusList && inputs.shape.Closed_1()) {
            const edgesOfWire = this.edgesService.getEdgesAlongWire({ shape: inputs.shape });
            const firstEdge = edgesOfWire.shift();
            const adjustEdges = [...edgesOfWire, firstEdge];
            wireTouse = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: adjustEdges });
        } else {
            wireTouse = this.converterService.getActualTypeOfShape(inputs.shape.Reversed());
        }
        const extrusion = this.operationsService.extrude({ shape: wireTouse, direction: inputs.direction });

        let adjustedIndexes = inputs.indexes;
        if (useRadiusList) {
            // So original indexes are based on the number of corners between edges. These corner indexes are used as an input, but extrusion creates 3D edges
            // with different indexes, so we need to adjust the indexes to match the 3D edges.

            // the original indexes are [3, 4, 5, 6, 7, 8, 9, 10, 11, ...]
            // the order is [5, 8, 11, 14, 17, 20, 23, 26, 29, ...]
            // this is needed because of the way edge indexes are made on such shapes
            const filteredEnd = inputs.indexes.filter(i => i > 2);
            const maxNr = Math.max(...filteredEnd);

            const adjacentList = [5];
            let lastNr = 5;
            for (let i = 0; i < maxNr; i++) {
                lastNr += 3;
                adjacentList.push(lastNr);
            }

            adjustedIndexes = inputs.indexes.map((index) => {
                if (inputs.shape.Closed_1()) {
                    if (index <= 2) {
                        return index;
                    } else {
                        return adjacentList[index - 3];
                    }
                } else {
                    if (index === 1) {
                        return 2;
                    } else {
                        return adjacentList[index - 2];
                    }
                }
            });
        }

        const filletShape = this.filletEdges({ shape: extrusion, radius: inputs.radius, indexes: adjustedIndexes, radiusList: inputs.radiusList }) as TopoDS_Shape;

        const faceEdges: TopoDS_Edge[] = [];
        const faces = this.shapeGettersService.getFaces({ shape: filletShape });
        faces.forEach((f, i) => {
            // due to reversal of wire in the beginning this is stable index now
            // also we need to translate these edges back along direction
            const edgeToAdd = this.shapeGettersService.getEdges({ shape: f })[3];
            faceEdges.push(edgeToAdd);
        });

        const res = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: faceEdges });
        const result = this.transformsService.translate({ shape: res, translation: inputs.direction.map(s => -s) as Base.Vector3 });
        extrusion.delete();
        filletShape.delete();
        faces.forEach(f => f.delete());
        faceEdges.forEach(e => e.delete());
        return result;
    }
}