import { Geom2d_Curve, Geom_Surface, OpenCascadeInstance, TopoDS_Edge, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs/inputs";

export class OCCTEdge {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.CurveAndSurfaceDto<Geom2d_Curve, Geom_Surface>) {
        return this.och.edgesService.makeEdgeFromGeom2dCurveAndSurface(inputs);
    }

    line(inputs: Inputs.OCCT.LineDto) {
        return this.och.edgesService.lineEdge(inputs);
    }

    arcThroughThreePoints(inputs: Inputs.OCCT.ArcEdgeThreePointsDto) {
        return this.och.edgesService.arcThroughThreePoints(inputs);
    }

    arcThroughTwoPointsAndTangent(inputs: Inputs.OCCT.ArcEdgeTwoPointsTangentDto) {
        return this.och.edgesService.arcThroughTwoPointsAndTangent(inputs);
    }

    arcFromCircleAndTwoPoints(inputs: Inputs.OCCT.ArcEdgeCircleTwoPointsDto<TopoDS_Edge>) {
        return this.och.edgesService.arcFromCircleAndTwoPoints(inputs);
    }

    arcFromCircleAndTwoAngles(inputs: Inputs.OCCT.ArcEdgeCircleTwoAnglesDto<TopoDS_Edge>) {
        return this.och.edgesService.arcFromCircleAndTwoAngles(inputs);
    }

    arcFromCirclePointAndAngle(inputs: Inputs.OCCT.ArcEdgeCirclePointAngleDto<TopoDS_Edge>) {
        return this.och.edgesService.arcFromCirclePointAndAngle(inputs);
    }

    createCircleEdge(inputs: Inputs.OCCT.CircleDto) {
        return this.och.entitiesService.createCircle(inputs.radius, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.edge) as TopoDS_Edge;
    }

    createEllipseEdge(inputs: Inputs.OCCT.EllipseDto) {
        return this.och.entitiesService.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.edge) as TopoDS_Edge;
    }

    removeInternalEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(inputs.shape, true, true, false);
        fusor.Build();
        const shape = fusor.Shape();
        fusor.delete();
        return shape;
    }

    getEdge(inputs: Inputs.OCCT.EdgeIndexDto<TopoDS_Shape>): TopoDS_Edge {
        return this.och.shapeGettersService.getEdge(inputs);
    }

    edgesToPoints(inputs: Inputs.OCCT.EdgesToPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        return this.och.edgesService.edgesToPoints(inputs);
    }

    reversedEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): TopoDS_Edge {
        const edge: TopoDS_Edge = inputs.shape;
        const reversed = edge.Reversed();
        const result = this.och.converterService.getActualTypeOfShape(reversed);
        reversed.delete();
        return result;
    }

    pointOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.edgesService.pointOnEdgeAtParam(inputs);
    }

    tangentOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Inputs.Base.Vector3 {
        return this.och.edgesService.tangentOnEdgeAtParam(inputs);
    }

    startPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.edgesService.startPointOnEdge(inputs);
    }

    endPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.edgesService.endPointOnEdge(inputs);
    }

    pointOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.edgesService.pointOnEdgeAtLength(inputs);
    }

    tangentOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Inputs.Base.Vector3 {
        return this.och.edgesService.tangentOnEdgeAtLength(inputs);
    }

    divideEdgeByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return this.och.edgesService.divideEdgeByParamsToPoints(inputs);
    }

    divideEdgeByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return this.och.edgesService.divideEdgeByEqualDistanceToPoints(inputs);
    }

    getEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        return this.och.shapeGettersService.getEdges(inputs);
    }

    getEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>) {
        return this.och.edgesService.getEdgesAlongWire(inputs);
    }

    getCircularEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Edge[] {
        return this.och.edgesService.getCircularEdgesAlongWire(inputs);
    }

    getLinearEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Edge[] {
        return this.och.edgesService.getLinearEdgesAlongWire(inputs);
    }

    getEdgeLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): number {
        return this.och.edgesService.getEdgeLength(inputs);
    }

    getEdgesLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): number[] {
        return this.och.edgesService.getEdgesLengths(inputs);
    }

    getEdgeCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.geomService.getLinearCenterOfMass(inputs);
    }

    getEdgesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return this.och.edgesService.getEdgesCentersOfMass(inputs);
    }

    getCornerPointsOfEdgesForShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.edgesService.getCornerPointsOfEdgesForShape(inputs);
    }

    getCircularEdgeCenterPoint(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.edgesService.getCircularEdgeCenterPoint(inputs);
    }

    getCircularEdgeRadius(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): number {
        return this.och.edgesService.getCircularEdgeRadius(inputs);
    }

    getCircularEdgePlaneDirection(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Vector3 {
        return this.och.edgesService.getCircularEdgePlaneDirection(inputs);
    }

    constraintTanLinesFromTwoPtsToCircle(inputs: Inputs.OCCT.ConstraintTanLinesFromTwoPtsToCircleDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.edgesService.constraintTanLinesFromTwoPtsToCircle(inputs);
    }

    constraintTanLinesFromPtToCircle(inputs: Inputs.OCCT.ConstraintTanLinesFromPtToCircleDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.edgesService.constraintTanLinesFromPtToCircle(inputs);
    }

    constraintTanLinesOnTwoCircles(inputs: Inputs.OCCT.ConstraintTanLinesOnTwoCirclesDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.edgesService.constraintTanLinesOnTwoCircles(inputs);
    }

    constraintTanCirclesOnTwoCircles(inputs: Inputs.OCCT.ConstraintTanCirclesOnTwoCirclesDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.edgesService.constraintTanCirclesOnTwoCircles(inputs);
    }

    constraintTanCirclesOnCircleAndPnt(inputs: Inputs.OCCT.ConstraintTanCirclesOnCircleAndPntDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.edgesService.constraintTanCirclesOnCircleAndPnt(inputs);
    }
}
