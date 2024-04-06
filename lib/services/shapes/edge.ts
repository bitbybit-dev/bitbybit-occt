import { GccEnt_Position, Geom2d_Curve, Geom_Surface, OpenCascadeInstance, TopoDS_Edge, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper, typeSpecificityEnum } from "../../occ-helper";
import * as Inputs from "../../api/inputs/inputs";

export class OCCTEdge {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.CurveAndSurfaceDto<Geom2d_Curve, Geom_Surface>) {
        const curve2d = new this.occ.Handle_Geom2d_Curve_2(inputs.curve as Geom2d_Curve);
        const surface = new this.occ.Handle_Geom_Surface_2(inputs.surface as Geom_Surface);
        const makeEdge = new this.occ.BRepBuilderAPI_MakeEdge_30(curve2d, surface);
        const shape = makeEdge.Shape();
        const result = this.och.getActualTypeOfShape(shape);
        curve2d.delete();
        surface.delete();
        makeEdge.delete();
        shape.delete();
        return result;
    }

    line(inputs: Inputs.OCCT.LineDto) {
        return this.och.lineEdge(inputs);
    }

    arcThroughThreePoints(inputs: Inputs.OCCT.ArcEdgeThreePointsDto) {
        const gpPnt1 = this.och.gpPnt(inputs.start);
        const gpPnt2 = this.och.gpPnt(inputs.middle);
        const gpPnt3 = this.och.gpPnt(inputs.end);
        const segment = new this.occ.GC_MakeArcOfCircle_4(gpPnt1, gpPnt2, gpPnt3);
        const hcurve = new this.occ.Handle_Geom_Curve_2(segment.Value().get());
        const makeEdge = new this.occ.BRepBuilderAPI_MakeEdge_24(hcurve);
        const shape = makeEdge.Edge();
        gpPnt1.delete();
        gpPnt2.delete();
        gpPnt3.delete();
        segment.delete();
        hcurve.delete();
        makeEdge.delete();
        return shape;
    }

    arcThroughTwoPointsAndTangent(inputs: Inputs.OCCT.ArcEdgeTwoPointsTangentDto) {
        const gpPnt1 = this.och.gpPnt(inputs.start);
        const gpVec = this.och.gpVec(inputs.tangentVec);
        const gpPnt2 = this.och.gpPnt(inputs.end);
        const segment = new this.occ.GC_MakeArcOfCircle_5(gpPnt1, gpVec, gpPnt2);
        const hcurve = new this.occ.Handle_Geom_Curve_2(segment.Value().get());
        const makeEdge = new this.occ.BRepBuilderAPI_MakeEdge_24(hcurve);
        const shape = makeEdge.Edge();
        gpPnt1.delete();
        gpVec.delete();
        gpPnt2.delete();
        segment.delete();
        hcurve.delete();
        makeEdge.delete();
        return shape;
    }

    arcFromCircleAndTwoPoints(inputs: Inputs.OCCT.ArcEdgeCircleTwoPointsDto<TopoDS_Edge>) {
        return this.och.arcFromCircleAndTwoPoints(inputs);
    }

    arcFromCircleAndTwoAngles(inputs: Inputs.OCCT.ArcEdgeCircleTwoAnglesDto<TopoDS_Edge>) {
        const circle = this.och.getGpCircleFromEdge({ shape: inputs.circle });
        const radAlpha1 = this.och.vecHelper.degToRad(inputs.alphaAngle1);
        const radAlpha2 = this.och.vecHelper.degToRad(inputs.alphaAngle2);
        const arc = new this.occ.GC_MakeArcOfCircle_1(circle, radAlpha1, radAlpha2, inputs.sense);
        const hcurve = new this.occ.Handle_Geom_Curve_2(arc.Value().get());
        const makeEdge = new this.occ.BRepBuilderAPI_MakeEdge_24(hcurve);
        const shape = makeEdge.Edge();
        circle.delete();
        arc.delete();
        hcurve.delete();
        makeEdge.delete();
        return shape;
    }

    arcFromCirclePointAndAngle(inputs: Inputs.OCCT.ArcEdgeCirclePointAngleDto<TopoDS_Edge>) {
        const circle = this.och.getGpCircleFromEdge({ shape: inputs.circle });
        const radAlpha = this.och.vecHelper.degToRad(inputs.alphaAngle);
        const point = this.och.gpPnt(inputs.point);
        const arc = new this.occ.GC_MakeArcOfCircle_2(circle, point, radAlpha, inputs.sense);
        const hcurve = new this.occ.Handle_Geom_Curve_2(arc.Value().get());
        const makeEdge = new this.occ.BRepBuilderAPI_MakeEdge_24(hcurve);
        const shape = makeEdge.Edge();
        circle.delete();
        arc.delete();
        point.delete();
        hcurve.delete();
        makeEdge.delete();
        return shape;
    }

    createCircleEdge(inputs: Inputs.OCCT.CircleDto) {
        return this.och.createCircle(inputs.radius, inputs.center, inputs.direction, typeSpecificityEnum.edge) as TopoDS_Edge;
    }

    createEllipseEdge(inputs: Inputs.OCCT.EllipseDto) {
        return this.och.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, typeSpecificityEnum.edge) as TopoDS_Edge;
    }

    removeInternalEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(inputs.shape, true, true, false);
        fusor.Build();
        const shape = fusor.Shape();
        fusor.delete();
        return shape;
    }

    getEdge(inputs: Inputs.OCCT.EdgeIndexDto<TopoDS_Shape>): TopoDS_Edge {
        if (!inputs.shape || (inputs.shape.ShapeType && inputs.shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_WIRE) || inputs.shape.IsNull()) {
            throw (new Error("Edge can not be found for shape that is not provided or is of incorrect type"));
        }
        if (!inputs.index) { inputs.index = 0; }
        let innerEdge = {};
        let foundEdge = false;
        this.och.forEachEdge(inputs.shape, (i: number, s: TopoDS_Edge) => {
            if (i === inputs.index) {
                innerEdge = s;
                foundEdge = true;
            }
        });

        if (!foundEdge) {
            throw (new Error(`Edge can not be found for shape on index ${inputs.index}`));
        } else {
            return innerEdge as TopoDS_Edge;
        }
    }

    edgesToPoints(inputs: Inputs.OCCT.EdgesToPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        return this.och.edgesToPoints(inputs);
    }

    reversedEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): TopoDS_Edge {
        const edge: TopoDS_Edge = inputs.shape;
        const reversed = edge.Reversed();
        const result = this.och.getActualTypeOfShape(reversed);
        reversed.delete();
        return result;
    }

    pointOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.pointOnEdgeAtParam(inputs);
    }

    tangentOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Inputs.Base.Vector3 {
        return this.och.tangentOnEdgeAtParam(inputs);
    }

    startPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.startPointOnEdge({ ...inputs });
    }

    endPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.endPointOnEdge({ ...inputs });
    }

    pointOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.pointOnEdgeAtLength(inputs);
    }

    tangentOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Inputs.Base.Vector3 {
        return this.och.tangentOnEdgeAtLength(inputs);
    }

    divideEdgeByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return this.och.divideEdgeByParamsToPoints(inputs);
    }

    divideEdgeByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return this.och.divideEdgeByEqualDistanceToPoints(inputs);
    }

    getEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        return this.och.getEdges(inputs);
    }

    getEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>) {
        return this.och.getEdgesAlongWire(inputs);
    }

    getCircularEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Edge[] {
        return this.och.getCircularEdgesAlongWire(inputs);
    }

    getLinearEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Edge[] {
        return this.och.getLinearEdgesAlongWire(inputs);
    }

    getEdgeLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): number {
        return this.och.getEdgeLength(inputs);
    }

    getEdgesLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): number[] {
        return this.och.getEdgesLengths(inputs);
    }

    getEdgeCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.getLinearCenterOfMass(inputs);
    }

    getEdgesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return this.och.getShapesCentersOfMass(inputs);
    }

    getCornerPointsOfEdgesForShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        const points = this.och.getCornerPointsOfEdgesForShape(inputs);
        return points;
    }

    getCircularEdgeCenterPoint(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.getCircularEdgeCenterPoint(inputs);
    }

    getCircularEdgeRadius(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): number {
        return this.och.getCircularEdgeRadius(inputs);
    }

    getCircularEdgePlaneDirection(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Vector3 {
        return this.och.getCircularEdgePlaneDirection(inputs);
    }

    constraintTanLinesFromTwoPtsToCircle(inputs: Inputs.OCCT.ConstraintTanLinesFromTwoPtsToCircleDto<TopoDS_Edge>): TopoDS_Shape[] {
        const cirDir = this.getCircularEdgePlaneDirection({ shape: inputs.circle });
        const cirPos = this.getCircularEdgeCenterPoint({ shape: inputs.circle });

        const alignOpt = new Inputs.OCCT.AlignDto<TopoDS_Shape>();
        alignOpt.fromDirection = cirDir;
        alignOpt.toDirection = [0, 0, 1];
        alignOpt.fromOrigin = cirPos;
        alignOpt.toOrigin = [0, 0, 0];
        alignOpt.shape = inputs.circle;
        const circleAligned = this.och.align(alignOpt);
        const ptVertex1 = this.och.makeVertex(inputs.point1);
        alignOpt.shape = ptVertex1;
        const ptVertex1Aligned = this.och.align(alignOpt);
        ptVertex1.delete();
        const pt1Aligned = this.och.vertexToPoint({ shape: ptVertex1Aligned });
        ptVertex1Aligned.delete();
        const pt2d1 = this.och.gpPnt2d([pt1Aligned[0], pt1Aligned[1]]);

        const ptVertex2 = this.och.makeVertex(inputs.point2);
        alignOpt.shape = ptVertex2;
        const ptVertex2Aligned = this.och.align(alignOpt);
        ptVertex2.delete();
        const pt2Aligned = this.och.vertexToPoint({ shape: ptVertex2Aligned });
        ptVertex2Aligned.delete();
        const pt2d2 = this.och.gpPnt2d([pt2Aligned[0], pt2Aligned[1]]);

        const circle = this.och.getGpCircle2dFromEdge({ shape: circleAligned });
        circleAligned.delete();
        const qCircle = new this.occ.GccEnt_QualifiedCirc(circle, this.och.getGccEntPositionFromEnum(Inputs.OCCT.gccEntPositionEnum.unqualified));
        circle.delete();

        const lin1 = new this.occ.GccAna_Lin2d2Tan_2(qCircle, pt2d1, inputs.tolerance);
        const lin2 = new this.occ.GccAna_Lin2d2Tan_2(qCircle, pt2d2, inputs.tolerance);

        qCircle.delete();
        const solutions1 = [];

        for (let i = 1; i <= lin1.NbSolutions(); i++) {
            const sol = lin1.ThisSolution(i);
            const location = sol.Location();
            const edgeLine = this.line({ start: [location.X(), location.Y(), 0], end: pt1Aligned });
            alignOpt.fromDirection = [0, 0, 1];
            alignOpt.toDirection = cirDir;
            alignOpt.fromOrigin = [0, 0, 0];
            alignOpt.toOrigin = cirPos;
            alignOpt.shape = edgeLine;
            const aligned = this.och.align(alignOpt);
            solutions1.push(aligned);
            sol.delete();
            location.delete();
            edgeLine.delete();
        }
        lin1.delete();

        const solutions2 = [];

        for (let i = 1; i <= lin2.NbSolutions(); i++) {
            const sol = lin2.ThisSolution(i);
            const location = sol.Location();
            const edgeLine = this.line({ start: [location.X(), location.Y(), 0], end: pt2Aligned });
            alignOpt.fromDirection = [0, 0, 1];
            alignOpt.toDirection = cirDir;
            alignOpt.fromOrigin = [0, 0, 0];
            alignOpt.toOrigin = cirPos;
            alignOpt.shape = edgeLine;
            const aligned = this.och.align(alignOpt);
            solutions2.push(aligned);
            sol.delete();
            location.delete();
            edgeLine.delete();
        }
        lin2.delete();

        let resultingSol = [];
        if (inputs.positionResult === Inputs.OCCT.positionResultEnum.all) {
            resultingSol = [...solutions1, ...solutions2];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
            resultingSol = [solutions1[1], solutions2[0]];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2) {
            resultingSol = [solutions1[0], solutions2[1]];
        } else {
            resultingSol = [...solutions1, ...solutions2];
        }

        if (resultingSol.length === 2 && inputs.circleRemainder !== Inputs.OCCT.circleInclusionEnum.none) {
            let startPoint;
            let endPoint;
            if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2) {
                if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide1) {
                    startPoint = this.startPointOnEdge({ shape: resultingSol[1] });
                    endPoint = this.startPointOnEdge({ shape: resultingSol[0] });
                } else if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide2) {
                    startPoint = this.startPointOnEdge({ shape: resultingSol[0] });
                    endPoint = this.startPointOnEdge({ shape: resultingSol[1] });
                }
            } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
                if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide1) {
                    startPoint = this.startPointOnEdge({ shape: resultingSol[0] });
                    endPoint = this.startPointOnEdge({ shape: resultingSol[1] });
                } else if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide2) {
                    startPoint = this.startPointOnEdge({ shape: resultingSol[1] });
                    endPoint = this.startPointOnEdge({ shape: resultingSol[0] });
                }
            }

            const edge = this.arcFromCircleAndTwoPoints({ circle: inputs.circle, start: startPoint, end: endPoint, sense: true });
            resultingSol.splice(1, 0, edge);
        }

        return resultingSol;
    }

    constraintTanLinesFromPtToCircle(inputs: Inputs.OCCT.ConstraintTanLinesFromPtToCircleDto<TopoDS_Edge>): TopoDS_Shape[] {
        const cirDir = this.getCircularEdgePlaneDirection({ shape: inputs.circle });
        const cirPos = this.getCircularEdgeCenterPoint({ shape: inputs.circle });

        const alignOpt = new Inputs.OCCT.AlignDto<TopoDS_Shape>();
        alignOpt.fromDirection = cirDir;
        alignOpt.toDirection = [0, 0, 1];
        alignOpt.fromOrigin = cirPos;
        alignOpt.toOrigin = [0, 0, 0];
        alignOpt.shape = inputs.circle;
        const circleAligned = this.och.align(alignOpt);
        const ptVertex = this.och.makeVertex(inputs.point);
        alignOpt.shape = ptVertex;
        const ptVertexAligned = this.och.align(alignOpt);
        ptVertex.delete();
        const ptAligned = this.och.vertexToPoint({ shape: ptVertexAligned });
        ptVertexAligned.delete();
        const pt2d = this.och.gpPnt2d([ptAligned[0], ptAligned[1]]);
        const circle = this.och.getGpCircle2dFromEdge({ shape: circleAligned });
        circleAligned.delete();
        const qCircle = new this.occ.GccEnt_QualifiedCirc(circle, this.och.getGccEntPositionFromEnum(Inputs.OCCT.gccEntPositionEnum.unqualified));
        circle.delete();
        const lin = new this.occ.GccAna_Lin2d2Tan_2(qCircle, pt2d, inputs.tolerance);
        qCircle.delete();
        const solutions = [];
        for (let i = 1; i <= lin.NbSolutions(); i++) {
            const sol = lin.ThisSolution(i);
            const location = sol.Location();
            const edgeLine = this.line({ start: [location.X(), location.Y(), 0], end: ptAligned });
            alignOpt.fromDirection = [0, 0, 1];
            alignOpt.toDirection = cirDir;
            alignOpt.fromOrigin = [0, 0, 0];
            alignOpt.toOrigin = cirPos;
            alignOpt.shape = edgeLine;
            const aligned = this.och.align(alignOpt);
            solutions.push(aligned);
            sol.delete();
            location.delete();
            edgeLine.delete();
        }
        lin.delete();

        let resultingSol = [];
        if (inputs.positionResult === Inputs.OCCT.positionResultEnum.all) {
            resultingSol = [...solutions];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
            resultingSol = [solutions[0]];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2) {
            resultingSol = [solutions[1]];
        } else {
            resultingSol = [...solutions];
        }

        if (resultingSol.length === 2 && inputs.circleRemainder !== Inputs.OCCT.circleInclusionEnum.none) {
            let startPoint;
            let endPoint;
            if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide1) {
                startPoint = this.startPointOnEdge({ shape: resultingSol[1] });
                endPoint = this.startPointOnEdge({ shape: resultingSol[0] });
            } else if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide2) {
                startPoint = this.startPointOnEdge({ shape: resultingSol[0] });
                endPoint = this.startPointOnEdge({ shape: resultingSol[1] });
            }
            const edge = this.arcFromCircleAndTwoPoints({ circle: inputs.circle, start: startPoint, end: endPoint, sense: true });
            resultingSol.splice(1, 0, edge);
        }

        return resultingSol;
    }

    constraintTanLinesOnTwoCircles(inputs: Inputs.OCCT.ConstraintTanLinesOnTwoCirclesDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.constraintTanLinesOnTwoCircles(inputs);
    }

    constraintTanCirclesOnTwoCircles(inputs: Inputs.OCCT.ConstraintTanCirclesOnTwoCirclesDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.constraintTanCirclesOnTwoCircles(inputs);
    }

    constraintTanCirclesOnCircleAndPnt(inputs: Inputs.OCCT.ConstraintTanCirclesOnCircleAndPntDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.constraintTanCirclesOnCircleAndPnt(inputs);
    }
}
