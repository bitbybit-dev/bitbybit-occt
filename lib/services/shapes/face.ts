import { Geom_Surface, OpenCascadeInstance, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs/inputs";
import { Base } from "../../api/inputs/inputs";

export class OCCTFace {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    createFaceFromWire(inputs: Inputs.OCCT.FaceFromWireDto<TopoDS_Wire>): TopoDS_Face {
        return this.och.facesService.createFaceFromWire(inputs);
    }

    createFaceFromWireOnFace(inputs: Inputs.OCCT.FaceFromWireOnFaceDto<TopoDS_Face, TopoDS_Wire>): TopoDS_Face {
        return this.och.facesService.createFaceFromWireOnFace(inputs);
    }

    createFacesFromWiresOnFace(inputs: Inputs.OCCT.FacesFromWiresOnFaceDto<TopoDS_Face, TopoDS_Wire>): TopoDS_Face[] {
        return this.och.facesService.createFacesFromWiresOnFace(inputs);
    }

    createFaceFromWires(inputs: Inputs.OCCT.FacesFromWiresDto<TopoDS_Wire>): TopoDS_Face {
        return this.och.facesService.createFaceFromWires(inputs);
    }

    createFacesFromWires(inputs: Inputs.OCCT.FacesFromWiresDto<TopoDS_Wire>): TopoDS_Face[] {
        return this.och.facesService.createFacesFromWires(inputs);
    }

    faceFromSurface(inputs: Inputs.OCCT.ShapeWithToleranceDto<Geom_Surface>) {
        return this.och.facesService.faceFromSurface(inputs);
    }

    faceFromSurfaceAndWire(inputs: Inputs.OCCT.FaceFromSurfaceAndWireDto<Geom_Surface, TopoDS_Wire>) {
        return this.och.facesService.faceFromSurfaceAndWire(inputs);
    }

    getUMinBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.facesService.getUMinBound(inputs);
    }

    getUMaxBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.facesService.getUMaxBound(inputs);
    }

    getVMinBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.facesService.getVMinBound(inputs);
    }

    getVMaxBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.facesService.getVMaxBound(inputs);
    }

    subdivideToPointsControlled(inputs: Inputs.OCCT.FaceSubdivisionControlledDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.subdivideToPointsControlled(inputs);
    }

    subdivideToPoints(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.subdivideToPoints(inputs);
    }

    subdivideToWires(inputs: Inputs.OCCT.FaceSubdivisionToWiresDto<TopoDS_Face>): TopoDS_Wire[] {
        return this.och.facesService.subdivideToWires(inputs);
    }

    subdivideToRectangleWires(inputs: Inputs.OCCT.FaceSubdivisionToRectanglesDto<TopoDS_Face>): TopoDS_Wire[] {
        return this.och.facesService.subdivideToRectangleWires(inputs);
    }

    subdivideToRectangleHoles(inputs: Inputs.OCCT.FaceSubdivisionToRectanglesDto<TopoDS_Face>): TopoDS_Face[] {
        return this.och.facesService.subdivideToRectangleHoles(inputs);
    }

    subdivideToNormals(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.subdivideToNormals(inputs);
    }

    subdivideToPointsOnParam(inputs: Inputs.OCCT.FaceLinearSubdivisionDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.subdivideToPointsOnParam(inputs);
    }

    wireAlongParam(inputs: Inputs.OCCT.WireAlongParamDto<TopoDS_Face>): TopoDS_Wire {
        return this.och.facesService.wireAlongParam(inputs);
    }

    wiresAlongParams(inputs: Inputs.OCCT.WiresAlongParamsDto<TopoDS_Face>): TopoDS_Wire[] {
        return this.och.facesService.wiresAlongParams(inputs);
    }

    subdivideToUVOnParam(inputs: Inputs.OCCT.FaceLinearSubdivisionDto<TopoDS_Face>): Base.Point2[] {
        return this.och.facesService.subdivideToUVOnParam(inputs);
    }

    subdivideToUV(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Point2[] {
        return this.och.facesService.subdivideToUV(inputs);
    }

    uvOnFace(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>): Base.Point2 {
        return this.och.facesService.uvOnFace(inputs);
    }

    pointsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.pointsOnUVs(inputs);
    }

    normalsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<TopoDS_Face>): Base.Vector3[] {
        return this.och.facesService.normalsOnUVs(inputs);
    }

    pointOnUV(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>): Base.Point3 {
        return this.och.facesService.pointOnUV(inputs);
    }

    normalOnUV(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>): Base.Vector3 {
        return this.och.facesService.faceNormalOnUV(inputs);
    }

    createPolygonFace(inputs: Inputs.OCCT.PolygonDto) {
        return this.och.facesService.createPolygonFace(inputs);
    }

    createCircleFace(inputs: Inputs.OCCT.CircleDto): TopoDS_Face {
        return this.och.entitiesService.createCircle(inputs.radius, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.face) as TopoDS_Face;
    }

    createEllipseFace(inputs: Inputs.OCCT.EllipseDto): TopoDS_Face {
        return this.och.entitiesService.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.face) as TopoDS_Face;
    }

    createSquareFace(inputs: Inputs.OCCT.SquareDto): TopoDS_Face {
        return this.och.facesService.createSquareFace(inputs);
    }

    createRectangleFace(inputs: Inputs.OCCT.RectangleDto): TopoDS_Face {
        return this.och.facesService.createRectangleFace(inputs);
    }

    createFaceFromMultipleCircleTanWireCollections(inputs: Inputs.OCCT.FaceFromMultipleCircleTanWireCollectionsDto<TopoDS_Wire>): TopoDS_Shape {
        return this.och.facesService.createFaceFromMultipleCircleTanWireCollections(inputs);
    }

    createFaceFromMultipleCircleTanWires(inputs: Inputs.OCCT.FaceFromMultipleCircleTanWiresDto<TopoDS_Wire>): TopoDS_Shape {
        return this.och.facesService.createFaceFromMultipleCircleTanWires(inputs);
    }

    getFace(inputs: Inputs.OCCT.ShapeIndexDto<TopoDS_Shape>): TopoDS_Face {
        return this.och.shapeGettersService.getFace(inputs);
    }

    getFaces(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Face[] {
        return this.och.shapeGettersService.getFaces(inputs);
    }

    reversedFace(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): TopoDS_Face {
        const face = inputs.shape as TopoDS_Face;
        const reversed = face.Reversed();
        const result = this.och.converterService.getActualTypeOfShape(reversed);
        reversed.delete();
        return result;
    }

    getFaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.facesService.getFaceArea(inputs);
    }

    getFacesAreas(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): number[] {
        return this.och.facesService.getFacesAreas(inputs);
    }

    getFaceCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): Base.Point3 {
        return this.och.facesService.getFaceCenterOfMass(inputs);
    }

    getFacesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.getFacesCentersOfMass(inputs);
    }

    filterFacePoints(inputs: Inputs.OCCT.FilterFacePointsDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.filterFacePoints(inputs);
    }
}
