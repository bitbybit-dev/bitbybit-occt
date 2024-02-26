/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./inputs";

export namespace OCCT {

    export type GeomCurvePointer = { hash: number, type: string };
    export type Geom2dCurvePointer = { hash: number, type: string };
    export type GeomSurfacePointer = { hash: number, type: string };
    export type TopoDSVertexPointer = { hash: number, type: string };
    export type TopoDSEdgePointer = { hash: number, type: string };
    export type TopoDSWirePointer = { hash: number, type: string };
    export type TopoDSFacePointer = { hash: number, type: string };
    export type TopoDSShellPointer = { hash: number, type: string };
    export type TopoDSSolidPointer = { hash: number, type: string };
    export type TopoDSCompSolidPointer = { hash: number, type: string };
    export type TopoDSCompoundPointer = { hash: number, type: string };

    export type TopoDSShapePointer = TopoDSVertexPointer | TopoDSEdgePointer | TopoDSWirePointer | TopoDSFacePointer | TopoDSShellPointer | TopoDSSolidPointer | TopoDSCompoundPointer;

    export enum joinTypeEnum {
        arc = "arc",
        intersection = "intersection",
        tangent = "tangent"
    }
    export enum bRepOffsetModeEnum {
        skin = "skin",
        pipe = "pipe",
        rectoVerso = "rectoVerso"
    }
    export enum approxParametrizationTypeEnum {
        approxChordLength = "approxChordLength",
        approxCentripetal = "approxCentripetal",
        approxIsoParametric = "approxIsoParametric"
    }
    export enum directionEnum {
        outside = "outside",
        inside = "inside",
        middle = "middle"
    }
    export enum fileTypeEnum {
        iges = "iges",
        step = "step"
    }
    export enum topAbsOrientationEnum {
        forward = "forward",
        reversed = "reversed",
        internal = "internal",
        external = "external"
    }
    export enum topAbsStateEnum {
        in = "in",
        out = "out",
        on = "on",
        unknown = "unknown"
    }
    export enum shapeTypeEnum {
        unknown = "unknown",
        vertex = "vertex",
        edge = "edge",
        wire = "wire",
        face = "face",
        shell = "shell",
        solid = "solid",
        compSolid = "compSolid",
        compound = "compound",
        shape = "shape",
    }

    export class DecomposedMeshDto {
        /**
         * Face list
         */
        faceList: DecomposedFaceDto[];
        /**
         * Edge list
         */
        edgeList: DecomposedEdgeDto[];
    }

    export class DecomposedFaceDto {
        face_index: number;
        normal_coord: number[];
        number_of_triangles: number;
        tri_indexes: number[];
        vertex_coord: number[];
        vertex_coord_vec: Base.Vector3[];
        uvs: number[];
    }
    export class DecomposedEdgeDto {
        edge_index: number;
        vertex_coord: Base.Vector3[];
    }
    export class ShapesDto<T> {
        constructor(shapes?: T[]) {
            this.shapes = shapes;
        }
        /**
         * The OCCT shapes
         * @default undefined
         */
        shapes?: T[];
    }
    export class CurveAndSurfaceDto<T, U>{
        /**
         * Curve
         * @default undefined
         */
        curve: T;
        /**
         * Surface
         * @default undefined
         */
        surface: U;
    }
    export class FilletTwoEdgesInPlaneDto<T> extends ShapesDto<T> {
        /**
         * First OCCT edge to fillet
         * @default undefined
         */
        edge1: T;
        /**
         * Second OCCT edge to fillet
         * @default undefined
         */
        edge2: T;
        /**
         * Plane origin that is also used to find the closest solution if two solutions exist.
         * @default [0, 0, 0]
         */
        planeOrigin: Base.Point3 = [0, 0, 0];
        /**
         * Plane direction for fillet
         * @default [0, 1, 0]
         */
        planeDirection: Base.Vector3 = [0, 1, 0];
        /**
         * Radius of the fillet
         * @default 0.3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 0.3;
        /**
         * if solution is -1 planeOrigin chooses a particular fillet in case of several fillets may be constructed (for example, a circle intersecting a segment in 2 points). Put the intersecting (or common) point of the edges
         * @default -1
         * @optional true
         */
        solution? = -1;
    }
    export class ClosestPointsOnShapeFromPointsDto<T> {
        /**
         * The OCCT shape
         * @default undefined
         */
        shape: T;
        /**
         * The list of points
         * @default undefined
         */
        points: Base.Point3[];
    }
    export class SplitWireOnPointsDto<T>{
        /**
         * The OCCT wire shape
         * @default undefined
         */
        shape: T;
        /**
         * The list of points
         * @default undefined
         */
        points: Base.Point3[];
    }

    export class ClosestPointsOnShapesFromPointsDto<T> {
        /**
         * The OCCT shapes
         * @default undefined
         */
        shapes: T[];
        /**
         * The list of points
         * @default undefined
         */
        points: Base.Point3[];
    }
    export class ClosestPointsBetweenTwoShapesDto<T> extends ShapesDto<T> {
        constructor(shape1?: T, shape2?: T) {
            if (shape1 && shape2) {
                super([shape1, shape2]);
            }
        }
        /**
         * First OCCT shape
         * @default undefined
         */
        shape1?: T;
        /**
        * Second OCCT shape
        * @default undefined
        */
        shape2?: T;
    }
    export class FaceFromSurfaceAndWireDto<T, U> extends ShapesDto<T> {
        /**
         * Surface from which to create a face
         * @default undefined
         */
        surface?: T;
        /**
         * Wire that represents a boundary on the surface to delimit the face
         * @default undefined
         */
        wire?: U;
        /**
         * Indicates wether face should be created inside or outside the wire
         * @default true
         */
        inside = true;
    }
    export class WireOnFaceDto<T, U> {
        /**
         * Wire to place on face
         * @default undefined
         */
        wire: T;
        /**
         * Face on which the wire will be placed
         * @default undefined
         */
        face: U;
    }
    export class DrawShapeDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shape?: T;
        /**
         * Face opacity value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        faceOpacity = 1;
        /**
         * Edge opacity value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        edgeOpacity = 1;
        /**
         * Hex colour string for the edges
         * @default #ffffff
         */
        edgeColour: Base.Color = "#ffffff";
        /**
         * Face material
         * @default undefined
         * @optional true
         */
        faceMaterial?: Base.Material;
        /**
         * Hex colour string for face colour
         * @default #ff0000
         */
        faceColour: Base.Color = "#ff0000";
        /**
         * Edge width
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        edgeWidth = 2;
        /**
         * You can turn off drawing of edges via this property
         * @default true
         */
        drawEdges = true;
        /**
         * You can turn off drawing of faces via this property
         * @default true
         */
        drawFaces = true;
        /**
         * Precision of the mesh that will be generated for the shape, lower number will mean more triangles
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        precision = 0.01;
        /**
         * Draw index of edges in space
         * @default false
         */
        drawEdgeIndexes = false;
        /**
         * Indicates the edge index height if they are drawn
         * @default 0.06
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        edgeIndexHeight = 0.06;
        /**
         * Edge index colour if the edges are drawn
         * @default #ff00ff
         */
        edgeIndexColour: Base.Color = "#ff00ff";
        /**
         * Draw indexes of faces in space
         * @default false
         */
        drawFaceIndexes = false;
        /**
         * Indicates the edge index height if they are drawn
         * @default 0.06
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        faceIndexHeight = 0.06;
        /**
         * Edge index colour if the edges are drawn
         * @default #0000ff
         */
        faceIndexColour: Base.Color = "#0000ff";
    }
    export class DrawShapesDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shapes?: T[]) {
            this.shapes = shapes;
        }
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shapes?: T[];
        /**
         * Face opacity value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        faceOpacity = 1;
        /**
         * Edge opacity value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        edgeOpacity = 1;
        /**
         * Hex colour string for the edges
         * @default #ffffff
         */
        edgeColour: Base.Color = "#ffffff";
        /**
         * Face material
         * @default undefined
         * @optional true
         */
        faceMaterial?: Base.Material;
        /**
         * Hex colour string for face colour
         * @default #ff0000
         */
        faceColour: Base.Color = "#ff0000";
        /**
         * Edge width
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        edgeWidth = 2;
        /**
         * You can turn off drawing of edges via this property
         * @default true
         */
        drawEdges = true;
        /**
         * You can turn off drawing of faces via this property
         * @default true
         */
        drawFaces = true;
        /**
         * Precision of the mesh that will be generated for the shape, lower number will mean more triangles
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        precision = 0.01;
        /**
         * Draw index of edges in space
         * @default false
         */
        drawEdgeIndexes = false;
        /**
         * Indicates the edge index height if they are drawn
         * @default 0.06
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        edgeIndexHeight = 0.06;
        /**
         * Edge index colour if the edges are drawn
         * @default #ff00ff
         */
        edgeIndexColour: Base.Color = "#ff00ff";
        /**
         * Draw indexes of faces in space
         * @default false
         */
        drawFaceIndexes = false;
        /**
         * Indicates the edge index height if they are drawn
         * @default 0.06
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        faceIndexHeight = 0.06;
        /**
         * Edge index colour if the edges are drawn
         * @default #0000ff
         */
        faceIndexColour: Base.Color = "#0000ff";
    }
    export class FaceSubdivisionDto<T> {
        /**
          * Provide options without default values
          */
        constructor(shape?: T, nrDivisionsU?: number, nrDivisionsV?: number, shiftHalfStepU?: boolean, removeStartEdgeU?: boolean, removeEndEdgeU?: boolean, shiftHalfStepV?: boolean, removeStartEdgeV?: boolean, removeEndEdgeV?: boolean) {
            this.shape ??= shape;
            this.nrDivisionsU ??= nrDivisionsU;
            this.nrDivisionsV ??= nrDivisionsV;
            this.shiftHalfStepU ??= shiftHalfStepU;
            this.removeStartEdgeU ??= removeStartEdgeU;
            this.removeEndEdgeU ??= removeEndEdgeU;
            this.shiftHalfStepV ??= shiftHalfStepV;
            this.removeStartEdgeV ??= removeStartEdgeV;
            this.removeEndEdgeV ??= removeEndEdgeV;
        }
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shape?: T;
        /**
         * Number of subdivisions on U direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrDivisionsU = 10;
        /**
         * Number of subdivisions on V direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrDivisionsV = 10;
        /**
         * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
         * @default false
         */
        shiftHalfStepU = false;
        /**
         * Removes start edge points on U
         * @default false
         */
        removeStartEdgeU = false;
        /**
         * Removes end edge points on U 
         * @default false
         */
        removeEndEdgeU = false;
        /**
         * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
         * @default false
         */
        shiftHalfStepV = false;
        /**
         * Removes start edge points on V
         * @default false
         */
        removeStartEdgeV = false;
        /**
         * Removes end edge points on V 
         * @default false
         */
        removeEndEdgeV = false;
    }
    export class FaceSubdivisionControlledDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shape?: T;
        /**
         * Number of subdivisions on U direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrDivisionsU = 10;
        /**
         * Number of subdivisions on V direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrDivisionsV = 10;
        /**
         * Shift half step every nth U row
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shiftHalfStepNthU = 0;
        /**
         * Offset for shift half step every nth U row
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shiftHalfStepUOffsetN = 0;
        /**
         * Removes start edge points on U
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeStartEdgeNthU = 0;
        /**
         * Offset for remove start edge points on U
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeStartEdgeUOffsetN = 0;
        /**
         * Removes end edge points on U 
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeEndEdgeNthU = 0;
        /**
         * Offset for remove end edge points on U
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeEndEdgeUOffsetN = 0;
        /**
         * Shift half step every nth V row
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shiftHalfStepNthV = 0;
        /**
         * Offset for shift half step every nth V row
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shiftHalfStepVOffsetN = 0;
        /**
         * Removes start edge points on V
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeStartEdgeNthV = 0;
        /**
         * Offset for remove start edge points on V
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeStartEdgeVOffsetN = 0;
        /**
         * Removes end edge points on V 
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeEndEdgeNthV = 0;
        /**
         * Offset for remove end edge points on V
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeEndEdgeVOffsetN = 0;
    }
    export class FaceLinearSubdivisionDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shape?: T;
        /**
         * Linear subdivision direction true - U, false - V
         * @default true
         */
        isU = true;
        /**
         * Param on direction 0 - 1
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        param = 0.5;
        /**
         * Number of subdivisions on opposite direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrPoints = 10;
        /**
         * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
         * @default false
         */
        shiftHalfStep = false;
        /**
         * Removes first point
         * @default false
         */
        removeStartPoint = false;
        /**
         * Removes last point
         * @default false
         */
        removeEndPoint = false;
    }

    export class DataOnUVDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shape?: T;
        /**
         * Param on U direction 0 to 1
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        paramU = 0.5;
        /**
         * Param on V direction 0 to 1
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        paramV = 0.5;
    }
    export class DataOnUVsDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shape?: T;
        /**
         * Params uv
         * @default [[0.5, 0.5]]
         */
        paramsUV: [number, number][] = [[0.5, 0.5]];
    }
    export class PolygonDto {
        constructor(points?: Base.Point3[]) {
            this.points = points;
        }
        /**
         * Points points
         * @default undefined
         */
        points: Base.Point3[];
    }
    export class PolygonsDto {
        constructor(polygons?: PolygonDto[]) {
            this.polygons = polygons;
        }
        /**
         * Polygons
         * @default undefined
         */
        polygons: PolygonDto[];
        /**
         * Indicates whether the shapes should be returned as a compound
         */
        returnCompound = false;
    }
    export class PolylineDto {
        constructor(points?: Base.Point3[]) {
            this.points = points;
        }
        /**
         * Points points
         * @default undefined
         */
        points: Base.Point3[];
    }
    export class PolylinesDto {
        constructor(polylines?: PolylineDto[]) {
            this.polylines = polylines;
        }
        /**
         * Polylines
         * @default undefined
         */
        polylines: PolylineDto[];
        /**
         * Indicates whether the shapes should be returned as a compound
         */
        returnCompound = false;
    }
    export class SquareDto {
        /**
         * size of square
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        size = 1;
        /**
         * Center of the square
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction of the square
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class RectangleDto {
        /**
         * width of the rectangle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        width = 1;
        /**
         * Height of the rectangle
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        length = 2;
        /**
         * Center of the rectangle
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction of the rectangle
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class LPolygonDto {
        /**
         * Width of the first side of L polygon
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        widthFirst = 1;
        /**
         * Length of the first side of L polygon
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        lengthFirst = 2;
        /**
         * Width of the second side of L polygon
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        widthSecond = 0.5;
        /**
         * Length of the second side of L polygon
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        lengthSecond = 2;
        /**
         * Indicates if the L polygon should be aligned inside/outside or middle
         * @default outside
         */
        align = directionEnum.outside;
        /**
         * Rotation of the L polygon
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 15
         */
        rotation = 0;
        /**
         * Center of the L polygon
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction of the  L polygon
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class BoxDto {
        constructor(width?: number, length?: number, height?: number, center?: Base.Point3) {
            this.width = width;
            this.length = length;
            this.height = height;
            if (center) {
                this.center = center;
            }
        }
        /**
         * Width of the box
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width = 1;
        /**
         * Length of the box
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length = 2;
        /**
         * Height of the box
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 3;
        /**
         * Center of the box
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    export class CubeDto {
        constructor(size?: number, center?: Base.Point3) {
            if (size) {
                this.size = size;
            }
            if (center) {
                this.center = center;
            }
        }
        /**
         * Size of the cube
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 1;
        /**
         * Center of the box
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    export class BoxFromCornerDto {
        constructor(width?: number, length?: number, height?: number, corner?: Base.Point3) {
            this.width = width;
            this.length = length;
            this.height = height;
            if (corner) {
                this.corner = corner;
            }
        }
        /**
         * Width of the box
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width = 1;
        /**
         * Length of the box
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length = 2;
        /**
         * Height of the box
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 3;
        /**
         * Corner of the box
         * @default [0, 0, 0]
         */
        corner: Base.Point3 = [0, 0, 0];
    }
    export class SphereDto {
        constructor(radius?: number, center?: Base.Point3) {
            this.radius = radius;
            if (center) {
                this.center = center;
            }
        }
        /**
         * Radius of the sphere
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Center of the sphere
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    export class ConeDto {
        constructor(radius1?: number, radius2?: number, height?: number, angle?: number, center?: Base.Point3, direction?: Base.Point3) {
            this.radius1 = radius1;
            this.radius2 = radius2;
            this.height = height;
            this.angle = angle;
            this.center = center;
            this.direction = direction;
        }
        /**
         * First radius of the cone
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius1 = 2;
        /**
         * Second radius of the cone
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius2 = 1;
        /**
         * Height of the cone
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 2;
        /**
         * Angle of the cone
         * @default 360
         * @minimum 0
         * @maximum 360
         * @step 1
         */
        angle = 360;
        /**
         * Center of the cone
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction of the cone
         * @default [0, 1, 0]
         */
        direction: Base.Point3 = [0, 1, 0];

    }
    export class LineDto {
        /**
         * Start of the line
         * @default [0, 0, 0]
         */
        start: Base.Point3 = [0, 0, 0];
        /**
         * End of the line
         * @default [0, 1, 0]
         */
        end: Base.Point3 = [0, 1, 0];
    }
    export class LinesDto {
        constructor(lines?: LineDto[]) {
            this.lines = lines;
        }
        /**
         * Lines
         * @default undefined
         */
        lines: LineDto[];
        /**
         * Indicates whether the shapes should be returned as a compound
         */
        returnCompound = false;
    }
    export class ArcEdgeThreePointsDto {
        /**
         * Start of the arc
         * @default [0, 0, 0]
         */
        start: Base.Point3 = [0, 0, 0];
        /**
        * Middle of the arc
        * @default [0, 1, 0]
        */
        middle: Base.Point3 = [0, 1, 0];
        /**
         * End of the arc
         * @default [0, 0, 1]
         */
        end: Base.Point3 = [0, 0, 1];
    }
    export class CylinderDto {
        /**
         * Radius of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Height of the cylinder
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 2;
        /**
         * Center of the cylinder
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction for the cylinder
         * @default [0, 1, 0]
         */
        direction?: Base.Vector3 = [0, 1, 0];
    }
    export class CylindersOnLinesDto {
        /**
         * Radius of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * Lines between which to span cylinders
         * @default undefined
         */
        lines: Base.Line3[];
    }
    export class FilletDto<T> {
        constructor(shape?: T, radius?: number, indexes?: number[]) {
            this.shape = shape;
            this.radius = radius;
            this.indexes = indexes;
        }
        /**
         * Shape to apply the fillets
         * @default undefined
         */
        shape: T;
        /**
         * Radius of the fillets
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         * @optional true
         */
        radius? = 0.1;
        /**
         * Radius list
         * @default undefined
         * @optional true
         */
        radiusList?: number[];
        /**
         * List of edge indexes to which apply the fillet, if left empty all edges will be rounded
         * @default undefined
         * @optional true
         */
        indexes?: number[];
    }

    export class Fillet3DWireDto<T> {
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Shape to apply the fillets
         * @default undefined
         */
        shape: T;
        /**
         * Radius of the fillets
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         * @optional true
         */
        radius? = 0.1;
        /**
         * Radius list
         * @default undefined
         * @optional true
         */
        radiusList?: number[];
        /**
         * List of edge indexes to which apply the fillet, if left empty all edges will be rounded
         * @default undefined
         * @optional true
         */
        indexes?: number[];
        /**
         * Orientation direction for the fillet
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class ChamferDto<T> {
        constructor(shape?: T, distance?: number, indexes?: number[]) {
            this.shape = shape;
            this.distance = distance;
            this.indexes = indexes;
        }
        /**
         * Shape to apply the chamfer
         * @default undefined
         */
        shape: T;
        /**
         * Distance for the chamfer
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @optional true
         * @step 0.1
         */
        distance? = 0.1;
        /**
         * Distance for the chamfer
         * @default undefined
         * @optional true
         */
        distanceList?: number[];
        /**
         * List of edge indexes to which apply the chamfer, if left empty all edges will be chamfered
         * @default undefined
         * @optional true
         */
        indexes?: number[];
    }
    export class BSplineDto {
        constructor(points?: Base.Point3[], closed?: boolean) {
            this.points = points;
            this.closed = closed;
        }
        /**
         * Points through which the BSpline will be created
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Indicates wether BSpline will be cloed
         * @default false
         */
        closed = false;
    }
    export class BSplinesDto {
        constructor(bSplines?: BSplineDto[]) {
            this.bSplines = bSplines;
        }
        /**
         * BSpline definitions
         * @default undefined
         */
        bSplines: BSplineDto[];
        /**
         * Indicates whether the shapes should be returned as a compound
         */
        returnCompound = false;
    }
    export class InterpolationDto {
        constructor(points?: Base.Point3[], periodic?: boolean) {
            this.points = points;
            this.periodic = periodic;
        }
        /**
         * Points through which the BSpline will be created
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Indicates wether BSpline will be periodic
         * @default false
         */
        periodic = false;
        /**
         * tolerance
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         * @step 0.00001
         */
        tolerance = 1e-7;
    }
    export class InterpolateWiresDto {
        constructor(interpolations?: InterpolationDto[]) {
            this.interpolations = interpolations;
        }
        /**
         * Interpolation definitions
         * @default undefined
         */
        interpolations: InterpolationDto[];
        /**
         * Indicates whether the shapes should be returned as a compound
         */
        returnCompound = false;
    }
    export class BezierDto {
        constructor(points?: Base.Point3[], closed?: boolean) {
            this.points = points;
            this.closed = closed;
        }
        /**
         * Points through which the Bezier curve will be created
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Indicates wether Bezier will be cloed
         * @default false
         */
        closed = false;
    }
    export class BezierWiresDto {
        constructor(bezierWires?: BezierDto[]) {
            this.bezierWires = bezierWires;
        }
        /**
         * Bezier wires
         * @default undefined
         */
        bezierWires: BezierDto[];
        /**
         * Indicates whether the shapes should be returned as a compound
         */
        returnCompound = false;
    }
    export class DivideDto<T> {
        constructor(shape: T, nrOfDivisions?: number, removeStartPoint?: boolean, removeEndPoint?: boolean) {
            this.shape ??= shape;
            this.nrOfDivisions ??= nrOfDivisions;
            this.removeStartPoint ??= removeStartPoint;
            this.removeEndPoint ??= removeEndPoint;
        }
        /**
         * Shape representing a wire
         * @default undefined
         */
        shape: T;
        /**
         * The number of divisions that will be performed on the curve
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrOfDivisions = 10;
        /**
         * Indicates if algorithm should remove start point
         * @default false
         */
        removeStartPoint = false;
        /**
         * Indicates if algorithm should remove end point
         * @default false
         */
        removeEndPoint = false;
    }

    export class ProjectWireDto<T, U> {
        /**
         * Wire to project
         * @default undefined
         */
        wire: T;
        /**
         * Shape to use for projection
         * @default undefined
         */
        shape: U;
        /**
         * Direction vector for projection
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class WiresToPointsDto<T> {
        /**
         * Shape to use for parsing edges
         * @default undefined
         */
        shape: T;
        /**
         * The angular deflection
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        angularDeflection = 0.1;
        /**
         * The curvature deflection
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.001
         */
        curvatureDeflection = 0.1;
        /**
         * Minimum of points
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        minimumOfPoints = 2;
        /**
         * U tolerance
         * @default 1.0e-9
         * @minimum 0
         * @maximum Infinity
         * @step 1.0e-9
         */
        uTolerance = 1.0e-9;
        /**
         * Minimum length
         * @default 1.0e-7
         * @minimum 0
         * @maximum Infinity
         * @step 1.0e-7
         */
        minimumLength = 1.0e-7;
    }
    export class EdgesToPointsDto<T> {
        /**
         * Shape to use for parsing edges
         * @default undefined
         */
        shape: T;
        /**
         * The angular deflection
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        angularDeflection = 0.1;
        /**
         * The curvature deflection
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.001
         */
        curvatureDeflection = 0.1;
        /**
         * Minimum of points
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        minimumOfPoints = 2;
        /**
         * U tolerance
         * @default 1.0e-9
         * @minimum 0
         * @maximum Infinity
         * @step 1.0e-9
         */
        uTolerance = 1.0e-9;
        /**
         * Minimum length
         * @default 1.0e-7
         * @minimum 0
         * @maximum Infinity
         * @step 1.0e-7
         */
        minimumLength = 1.0e-7;
    }
    export class ProjectWiresDto<T, U> {
        /**
         * Wire to project
         * @default undefined
         */
        wires: T[];
        /**
         * Shape to use for projection
         * @default undefined
         */
        shape: U;
        /**
         * Direction vector for projection
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class DivideShapesDto<T> {
        constructor(shapes: T[], nrOfDivisions?: number, removeStartPoint?: boolean, removeEndPoint?: boolean) {
            this.shapes = shapes;
            this.nrOfDivisions = nrOfDivisions;
            this.removeStartPoint = removeStartPoint;
            this.removeEndPoint = removeEndPoint;
        }
        /**
         * Shapes
         * @default undefined
         */
        shapes: T[];
        /**
         * The number of divisions that will be performed on the curve
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrOfDivisions = 10;
        /**
         * Indicates if algorithm should remove start point
         * @default false
         */
        removeStartPoint = false;
        /**
         * Indicates if algorithm should remove end point
         * @default false
         */
        removeEndPoint = false;
    }
    export class DataOnGeometryAtParamDto<T> {
        constructor(shape: T, param?: number) {
            this.shape = shape;
            this.param = param;
        }
        /**
         * Shape representing a geometry
         * @default undefined
         */
        shape: T;
        /**
         * 0 - 1 value
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        param = 0.5;
    }
    export class PointInFaceDto<T> extends ShapesDto<T> {
        constructor(face: T, edge: T, tEdgeParam?: number, distance2DParam?: number) {
            super();
            this.face = face;
            this.edge = edge;
            this.tEdgeParam = tEdgeParam;
            this.distance2DParam = distance2DParam;
        }
        /** 
         * OCCT face to be used for calculation 
         * @default undefined
         */
        face: T;
        /**
         * OCCT edge to be used for calculation
         * @default undefined
         */
        edge: T;
        /**
         * 0 - 1 value
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        tEdgeParam = 0.5;
        /**
         * The point will be distanced on <distance2DParam> from the 2d curve.
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        distance2DParam = 0.5;
    }

    export class DataOnGeometryAtLengthDto<T> {
        constructor(shape: T, length?: number) {
            this.shape = shape;
            this.length = length;
        }
        /**
         * Shape representing a wire
         * @default undefined
         */
        shape: T;
        /**
         * length at which to evaluate the point
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        length = 0.5;
    }
    export class CircleDto {
        constructor(radius?: number, center?: Base.Point3, direction?: Base.Vector3) {
            this.radius = radius;
            this.center = center;
            this.direction = direction;
        }
        /**
         * Radius of the circle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Center of the circle
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction vector for circle
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class LoftDto<T> {
        constructor(shapes?: T[], makeSolid?: boolean) {
            this.shapes = shapes;
            this.makeSolid = makeSolid;
        }
        /**
         * Wires through which the loft passes
         * @default undefined
         */
        shapes: T[];
        /**
         * Tries to make a solid when lofting
         * @default false
         */
        makeSolid = false;
    }
    export class LoftAdvancedDto<T> {
        constructor(
            shapes?: T[],
        ) {
            this.shapes = shapes;
        }
        /**
         * Wires through which the loft passes
         * @default undefined
         */
        shapes: T[];
        /**
         * Tries to make a solid when lofting
         * @default false
         */
        makeSolid = false;
        /**
         * Will make a closed loft.
         * @default false
         */
        closed = false;
        /**
         * Will make a periodic loft.
         * @default false
         */
        periodic = false;
        /**
         * Indicates whether straight sections should be made out of the loft
         * @default false
         */
        straight = false;
        /**
         * This number only is used when closed non straight lofting is used
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrPeriodicSections = 10;
        /**
         * Tell algorithm to use smoothing
         * @default false
         */
        useSmoothing = false;
        /** 
         * Maximum u degree 
         * @default 3
         */
        maxUDegree = 3;
        /**
         * Tolerance
         * @default 1.0e-7
         * @minimum 0
         * @maximum Infinity
         * @step 0.000001
         */
        tolerance = 1.0e-7;
        /**
         * Approximation parametrization type
         * @default approxCentripetal
         */
        parType: approxParametrizationTypeEnum = approxParametrizationTypeEnum.approxCentripetal;
        /**
         * Optional if loft should start with a vertex
         * @default undefined
         * @optional true
         */
        startVertex?: Base.Point3;
        /**
         * Optional if loft should end with a vertex
         * @default undefined
         * @optional true
         */
        endVertex?: Base.Point3;
    }
    export class OffsetDto<T> {
        constructor(shape?: T, distance?: number, tolerance?: number) {
            this.shape = shape;
            this.distance = distance;
            if (tolerance) {
                this.tolerance = tolerance;
            }
        }
        /**
         * Shape to offset
         * @default undefined
         */
        shape: T;
        /**
         * Distance of offset
         * @default 0.2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        distance = 0.2;
        /**
         * Offset tolerance
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        tolerance = 0.1;
    }
    export class OffsetAdvancedDto<T> {
        constructor(shape?: T, distance?: number, tolerance?: number) {
            this.shape = shape;
            this.distance = distance;
            if (tolerance) {
                this.tolerance = tolerance;
            }
        }
        /**
         * Shape to offset
         * @default undefined
         */
        shape: T;
        /**
         * Distance of offset
         * @default 0.2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        distance = 0.2;
        /**
         * Offset tolerance
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        tolerance = 0.1;
        /**
         * Join defines how to fill the holes that may appear between parallels to the two adjacent faces. It may take values GeomAbs_Arc or GeomAbs_Intersection:
         * if Join is equal to GeomAbs_Arc, then pipes are generated between two free edges of two adjacent parallels, and spheres are generated on "images" of vertices; it is the default value
         * @default arc
        */
        joinType = joinTypeEnum.arc;
        /**
         * Removes internal edges
         * @default false
         */
        removeIntEdges = false;
    }
    export class RevolveDto<T> {
        constructor(shape?: T, degrees?: number, direction?: Base.Vector3, copy?: boolean) {
            this.shape = shape;
            this.angle = degrees;
            this.direction = direction;
            if (this.copy) {
                this.copy = copy;
            }
        }
        /**
         * Shape to revolve
         * @default undefined
         */
        shape: T;
        /**
         * Angle degrees
         * @default 360
         * @minimum 0
         * @maximum 360
         * @step 1
         */
        angle = 360;
        /**
         * Direction vector
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
        /**
         * Copy original shape
         * @default false
         */
        copy = false;
    }
    export class ShapeShapesDto<T, U> {
        constructor(shape?: T, shapes?: U[]) {
            this.shape = shape;
            this.shapes = shapes;
        }
        /**
         * The wire path
         * @default undefined
         */
        shape: T;
        /**
         * Shapes along the path to be piped
         * @default undefined
         */
        shapes: U[];
    }
    export class WiresOnFaceDto<T, U> {
        constructor(wires?: T[], face?: U) {
            this.wires = wires;
            this.face = face;
        }
        /**
         * The wires
         * @default undefined
         */
        wires: T[];
        /**
         * Face shape
         * @default undefined
         */
        face: U;
    }
    export class PipeWiresCylindricalDto<T> {
        constructor(shapes?: T[]) {
            this.shapes = shapes;
        }
        /**
         * Wire paths to pipe
         * @default undefined
         */
        shapes: T[];
        /**
         * Radius of the cylindrical pipe
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        radius = 0.1;
    }
    export class PipeWireCylindricalDto<T> {
        constructor(shapes?: T) {
            this.shape = shapes;
        }
        /**
         * Wire path to pipe
         * @default undefined
         */
        shape: T;
        /**
         * Radius of the cylindrical pipe
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        radius = 0.1;
    }
    export class PipePolygonWireNGonDto<T> {
        constructor(shapes?: T) {
            this.shape = shapes;
        }
        /**
         * Wire path to pipe
         * @default undefined
         */
        shape: T;
        /**
         * Radius of the cylindrical pipe
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        radius = 0.1;
        /**
         * Nr of ngon corners to be used
         * @default 6
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        nrCorners = 6;
    }
    export class ExtrudeDto<T> {
        constructor(shape?: T, direction?: Base.Vector3) {
            this.shape = shape;
            this.direction = direction;
        }
        /**
         * Face to extrude
         * @default undefined
         */
        shape: T;
        /**
         * Direction vector for extrusion
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }

    export class ExtrudeShapesDto<T> {
        constructor(shapes?: T[], direction?: Base.Vector3) {
            this.shapes = shapes;
            this.direction = direction;
        }
        /**
         * Shapes to extrude
         * @default undefined
         */
        shapes: T[];
        /**
         * Direction vector for extrusion
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }

    export class SplitDto<T> {
        constructor(shape?: T, shapes?: T[]) {
            this.shape = shape;
            this.shapes = shapes;
        }
        /**
         * Shape to split
         * @default undefined
         */
        shape: T;
        /**
         * Shapes to split from main shape
         * @default undefined
         */
        shapes: T[];
    }
    export class UnionDto<T> {
        constructor(shapes?: T[], keepEdges?: boolean) {
            this.shapes = shapes;
            this.keepEdges = keepEdges;
        }
        /**
         * Objects to be joined together
         * @default undefined
         */
        shapes: T[];
        /**
         * Keeps edges
         * @default false
         */
        keepEdges = false;
    }
    export class DifferenceDto<T> {
        constructor(shape?: T, shapes?: T[], keepEdges?: boolean) {
            this.shape = shape;
            this.shapes = shapes;
            this.keepEdges = keepEdges;
        }
        /**
         * Object to subtract from
         * @default undefined
         */
        shape: T;
        /**
         * Objects to subtract
         * @default undefined
         */
        shapes: T[];
        /**
         * Keeps edges unaffected
         * @default false
         */
        keepEdges = false;
    }

    export class IntersectionDto<T> {
        constructor(shapes?: T[], keepEdges?: boolean) {
            this.shapes = shapes;
            this.keepEdges = keepEdges;
        }
        /**
         * Shapes to intersect
         * @default undefined
         */
        shapes: T[];
        /**
         * Keep the edges
         * @default false
         */
        keepEdges = false;
    }
    export class ShapeDto<T> {
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Shape on which action should be performed
         * @default undefined
         */
        shape: T;
    }
    export class CompareShapesDto<T> {
        constructor(shape?: T, otherShape?: T) {
            this.shape ??= shape;
            this.otherShape ??= otherShape;
        }
        /**
         * Shape to be compared
         * @default undefined
         */
        shape: T;
        /**
         * Shape to be compared against
         * @default undefined
         */
        otherShape: T;
    }
    export class FixSmallEdgesInWireDto<T>{
        /**
         * Shape on which action should be performed
         * @default undefined
         */
        shape: T;
        /**
         * Lock vertex. If true, the edge must be kept.
         * @default false
         */
        lockvtx = false;
        /**
         * Definition of the small distance edge
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.0000000001
         */
        precsmall = 0.0;
    }
    export class BasicShapeRepairDto<T> {
        /**
         * Shape to repair
         * @default undefined
         */
        shape: T;
        /**
         * Basic precision
         * @default 0.001
         * @minimum 0
         * @maximum Infinity
         * @step 0.0000000001
         */
        precision = 0.001;
        /**
         * maximum allowed tolerance. All problems will be detected for cases when a dimension of invalidity is larger than 
         * the basic precision or a tolerance of sub-shape on that problem is detected. The maximum tolerance value limits 
         * the increasing tolerance for fixing a problem such as fix of not connected and self-intersected wires. If a value 
         * larger than the maximum allowed tolerance is necessary for correcting a detected problem the problem can not be fixed. 
         * The maximal tolerance is not taking into account during computation of tolerance of edges
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         * @step 0.0000000001
         */
        maxTolerance = 0.01;
        /**
         * minimal allowed tolerance. It defines the minimal allowed length of edges.
         * Detected edges having length less than the specified minimal tolerance will be removed.
         * @default 0.0001
         * @minimum 0
         * @maximum Infinity
         * @step 0.0000000001
         */
        minTolerance = 0.0001;
    }
    export class FixClosedDto<T>{
        /**
         * Shape on which action should be performed
         * @default undefined
         */
        shape: T;
        /**
         * Precision for closed wire
         * @default -0.1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.0000000001
         */
        precision = -0.1;
    }
    export class ShapesWithToleranceDto<T> {
        constructor(shapes?: T[]) {
            this.shapes = shapes;
        }
        /**
         * The shapes
         * @default undefined
         */
        shapes: T[];
        /**
         * Tolerance used for intersections
         * @default 1.0e-7
         * @minimum 0
         * @maximum Infinity
         * @step 0.000001
         */
        tolerance = 1.0e-7;
    }
    export class ShapeWithToleranceDto<T> {
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * The shape
         * @default undefined
         */
        shape: T;
        /**
         * Tolerance used for intersections
         * @default 1.0e-7
         * @minimum 0
         * @maximum Infinity
         * @step 0.000001
         */
        tolerance = 1.0e-7;
    }

    export class ShapeIndexDto<T> {
        constructor(shape?: T, index?: number) {
            this.shape = shape;
            this.index = index;
        }
        /**
         * Shape
         * @default undefined
         */
        shape: T;
        /**
         * Index of the entity
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        index = 0;
    }
    export class RotationExtrudeDto<T> {
        constructor(shape?: T, height?: number, degrees?: number) {
            this.shape = shape;
            this.height = height;
            this.angle = degrees;
        }
        /**
         * Wire to extrude by rotating
         * @default undefined
         */
        shape: T;
        /**
         * Height of rotation
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
        /**
         * Rotation in degrees
         * @default 360
         * @minimum 0
         * @maximum 360
         * @step 1
         */
        angle = 360;
    }

    // Threading : Create Surfaces
    export class ThickSolidByJoinDto<T> {
        constructor(shape?: T, shapes?: T[], offset?: number) {
            this.shape = shape;
            this.shapes = shapes;
            this.offset = offset;
        }
        /**
         * Shape to make thick
         * @default undefined
         */
        shape: T;
        /**
         * closing faces
         * @default undefined
         */
        shapes: T[];
        /**
         * Offset to apply
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        offset = 1;
        /**
         * Tolerance defines the tolerance criterion for coincidence in generated shapes
         * @default 1.0e-3
         * @minimum 0
         * @maximum Infinity
         * @step 0.000001
         */
        tolerance = 1.e-3;
        /**
         * if Intersection is false (default value), the intersection is calculated with the parallels to the two adjacent shapes
         * @default false
         */
        intersection = false;
        /**
         * SelfInter tells the algorithm whether a computation to eliminate self-intersections needs to be applied to the resulting shape. However, as this functionality is not yet implemented, you should use the default value (false)
         * @default false
         */
        selfIntersection = false;
        /**
         * Join defines how to fill the holes that may appear between parallels to the two adjacent faces. It may take values GeomAbs_Arc or GeomAbs_Intersection:
         * if Join is equal to GeomAbs_Arc, then pipes are generated between two free edges of two adjacent parallels, and spheres are generated on "images" of vertices; it is the default value
         * @default arc
        */
        joinType = joinTypeEnum.arc;
        /**
         * if Join is equal to GeomAbs_Intersection, then the parallels to the two adjacent faces are enlarged and intersected, so that there are no free edges on parallels to faces. RemoveIntEdges flag defines whether to remove the INTERNAL edges from the result or not. Warnings Since the algorithm of MakeThickSolid is based on MakeOffsetShape algorithm, the warnings are the same as for MakeOffsetShape.
         * @default false
         */
        removeIntEdges = false;
    }
    export class TransformDto<T> {
        constructor(shape?: T, translation?: Base.Vector3, rotationAxis?: Base.Vector3, rotationDegrees?: number, scaleFactor?: number) {
            this.shape = shape;
            this.translation = translation;
            this.rotationAxis = rotationAxis;
            this.rotationAngle = rotationDegrees;
            this.scaleFactor = scaleFactor;
        }
        /**
         * Shape to transform
         * @default undefined
         */
        shape: T;
        /**
         * Translation to apply
         * @default [0,0,0]
         */
        translation: Base.Vector3 = [0, 0, 0];
        /**
         * Rotation to apply
         * @default [0,1,0]
         */
        rotationAxis: Base.Vector3 = [0, 1, 0];
        /**
         * Rotation degrees
         * @default 0
         * @minimum 0
         * @maximum 360
         * @step 1
         */
        rotationAngle = 0;
        /**
         * Scale factor to apply
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scaleFactor = 1;
    }
    export class TransformShapesDto<T> {
        constructor(shapes?: T[], translation?: Base.Vector3[], rotationAxes?: Base.Vector3[], rotationDegrees?: number[], scaleFactors?: number[]) {
            this.shapes = shapes;
            this.translations = translation;
            this.rotationAxes = rotationAxes;
            this.rotationAngles = rotationDegrees;
            this.scaleFactors = scaleFactors;
        }
        /**
         * Shape to transform
         * @default undefined
         */
        shapes: T[];
        /**
         * Translation to apply
         * @default [[0,0,0]]
         */
        translations: Base.Vector3[] = [[0, 0, 0]];
        /**
         * Rotation to apply
         * @default [[0,1,0]]
         */
        rotationAxes: Base.Vector3[] = [[0, 1, 0]];
        /**
         * Rotation degrees
         * @default [0]
         */
        rotationAngles: number[] = [0];
        /**
         * Scale factor to apply
         * @default [1]
         */
        scaleFactors: number[] = [1];
    }
    export class TranslateDto<T> {
        constructor(shape?: T, translation?: Base.Vector3) {
            this.shape = shape;
            this.translation = translation;
        }
        /**
         * Shape for translation
         * @default undefined
         */
        shape: T;
        /**
         * Translation vector
         * @default [0, 0, 0]
         */
        translation: Base.Vector3 = [0, 0, 0];
    }
    export class TranslateShapesDto<T> {
        constructor(shapes?: T[], translations?: Base.Vector3[]) {
            this.shapes = shapes;
            this.translations = translations;
        }
        /**
         * Shape for translation
         * @default undefined
         */
        shapes: T[];
        /**
         * Translation vector
         * @default [[0, 0, 0]]
         */
        translations: Base.Vector3[] = [[0, 0, 0]];
    }

    export class AlignDto<T>{
        constructor(shape?: T, fromOrigin?: Base.Point3, fromDirection?: Base.Vector3, toOrigin?: Base.Point3, toDirection?: Base.Vector3) {
            this.shape = shape;
            this.fromOrigin = fromOrigin;
            this.fromDirection = fromDirection;
            this.toOrigin = toOrigin;
            this.toDirection = toDirection;
        }
        /**
         * Shape for translation
         * @default undefined
         */
        shape: T;
        /**
         * from origin
         * @default [0, 0, 0]
         */
        fromOrigin: Base.Point3 = [0, 0, 0];
        /**
         * From direction
         * @default [0, 0, 1]
         */
        fromDirection: Base.Vector3 = [0, 0, 1];
        /**
         * To origin
         * @default [0, 1, 0]
         */
        toOrigin: Base.Point3 = [0, 1, 0];
        /**
         * To direction
         * @default [0, 1, 0]
         */
        toDirection: Base.Vector3 = [0, 1, 0];
    }
    export class AlignShapesDto<T> {
        constructor(shapes?: T[], fromOrigins?: Base.Vector3[], fromDirections?: Base.Vector3[], toOrigins?: Base.Vector3[], toDirections?: Base.Vector3[]) {
            this.shapes = shapes;
            this.fromOrigins = fromOrigins;
            this.fromDirections = fromDirections;
            this.toOrigins = toOrigins;
            this.toDirections = toDirections;
        }
        /**
         * Shape for translation
         * @default undefined
         */
        shapes: T[];
        /**
         * from origin
         * @default [[0, 0, 0]]
         */
        fromOrigins: Base.Point3[] = [[0, 0, 0]];
        /**
         * From direction
         * @default [[0, 0, 1]]
         */
        fromDirections: Base.Vector3[] = [[0, 0, 1]];
        /**
         * To origin
         * @default [[0, 1, 0]]
         */
        toOrigins: Base.Point3[] = [[0, 1, 0]];
        /**
         * To direction
         * @default [[0, 1, 0]]
         */
        toDirections: Base.Vector3[] = [[0, 1, 0]];
    }

    export class MirrorDto<T> {
        constructor(shape?: T, origin?: Base.Point3, direction?: Base.Vector3) {
            this.shape = shape;
            this.direction = direction;
            this.origin = origin;
        }
        /**
         * Shape to mirror
         * @default undefined
         */
        shape: T;
        /**
         * Axis origin point
         * @default [0, 0, 0]
         */
        origin: Base.Point3 = [0, 0, 0];
        /**
         * Axis direction vector
         * @default [0, 0, 1]
         */
        direction: Base.Vector3 = [0, 0, 1];
    }
    export class MirrorShapesDto<T> {
        constructor(shapes?: T[], origins?: Base.Point3[], directions?: Base.Vector3[]) {
            this.shapes = shapes;
            this.directions = directions;
            this.origins = origins;
        }
        /**
         * Shape to mirror
         * @default undefined
         */
        shapes: T[];
        /**
         * Axis origin point
         * @default [[0, 0, 0]]
         */
        origins: Base.Point3[] = [[0, 0, 0]];
        /**
         * Axis direction vector
         * @default [[0, 0, 1]]
         */
        directions: Base.Vector3[] = [[0, 0, 1]];
    }
    export class MirrorAlongNormalDto<T> {
        constructor(shape?: T, origin?: Base.Point3, normal?: Base.Vector3) {
            this.shape = shape;
            this.normal = normal;
            this.origin = origin;
        }
        /**
         * Shape to mirror
         * @default undefined
         */
        shape: T;
        /**
         * Axis origin point
         * @default [0, 0, 0]
         */
        origin: Base.Point3 = [0, 0, 0];
        /**
         * First normal axis direction vector
         * @default [0, 0, 1]
         */
        normal: Base.Vector3 = [0, 0, 1];
    }
    export class MirrorAlongNormalShapesDto<T> {
        constructor(shapes?: T[], origins?: Base.Point3[], normals?: Base.Vector3[]) {
            this.shapes = shapes;
            this.normals = normals;
            this.origins = origins;
        }
        /**
         * Shape to mirror
         * @default undefined
         */
        shapes: T[];
        /**
         * Axis origin point
         * @default [[0, 0, 0]]
         */
        origins: Base.Point3[] = [[0, 0, 0]];
        /**
         * First normal axis direction vector
         * @default [[0, 0, 1]]
         */
        normals: Base.Vector3[] = [[0, 0, 1]];
    }
    export class AlignAndTranslateDto<T>{
        constructor(shape?: T, direction?: Base.Vector3, center?: Base.Vector3) {
            this.shape = shape;
            this.direction = direction;
            this.center = center;
        }
        /**
         * Shape to align and translate
         * @default undefined
         */
        shape: T;
        /**
         * Direction on which to align
         * @default [0, 0, 1]
         */
        direction: Base.Vector3 = [0, 1, 0];
        /**
         * Position to translate
         */
        center: Base.Vector3 = [0, 0, 0];
    }
    export class UnifySameDomainDto<T> {
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Shape on which action should be performed
         * @default undefined
         */
        shape: T;
        /**
        * If true, unifies the edges
        * @default true
        */
        unifyEdges = true;
        /**
        * If true, unifies the edges
        * @default true
        */
        unifyFaces = true;
        /**
        * If true, unifies the edges
        * @default true
        */
        concatBSplines = true;
    }
    export class FilterFacePointsDto<T>{
        constructor(shape?: T, points?: Base.Point3[], tolerance?: number, useBndBox?: boolean, gapTolerance?: number, keepIn?: boolean, keepOn?: boolean, keepOut?: boolean, keepUnknown?: boolean) {
            this.shape ??= shape;
            this.points ??= points;
            this.tolerance ??= tolerance;
            this.useBndBox ??= useBndBox;
            this.gapTolerance ??= gapTolerance;
            this.keepIn ??= keepIn;
            this.keepOn ??= keepOn;
            this.keepOut ??= keepOut;
            this.keepUnknown ??= keepUnknown;
        }
        /**
         * Face that will be used to filter points
         * @default undefined
         */
        shape: T;
        /**
         * Points to filter
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Tolerance used for filter
         * @default 1.0e-4
         * @minimum 0
         * @maximum Infinity
         * @step 0.000001
         */
        tolerance = 1.0e-4;
        /**
        * If true, the bounding box will be used to prefilter the points so that there are less points to check on actual face.
        * Recommended to enable if face has more than 10 edges and geometry is mostly spline.
        * This might be faster, but if it is known that points are withing bounding box, this may not be faster.
        * @default false
        */
        useBndBox = false;
        /**
         * Gap tolerance
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        gapTolerance = 0.1;
        /**
        * Return points that are inside the face
        * @default true
        */
        keepIn = true;
        /**
        * Return points that are on the border of the face
        * @default true
        */
        keepOn = true;
        /**
        * Return points that are outside the borders of the face
        * @default false
        */
        keepOut = false;
        /**
        * Return points that are classified as unknown
        * @default false
        */
        keepUnknown = false;
    }
    export class FilterSolidPointsDto<T>{
        constructor(shape?: T, points?: Base.Point3[], tolerance?: number, keepIn?: boolean, keepOn?: boolean, keepOut?: boolean, keepUnknown?: boolean) {
            this.shape ??= shape;
            this.points ??= points;
            this.tolerance ??= tolerance;
            this.keepIn ??= keepIn;
            this.keepOn ??= keepOn;
            this.keepOut ??= keepOut;
            this.keepUnknown ??= keepUnknown;
        }
        /**
         * Face that will be used to filter points
         * @default undefined
         */
        shape: T;
        /**
         * Points to filter
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Tolerance used for filter
         * @default 1.0e-4
         * @minimum 0
         * @maximum Infinity
         * @step 0.000001
         */
        tolerance = 1.0e-4;
        /**
        * Return points that are inside the face
        * @default true
        */
        keepIn = true;
        /**
        * Return points that are on the border of the face
        * @default true
        */
        keepOn = true;
        /**
        * Return points that are outside the borders of the face
        * @default false
        */
        keepOut = false;
        /**
        * Return points that are classified as unknown
        * @default false
        */
        keepUnknown = false;
    }
    export class AlignAndTranslateShapesDto<T>{
        constructor(shapes?: T[], directions?: Base.Vector3[], centers?: Base.Vector3[]) {
            this.shapes = shapes;
            this.directions = directions;
            this.centers = centers;
        }
        /**
         * Shapes to align and translate
         * @default undefined
         */
        shapes: T[];
        /**
         * Directions on which to align
         * @default [0, 0, 1]
         */
        directions: Base.Vector3[] = [[0, 1, 0]];
        /**
         * Positions to translate
         */
        centers: Base.Vector3[] = [[0, 0, 0]];
    }
    export class RotateDto<T> {
        constructor(shape?: T, axis?: Base.Vector3, degrees?: number) {
            this.shape = shape;
            this.axis = axis;
            this.angle = degrees;
        }
        /**
         * Shape to rotate
         * @default undefined
         */
        shape: T;
        /**
         * Axis on which to rotate
         * @default [0, 0, 1]
         */
        axis: Base.Vector3 = [0, 0, 1];
        /**
         * Rotation degrees
         * @default 0
         * @minimum 0
         * @maximum 360
         * @step 1
         */
        angle = 0;
    }
    export class RotateAroundCenterDto<T> {
        constructor(shape?: T, angle?: number, center?: Base.Point3, axis?: Base.Vector3) {
            this.shape = shape;
            this.angle = angle;
            this.center = center;
            this.axis = axis;
        }
        /**
         * Shape to rotate
         * @default undefined
         */
        shape: T;
        /**
         * Angle of rotation to apply
         * @default 0
         */
        angle = 0;
        /**
         * Center of the rotation
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Axis around which to rotate
         * @default [0, 0, 1]
         */
        axis: Base.Vector3 = [0, 0, 1];
    }
    export class RotateShapesDto<T> {
        constructor(shapes?: T[], axes?: Base.Vector3[], angles?: number[]) {
            this.shapes = shapes;
            this.axes = axes;
            this.angles = angles;
        }
        /**
         * Shape to rotate
         * @default undefined
         */
        shapes: T[];
        /**
         * Axis on which to rotate
         * @default [[0, 0, 1]]
         */
        axes: Base.Vector3[];
        /**
         * Rotation degrees
         * @default [0]
         */
        angles: number[] = [0];
    }
    export class RotateAroundCenterShapesDto<T> {
        constructor(shapes?: T[], angles?: number[], centers?: Base.Point3[], axes?: Base.Vector3[]) {
            this.shapes = shapes;
            this.angles = angles;
            this.centers = centers;
            this.axes = axes;
        }
        /**
         * Shape to scale
         * @default undefined
         */
        shapes: T[];
        /**
         * Angles of rotation to apply
         * @default [0]
         */
        angles = [0];
        /**
         * Centers around which to rotate
         * @default [[0, 0, 0]]
         */
        centers: Base.Point3[] = [[0, 0, 0]];
        /**
         * Axes around which to rotate
         * @default [[0, 0, 1]]
         */
        axes: Base.Vector3[] = [[0, 0, 1]];
    }
    export class ScaleDto<T> {
        constructor(shape?: T, scale?: number) {
            this.shape = shape;
            this.factor = scale;
        }
        /**
         * Shape to scale
         * @default undefined
         */
        shape: T;
        /**
         * Scale factor to apply
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        factor = 1;
    }
    export class ScaleShapesDto<T> {
        constructor(shapes?: T[], factors?: number[]) {
            this.shapes = shapes;
            this.factors = factors;
        }
        /**
         * Shape to scale
         * @default undefined
         */
        shapes: T[];
        /**
         * Scale factor to apply
         * @default [1]
         */
        factors: number[] = [1];
    }
    export class Scale3DDto<T> {
        constructor(shape?: T, scale?: Base.Vector3, center?: Base.Point3) {
            this.shape = shape;
            this.scale = scale;
            this.center = center;
        }
        /**
         * Shape to scale
         * @default undefined
         */
        shape: T;
        /**
         * Scale factor to apply
         * @default [1, 1, 1]
         */
        scale: Base.Vector3 = [1, 1, 1];
        /**
         * Scale from the center
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    export class Scale3DShapesDto<T> {
        constructor(shapes?: T[], scales?: Base.Vector3[], centers?: Base.Point3[]) {
            this.shapes = shapes;
            this.scales = scales;
            this.centers = centers;
        }
        /**
         * Shape to scale
         * @default undefined
         */
        shapes: T[];
        /**
         * Scale factor to apply
         * @default [[1, 1, 1]]
         */
        scales: Base.Vector3[] = [[1, 1, 1]];
        /**
         * Scale from the center
         * @default [[0, 0, 0]]
         */
        centers: Base.Point3[] = [[0, 0, 0]];
    }
    export class ShapeToMeshDto<T>{
        constructor(shape?: T, precision?: number, adjustYtoZ?: boolean) {
            if (shape) {
                this.shape = shape;
            }
            if (precision) {
                this.precision = precision;
            }
            if (adjustYtoZ) {
                this.adjustYtoZ = adjustYtoZ;
            }
        }
        /**
         * Shape to save
         * @default undefined
         */
        shape: T;
        /**
         * Precision of the mesh
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         * @step 0.001
         */
        precision = 0.01;
        /**
         * Adjust Y (up) coordinate system to Z (up) coordinate system
         * @default false
         */
        adjustYtoZ = false;
    }
    export class ShapesToMeshesDto<T>{
        constructor(shapes?: T[], precision?: number, adjustYtoZ?: boolean) {
            if (shapes) {
                this.shapes = shapes;
            }
            if (precision) {
                this.precision = precision;
            }
            if (adjustYtoZ) {
                this.adjustYtoZ = adjustYtoZ;
            }
        }
        /**
         * Shapes to transform
         * @default undefined
         */
        shapes: T[];
        /**
         * Precision of the mesh
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         * @step 0.001
         */
        precision = 0.01;
        /**
         * Adjust Y (up) coordinate system to Z (up) coordinate system
         * @default false
         */
        adjustYtoZ = false;
    }
    export class SaveStepDto<T> {
        constructor(shape?: T, fileName?: string, adjustYtoZ?: boolean) {
            this.shape = shape;
            this.fileName = fileName;
            this.adjustYtoZ = adjustYtoZ;
        }
        /**
         * Shape to save
         * @default undefined
         */
        shape: T;
        /**
         * File name
         * @default shape.step
         */
        fileName = "shape.step";
        /**
         * Adjust Y (up) coordinate system to Z (up) coordinate system
         * @default false
         */
        adjustYtoZ = false;
    }
    export class SaveStlDto<T> {
        constructor(shape?: T, fileName?: string, precision?: number, adjustYtoZ?: boolean) {
            this.shape = shape;
            this.fileName = fileName;
            this.precision = precision;
            this.adjustYtoZ = adjustYtoZ;
        }
        /**
         * Shape to save
         * @default undefined
         */
        shape: T;
        /**
         * File name
         * @default shape.stl
         */
        fileName = "shape.stl";
        /**
         * Precision of the mesh - lower means higher res
         * @default 0.01
         */
        precision = 0.01;
        /**
         * Adjust Y (up) coordinate system to Z (up) coordinate system
         * @default false
         */
        adjustYtoZ = false;
    }
    export class ImportStepIgesFromTextDto {
        constructor(text?: string, fileType?: fileTypeEnum, adjustZtoY?: boolean) {
            this.text ??= text;
            this.fileType ??= fileType;
            this.adjustZtoY ??= adjustZtoY;
        }
        /**
         * The text that represents step or iges contents
         * @default undefined
         */
        text: string;
        /**
         * Identify the import type
         */
        fileType: fileTypeEnum = fileTypeEnum.step;
        /**
         * Adjusts models that use Z coordinate as up to Y up system.
         * @default true
         */
        adjustZtoY = true;
    }
    export class ImportStepIgesDto {
        constructor(assetFile?: File, adjustZtoY?: boolean) {
            this.assetFile = assetFile;
            this.adjustZtoY = adjustZtoY;
        }
        /**
         * The name of the asset to store in the cache.
         * This allows to store the imported objects for multiple run cycles in the cache
         * @default undefined
         */
        assetFile: File;
        /**
         * Adjusts models that use Z coordinate as up to Y up system.
         * @default true
         */
        adjustZtoY = true;
    }
    export class LoadStepOrIgesDto {
        constructor(filetext?: string | ArrayBuffer, fileName?: string, adjustZtoY?: boolean) {
            this.filetext = filetext;
            this.fileName = fileName;
            this.adjustZtoY = adjustZtoY;
        }
        /**
         * File text
         * @default undefined
         */
        filetext: string | ArrayBuffer;
        /**
         * File name
         * @default shape.igs
         */
        fileName = "shape.igs";
        /**
         * Adjusts models that use Z coordinate as up to Y up system.
         * @default true
         */
        adjustZtoY = true;
    }
    export class CompoundShapesDto<T> {
        constructor(shapes?: T[]) {
            this.shapes = shapes;
        }
        /**
         * Shapes to add to compound
         * @default undefined
         */
        shapes: T[];
    }
    export class ThisckSolidSimpleDto<T> {
        constructor(shape?: T, offset?: number) {
            this.shape = shape;
            this.offset = offset;
        }
        /**
         * Shape to make thick
         * @default undefined
         */
        shape: T;
        /**
         * Offset distance
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        offset = 1;
    }
    export class Offset3DWireDto<T> {
        constructor(shape?: T, offset?: number, direction?: Base.Vector3) {
            this.shape ??= shape;
            this.offset ??= offset;
            this.direction ??= direction;
        }
        /**
         * Shape to make thick
         * @default undefined
         */
        shape: T;
        /**
         * Offset distance
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        offset = 1;
        /**
         * Direction normal of the plane for the offset
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class FaceFromWireDto<T> {
        constructor(shape?: T, planar?: boolean) {
            this.shape = shape;
            this.planar = planar;
        }
        /**
         * Wire shape to convert into a face
         * @default undefined
         */
        shape: T;
        /**
         * Should plane be planar
         * @default false
         */
        planar = false;
    }
    export class FaceFromWiresDto<T> {
        constructor(shapes?: T[], planar?: boolean) {
            this.shapes = shapes;
            this.planar = planar;
        }
        /**
         * Wire shapes to convert into a faces
         * @default undefined
         */
        shapes: T[];
        /**
         * Should plane be planar
         * @default false
         */
        planar = false;
    }
    export class FacesFromWiresDto<T> {
        constructor(shapes?: T[], planar?: boolean) {
            this.shapes = shapes;
            this.planar = planar;
        }
        /**
         * Wire shapes to convert into a faces
         * @default undefined
         */
        shapes: T[];
        /**
         * Should plane be planar
         * @default false
         */
        planar = false;
    }
    export class SewDto<T> {
        constructor(shapes: T[], tolerance?: number) {
            this.shapes = shapes;
            this.tolerance = tolerance;
        }
        /**
         * Faces to construct a shell from
         * @default undefined
         */
        shapes: T[];
        /**
         * Tolerance of sewing
         * @default 1.0e-7
         * @minimum 0
         * @maximum Infinity
         * @step 0.00001
         */
        tolerance = 1.0e-7;
    }

    export class FaceIsoCurveAtParamDto<T> {
        constructor(shape?: T, param?: number) {
            this.shape = shape;
            this.param = param;
        }
        /**
         * Face shape
         * @default undefined
         */
        shape: T;
        /**
         * Param at which to find isocurve
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        param: number;
        /**
         * Direction to find the isocurve
         * @default u
         */
        dir: "u" | "v" = "u";
    }

    export class DivideFaceToUVPointsDto<T> {
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Face shape
         * @default undefined
         */
        shape: T;
        /**
         * Number of points on U direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrOfPointsU = 10;
        /**
         * Number of points on V direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrOfPointsV = 10;
        /**
         * Flatten the output
         * @default false
         */
        flat = false;
    }

    export class Geom2dEllipseDto {
        /**
         * Center of the ellipse
         * @default [0,0]
         */
        center: Base.Point2 = [0, 0];
        /**
         * Direction of the vector
         * @default [1,0]
         */
        direction: Base.Vector2 = [1, 0];
        /**
         * Minor radius of an ellipse
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusMinor = 1;
        /**
         * Major radius of an ellipse
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusMajor = 2;
        /**
         * If true will sense the direction
         * @default false
         */
        sense = false;
    }
    export class Geom2dCircleDto {
        /**
         * Center of the circle
         * @default [0,0]
         */
        center: Base.Point2 = [0, 0];
        /**
         * Direction of the vector
         * @default [1,0]
         */
        direction: Base.Vector2 = [1, 0];
        /**
         * Radius of the circle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * If true will sense the direction
         * @default false
         */
        sense = false;
    }
    export class ChristmasTreeDto {
        /**
         * Height of the tree
         * @default 6
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 6;
        /**
         * Inner distance of the branches on the bottom of the tree
         * @default 1.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        innerDist = 1.5;
        /**
         * Outer distance of the branches on the bottom of the tree
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        outerDist = 3;
        /**
         * Number of skirts on the tree (triangle like shapes)
         * @default 5
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrSkirts = 5;
        /**
         * Trunk height
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        trunkHeight = 1;
        /**
         * Trunk width only applies if trunk height is more than 0
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        trunkWidth = 1;
        /**
         * Indicates wether only a half of the tree should be created
         * @default false
         */
        half = false;
        /**
         * Rotation of the tree
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 15
         */
        rotation = 0;
        /**
         * Origin of the tree
         * @default [0, 0, 0]
         */
        origin: Base.Point3 = [0, 0, 0];
        /**
         * Direction of the tree
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class StarDto {
        /**
         * Center of the circle
         * @default [0,0,0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
        /**
         * Direction of the vector
         * @default 7
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        numRays = 7;
        /**
         * Angle of the rays
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        outerRadius: number;
        /**
         * Angle of the rays
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        innerRadius: number;
        /**
         * Offsets outer edge cornerners along the direction vector
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        offsetOuterEdges?: number;
        /**
         * Construct half of the star
         * @default false
         */
        half = false;
    }
    export class ParallelogramDto {
        /**
         * Center of the circle
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
        /**
         * Indicates whether to draw the parallelogram around the center point or start from corner.
         * @default true
         */
        aroundCenter = true;
        /**
         * Width of bounding rectangle
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width = 2;
        /**
         * Height of bounding rectangle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
        /**
         * Sharp angle of the parallelogram
         * @default 15
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        angle = 15;
    }
    export class Heart2DDto {
        /**
         * Center of the circle
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
        /**
         * Rotation of the hear
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 15
         */
        rotation = 0;
        /**
         * Size of the bounding box within which the heart gets drawn
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeApprox = 2;
    }
    export class NGonWireDto {
        /**
         * Center of the circle
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
        /**
         * How many corners to create.
         * @default 6
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        nrCorners = 6;
        /**
         * Radius of nGon
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
    }
    export class EllipseDto {
        /**
         * Center of the ellipse
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction of the vector
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
        /**
         * Minor radius of an ellipse
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusMinor = 1;
        /**
         * Major radius of an ellipse
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusMajor = 2;
    }
    export class GeomCylindricalSurfaceDto {
        /**
         * Radius of the cylindrical surface
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Center of the cylindrical surface
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Axis of direction for cylindrical surface
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class Geom2dTrimmedCurveDto<T>{
        /**
         * 2D Curve to trim
         * @default undefined
         */
        shape: T;
        /**
         * First param on the curve for trimming. U1 can be greater or lower than U2. The returned curve is oriented from U1 to U2.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        u1 = 0;
        /**
         * Second parameter on the curve for trimming
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        u2 = 1;
        /**
         *  If the basis curve C is periodic there is an ambiguity because two parts are available. 
         *  In this case by default the trimmed curve has the same orientation as the basis curve (Sense = True). 
         * If Sense = False then the orientation of the trimmed curve is opposite to the orientation of the basis curve C.
         * @default true
         */
        sense = true;
        /**
         * If the curve is closed but not periodic it is not possible to keep the part of the curve including the
         * junction point (except if the junction point is at the beginning or at the end of the trimmed curve)
         * because you could lose the fundamental characteristics of the basis curve which are used for example
         * to compute the derivatives of the trimmed curve. So for a closed curve the rules are the same as for a open curve.
         * @default true
         */
        adjustPeriodic = true;
    }
    export class Geom2dSegmentDto {
        /**
         * Start 2d point for segment
         * @default [0, 0]
         */
        start: Base.Point2 = [0, 0];
        /**
         * End 2d point for segment
         * @default [1, 0]
         */
        end: Base.Point2 = [1, 0];
    }
    export class SliceDto<T> {
        /**
         * The shape to slice
         * @default undefined
         */
        shape: T;
        /**
         * Step at which to divide the shape
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        step = 0.1;
        /**
         * Direction vector
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class SliceInStepPatternDto<T> {
        /**
         * The shape to slice
         * @default undefined
         */
        shape: T;
        /**
         * Steps that should be used for slicing. This array is going to be treated as a pattern - 
         * this menas that if the actual number of steps is lower than the number of steps in the pattern, the pattern will be repeated.
         * @default [0.1, 0.2]
         */
        steps = [0.1, 0.2];
        /**
         * Direction vector
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
}
