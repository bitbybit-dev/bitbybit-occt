import { Extrema_ExtAlgo, Extrema_ExtFlag, Adaptor3d_Curve, BRepAdaptor_CompCurve_2, Geom2d_Curve, TopoDS_Shell, TopoDS_Solid, GeomAbs_Shape, Geom_Circle, Geom_Curve, Geom_Ellipse, Geom_Surface, gp_Ax1, gp_Ax2, gp_Ax22d_2, gp_Ax2d_2, gp_Ax3, gp_Dir2d_4, gp_Dir_4, gp_Pln_3, gp_Pnt, gp_Pnt2d_3, gp_Pnt_3, gp_Vec2d_4, gp_Vec_4, gp_XYZ_2, Handle_Geom_Curve, OpenCascadeInstance, TopAbs_ShapeEnum, TopoDS_Compound, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Vertex, TopoDS_Wire, ChFi3d_FilletShape, TopAbs_State, BRepFilletAPI_MakeFillet } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { VectorHelperService } from "./api/vector-helper.service";
import { Base } from "./api/inputs/base-inputs";
import * as Inputs from "./api/inputs/inputs";
import { ShapesHelperService } from "./api/shapes-helper.service";
import { OCCReferencedReturns } from "./occ-referenced-returns";

export enum typeSpecificityEnum {
    curve,
    edge,
    wire,
    face,
}

interface TopoDS_ShapeHash extends TopoDS_Shape {
    hash?: number;
}

export class OccHelper {

    private occRefReturns: OCCReferencedReturns;

    constructor(
        public readonly vecHelper: VectorHelperService,
        public readonly shapesHelperService: ShapesHelperService,
        public readonly occ: OpenCascadeInstance,
    ) {
        this.occRefReturns = new OCCReferencedReturns(occ);
    }

    getCornerPointsOfEdgesForShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        const edges = this.getEdges(inputs);
        let points: Inputs.Base.Point3[] = [];
        edges.forEach((edge) => {
            const param1 = { current: 0 };
            const param2 = { current: 0 };
            const crvHandle = this.occRefReturns.BRep_Tool_Curve_2(edge, param1, param2);

            try {
                const crv = crvHandle.get();
                const pt1 = crv.Value(param1.current);
                const pt2 = crv.Value(param2.current);
                const pt1g: Inputs.Base.Point3 = [pt1.X(), pt1.Y(), pt1.Z()];
                const pt2g: Inputs.Base.Point3 = [pt2.X(), pt2.Y(), pt2.Z()];
                pt1.delete();
                pt2.delete();
                points.push(pt1g);
                points.push(pt2g);
            } catch (ex) {
                console.log(ex);
            }
        });
        if (points.length > 0) {
            points = this.vecHelper.removeAllDuplicateVectors(points) as Inputs.Base.Point3[];
        }
        return points;
    }

    splitShapeWithShapes(inputs: Inputs.OCCT.SplitDto<TopoDS_Shape>): TopoDS_Shape {
        const listOfShapes = new this.occ.TopTools_ListOfShape_1();
        inputs.shapes.forEach(shape => {
            listOfShapes.Append_1(shape);
        });
        const shape = this.occ.BitByBitDev.BitSplit(inputs.shape, listOfShapes);
        return shape;
    }

    extrude(inputs: Inputs.OCCT.ExtrudeDto<TopoDS_Shape>): TopoDS_Shape {
        const gpVec = new this.occ.gp_Vec_4(inputs.direction[0], inputs.direction[1], inputs.direction[2]);
        const prismMaker = new this.occ.BRepPrimAPI_MakePrism_1(
            inputs.shape,
            gpVec,
            false,
            true
        );
        const prismShape = prismMaker.Shape();
        prismMaker.delete();
        gpVec.delete();
        return prismShape;
    }

    makeCompound(inputs: Inputs.OCCT.CompoundShapesDto<TopoDS_Shape>): TopoDS_Compound {
        const resCompound = new this.occ.TopoDS_Compound();
        const builder = new this.occ.BRep_Builder();
        builder.MakeCompound(resCompound);
        inputs.shapes.forEach(shape => {
            const cp = new this.occ.BRepBuilderAPI_Copy_2(shape, true, false);
            const s = cp.Shape();
            builder.Add(resCompound, s);
            cp.delete();
            s.delete();
        });
        builder.delete();
        return resCompound;
    }

    makeCompoundIfNeeded(shapes: TopoDS_Shape[], returnCompound: boolean) {
        if (returnCompound) {
            const compound = this.makeCompound({ shapes });
            shapes.forEach(w => w.delete());
            return compound;
        } else {
            return shapes;
        }
    }

    gpAx3(point: Base.Point3, direction: Base.Vector3): gp_Ax3 {
        return new this.occ.gp_Ax3_4(
            this.gpPnt(point),
            this.gpDir(direction)
        );
    }

    gpAx2(point: Base.Point3, direction: Base.Vector3): gp_Ax2 {
        return new this.occ.gp_Ax2_3(
            this.gpPnt(point),
            this.gpDir(direction)
        );
    }

    gpAx2FromTwoVectors(point: Base.Point3, directionFirst: Base.Vector3, directionSecond: Base.Vector3): gp_Ax2 {
        return new this.occ.gp_Ax2_2(
            this.gpPnt(point),
            this.gpDir(directionFirst),
            this.gpDir(directionSecond)
        );
    }

    gpAx1(point: Base.Point3, direction: Base.Vector3): gp_Ax1 {
        return new this.occ.gp_Ax1_2(
            this.gpPnt(point),
            this.gpDir(direction)
        );
    }

    gpAx2d(point: Base.Point2, direction: Base.Vector2): gp_Ax2d_2 {
        const pt = this.gpPnt2d(point);
        const dir = this.gpDir2d(direction);
        return new this.occ.gp_Ax2d_2(pt, dir);
    }

    gpAx22d(point: Base.Point2, direction1: Base.Vector2, direction2: Base.Vector2): gp_Ax22d_2 {
        const pt = this.gpPnt2d(point);
        const dir1 = this.gpDir2d(direction1);
        const dir2 = this.gpDir2d(direction2);
        const ax = new this.occ.gp_Ax22d_2(pt, dir1, dir2);
        dir1.delete();
        dir2.delete();
        pt.delete();
        return ax;
    }

    gpPln(point: Base.Point3, direction: Base.Vector3): gp_Pln_3 {
        const gpPnt = this.gpPnt(point);
        const gpDir = this.gpDir(direction);
        const pln = new this.occ.gp_Pln_3(gpPnt, gpDir);
        gpPnt.delete();
        gpDir.delete();
        return pln;
    }

    gpPnt2d(point: Base.Point2): gp_Pnt2d_3 {
        return new this.occ.gp_Pnt2d_3(point[0], point[1]);
    }

    gpPnt(point: Base.Point3): gp_Pnt_3 {
        return new this.occ.gp_Pnt_3(point[0], point[1], point[2]);
    }

    gpVec(vec: Base.Vector3): gp_Vec_4 {
        return new this.occ.gp_Vec_4(vec[0], vec[1], vec[2]);
    }

    gpXYZ(point: Base.Point3): gp_XYZ_2 {
        return new this.occ.gp_XYZ_2(point[0], point[1], point[2]);
    }

    gpVec2d(vec: Base.Vector2): gp_Vec2d_4 {
        return new this.occ.gp_Vec2d_4(vec[0], vec[1]);
    }

    gpDir(direction: Base.Vector3): gp_Dir_4 {
        return new this.occ.gp_Dir_4(direction[0], direction[1], direction[2]);
    }

    gpDir2d(direction: Base.Point2): gp_Dir2d_4 {
        return new this.occ.gp_Dir2d_4(direction[0], direction[1]);
    }

    gcMakeCircle(center: Base.Point3, direction: Base.Vector3, radius: number): Geom_Circle {
        const circle = new this.occ.GC_MakeCircle_2(this.gpAx2(center, direction), radius);
        const cirVal = circle.Value();
        const cir = cirVal.get();
        circle.delete();
        return cir;
    }

    gcMakeEllipse(center: Base.Point3, direction: Base.Vector3, minorRadius: number, majorRadius: number): Geom_Ellipse {
        const ax = this.gpAx2(center, direction);
        const ellipse = new this.occ.GC_MakeEllipse_2(ax, majorRadius, minorRadius);
        if (ellipse.IsDone()) {
            const ellipseVal = ellipse.Value();
            const ell = ellipseVal.get();
            ellipse.delete();
            ax.delete();
            return ell;
        } else {
            throw new Error("Ellipse could not be created.");
        }
    }

    bRepBuilderAPIMakeEdge(curve: Geom_Curve): TopoDS_Edge {
        const crv = this.castToHandleGeomCurve(curve);
        const edge = new this.occ.BRepBuilderAPI_MakeEdge_24(crv);
        const ed = edge.Edge();
        edge.delete();
        crv.delete();
        return ed;
    }

    bRepBuilderAPIMakeWire(edge: TopoDS_Edge): TopoDS_Wire {
        const wire = new this.occ.BRepBuilderAPI_MakeWire_2(edge);
        const w = wire.Wire();
        wire.delete();
        return w;
    }

    makeVertex(pt: Base.Point3): TopoDS_Vertex {
        const gpPnt = this.gpPnt(pt);
        const vert = new this.occ.BRepBuilderAPI_MakeVertex(gpPnt);
        const vrt = vert.Vertex();
        gpPnt.delete();
        vert.delete();
        return vrt;
    }

    bRepBuilderAPIMakeShell(face: TopoDS_Face): TopoDS_Shell {
        const srf = this.occ.BRep_Tool.Surface_2(face);
        const makeShell = new this.occ.BRepBuilderAPI_MakeShell_2(
            srf,
            false);

        const shell = makeShell.Shell();
        makeShell.delete();
        srf.delete();
        return shell;
    }

    bRepBuilderAPIMakeFaceFromWires(wires: TopoDS_Wire[], planar: boolean): TopoDS_Face {
        let face;
        const faces = [];
        wires.forEach(currentWire => {
            if (faces.length > 0) {
                const faceBuilder = new this.occ.BRepBuilderAPI_MakeFace_22(
                    faces[faces.length - 1], currentWire);
                faces.push(faceBuilder.Face());
                faceBuilder.delete();
            } else {
                const faceBuilder = new this.occ.BRepBuilderAPI_MakeFace_15(currentWire, planar);
                faces.push(faceBuilder.Face());
                faceBuilder.delete();
            }

        });
        if (faces.length > 0) {
            face = faces.pop();
            faces.forEach(f => f.delete());
        }
        return face;
    }

    bRepBuilderAPIMakeFaceFromWire(wire: TopoDS_Wire, planar: boolean): TopoDS_Face {
        const faceMaker = new this.occ.BRepBuilderAPI_MakeFace_15(wire, planar);
        const face = faceMaker.Face();
        faceMaker.delete();
        return face;
    }

    bRepBuilderAPIMakeFaceFromSurface(surface: Geom_Surface, tolDegen: number): TopoDS_Face {
        const hs = new this.occ.Handle_Geom_Surface_2(surface);
        const faceMaker = new this.occ.BRepBuilderAPI_MakeFace_8(hs, tolDegen);
        const face = faceMaker.Face();
        faceMaker.delete();
        hs.delete();
        return face;
    }

    bRepBuilderAPIMakeFaceFromSurfaceAndWire(surface: Geom_Surface, wire: TopoDS_Wire, inside: boolean): TopoDS_Face {
        const hs = new this.occ.Handle_Geom_Surface_2(surface);
        const faceMaker = new this.occ.BRepBuilderAPI_MakeFace_21(hs, wire, inside);
        const face = faceMaker.Face();
        faceMaker.delete();
        hs.delete();
        return face;
    }

    bRepPrimAPIMakeSphere(center: Base.Point3, direction: Base.Vector3, radius: number): TopoDS_Shape {
        const ax = this.gpAx2(center, direction);
        const sphereMaker = new this.occ.BRepPrimAPI_MakeSphere_9(ax, radius);
        const sphere = sphereMaker.Shape();
        sphereMaker.delete();
        ax.delete();
        return sphere;
    }

    closestPointsBetweenTwoShapes(shape1: TopoDS_Shape, shape2: TopoDS_Shape): [Base.Point3, Base.Point3] {
        const messageProgress = new this.occ.Message_ProgressRange_1();
        const extrema = new this.occ.BRepExtrema_DistShapeShape_2(
            shape1,
            shape2,
            this.occ.Extrema_ExtFlag.Extrema_ExtFlag_MIN as Extrema_ExtFlag,
            this.occ.Extrema_ExtAlgo.Extrema_ExtAlgo_Grad as Extrema_ExtAlgo,
            messageProgress
        );
        const messageProgress1 = new this.occ.Message_ProgressRange_1();
        extrema.Perform(messageProgress1);
        if (extrema.IsDone() && extrema.NbSolution() > 0) {
            const closestPoint1 = extrema.PointOnShape1(1);
            const closestPoint2 = extrema.PointOnShape2(1);
            return [[closestPoint1.X(), closestPoint1.Y(), closestPoint1.Z()], [closestPoint2.X(), closestPoint2.Y(), closestPoint2.Z()]];
        } else {
            throw new Error("Closest points could not be found.");
        }
    }

    bRepPrimAPIMakeCylinder(center: Base.Point3, direction: Base.Vector3, radius, height): TopoDS_Shape {
        const ax = this.gpAx2(center, direction);
        const cylinderMaker = new this.occ.BRepPrimAPI_MakeCylinder_3(ax, radius, height);
        const cylinder = cylinderMaker.Shape();
        cylinderMaker.delete();
        ax.delete();
        return cylinder;
    }

    bRepPrimAPIMakeCylinderBetweenPoints(start: Base.Point3, end: Base.Point3, radius: number): TopoDS_Shape {
        const center = this.gpPnt(start);
        const pt = this.gpPnt(end);
        const vec = new this.occ.gp_Vec_5(center, pt);
        const distance = vec.Magnitude();
        const ax = this.gpAx2(start, [vec.X(), vec.Y(), vec.Z()]);
        const cylinderMaker = new this.occ.BRepPrimAPI_MakeCylinder_3(ax, radius, distance);
        const cylinder = cylinderMaker.Shape();
        cylinderMaker.delete();
        ax.delete();
        center.delete();
        pt.delete();
        vec.delete();
        return cylinder;
    }

    bRepPrimAPIMakeBox(width: number, length: number, height: number, center: number[]): TopoDS_Shape {
        const pt = this.gpPnt([
            -width / 2 + center[0],
            -height / 2 + center[1],
            -length / 2 + center[2]
        ]);
        const boxMaker = new this.occ.BRepPrimAPI_MakeBox_3(pt, width, height, length);
        const box = boxMaker.Shape();
        boxMaker.delete();
        pt.delete();
        return box;
    }

    getEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Edge[] {
        if (inputs.shape && this.getShapeTypeEnum(inputs.shape) === Inputs.OCCT.shapeTypeEnum.edge) {
            return [inputs.shape];
        }
        if (!inputs.shape || (this.getShapeTypeEnum(inputs.shape) === Inputs.OCCT.shapeTypeEnum.vertex) || inputs.shape.IsNull()) {
            throw (new Error("Shape is not provided or is of incorrect type"));
        }
        const edges: TopoDS_Edge[] = [];
        this.forEachEdge(inputs.shape, (i, edge) => {
            edges.push(edge);
        });
        return edges;
    }

    getEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Edge[] {
        if (inputs.shape && this.getShapeTypeEnum(inputs.shape) === Inputs.OCCT.shapeTypeEnum.edge) {
            return [inputs.shape];
        }
        if (!inputs.shape || (this.getShapeTypeEnum(inputs.shape) === Inputs.OCCT.shapeTypeEnum.vertex) || inputs.shape.IsNull()) {
            throw (new Error("Shape is not provided or is of incorrect type"));
        }
        const edges: TopoDS_Edge[] = [];
        const wireWithFixedEdges = this.fixEdgeOrientationsAlongWire(inputs);
        this.forEachEdgeAlongWire(wireWithFixedEdges, (i, edge) => {
            edges.push(edge);
        });
        return edges;
    }

    fixEdgeOrientationsAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        const edges = [];
        this.forEachEdgeAlongWire(inputs.shape, (i, edge) => {
            edges.push(edge);
        });
        // rebuilding wire from edges along wire fixes edge directions
        return this.combineEdgesAndWiresIntoAWire({ shapes: edges });
    }

    lineEdge(inputs: Inputs.OCCT.LineDto) {
        const gpPnt1 = this.gpPnt(inputs.start);
        const gpPnt2 = this.gpPnt(inputs.end);
        const segment = new this.occ.GC_MakeSegment_1(gpPnt1, gpPnt2);
        const segVal = segment.Value();
        const seg = segVal.get();
        const hcurve = new this.occ.Handle_Geom_Curve_2(seg);
        const edgeMaker = new this.occ.BRepBuilderAPI_MakeEdge_24(hcurve);
        const edge = edgeMaker.Edge();
        edgeMaker.delete();
        hcurve.delete();
        gpPnt1.delete();
        gpPnt2.delete();
        segVal.delete();
        seg.delete();
        return edge;
    }

    getEdgeLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>) {
        const edge = inputs.shape;
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.LinearProperties(edge, gprops, false, false);
        const mass = gprops.Mass();
        gprops.delete();
        return mass;
    }

    getEdgesLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): number[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return inputs.shapes.map(edge => this.getEdgeLength({ shape: edge }));
    }

    getLinearCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Base.Point3 {
        const edge: TopoDS_Shape = inputs.shape;
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.LinearProperties(edge, gprops, false, false);
        const gppnt = gprops.CentreOfMass();
        const pt: Base.Point3 = [gppnt.X(), gppnt.Y(), gppnt.Z()];
        gprops.delete();
        return pt;
    }

    getShapesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): Base.Point3[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return inputs.shapes.map(edge => this.getLinearCenterOfMass({ shape: edge }));
    }

    getWireLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): number {
        const edges = this.getEdges(inputs);
        const lengths = edges.map(edge => this.getEdgeLength({ shape: edge }));
        return lengths.reduce((p, c) => p + c, 0);
    }

    getWiresLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire>): number[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return inputs.shapes.map(wire => this.getWireLength({ shape: wire }));
    }

    getFaces(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Face[] {
        const faces: TopoDS_Face[] = [];
        this.forEachFace(inputs.shape, (faceIndex, myFace) => {
            faces.push(myFace);
        });
        return faces;
    }

    getSolids(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Solid[] {
        const solids: TopoDS_Face[] = [];
        this.forEachSolid(inputs.shape, (faceIndex, myFace) => {
            solids.push(myFace);
        });
        return solids;
    }

    getFaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.SurfaceProperties_1(inputs.shape, gprops, false, false);
        const area = gprops.Mass();
        gprops.delete();
        return area;
    }

    getFacesAreas(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): number[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return inputs.shapes.map(face => this.getFaceArea({ shape: face }));
    }

    getFaceCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): Base.Point3 {
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.SurfaceProperties_1(inputs.shape, gprops, false, false);
        const gppnt = gprops.CentreOfMass();
        const pt: Base.Point3 = [gppnt.X(), gppnt.Y(), gppnt.Z()];
        gprops.delete();
        gppnt.delete();
        return pt;
    }

    getFacesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): Base.Point3[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return inputs.shapes.map(face => this.getFaceCenterOfMass({ shape: face }));
    }

    filterFacePoints(inputs: Inputs.OCCT.FilterFacePointsDto<TopoDS_Face>): Base.Point3[] {
        const points = [];
        if (inputs.points.length > 0) {
            const classifier = new this.occ.BRepClass_FaceClassifier_1();
            inputs.points.forEach(pt => {
                const gpPnt = this.gpPnt(pt);
                classifier.Perform_2(inputs.shape, gpPnt, inputs.tolerance, inputs.useBndBox, inputs.gapTolerance);
                const top = classifier.State();
                const type = this.getTopAbsStateEnum(top);
                if (inputs.keepOn && type === Inputs.OCCT.topAbsStateEnum.on) {
                    points.push(pt);
                }
                if (inputs.keepIn && type === Inputs.OCCT.topAbsStateEnum.in) {
                    points.push(pt);
                }
                if (inputs.keepOut && type === Inputs.OCCT.topAbsStateEnum.out) {
                    points.push(pt);
                }
                if (inputs.keepUnknown && type === Inputs.OCCT.topAbsStateEnum.unknown) {
                    points.push(pt);
                }
                gpPnt.delete();
            });
            classifier.delete();
            return points;
        } else {
            return [];
        }
    }

    filterSolidPoints(inputs: Inputs.OCCT.FilterSolidPointsDto<TopoDS_Face>): Base.Point3[] {
        const points = [];
        if (inputs.points.length > 0) {
            const classifier = new this.occ.BRepClass3d_SolidClassifier_1();
            classifier.Load(inputs.shape);
            inputs.points.forEach(pt => {
                const gpPnt = this.gpPnt(pt);
                classifier.Perform(gpPnt, inputs.tolerance);
                const top = classifier.State();
                const type = this.getTopAbsStateEnum(top);
                if (inputs.keepOn && type === Inputs.OCCT.topAbsStateEnum.on) {
                    points.push(pt);
                }
                if (inputs.keepIn && type === Inputs.OCCT.topAbsStateEnum.in) {
                    points.push(pt);
                }
                if (inputs.keepOut && type === Inputs.OCCT.topAbsStateEnum.out) {
                    points.push(pt);
                }
                if (inputs.keepUnknown && type === Inputs.OCCT.topAbsStateEnum.unknown) {
                    points.push(pt);
                }
                gpPnt.delete();
            });
            classifier.delete();
            return points;
        } else {
            return [];
        }
    }
    getSolidVolume(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.VolumeProperties_1(inputs.shape, gprops, true, false, false);
        const vol = gprops.Mass();
        gprops.delete();
        return vol;
    }

    getShellSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): number {
        const faces = this.getFaces(inputs);
        const faceAreas = this.getFacesAreas({ shapes: faces });
        return faceAreas.reduce((p, c) => p + c, 0);
    }

    sewFaces(inputs: Inputs.OCCT.SewDto<TopoDS_Face>): TopoDS_Shell {
        const sew = new this.occ.BRepBuilderAPI_Sewing(inputs.tolerance, true, true, true, false);
        inputs.shapes.forEach(face => {
            sew.Add(face);
        });
        const messageProgress = new this.occ.Message_ProgressRange_1();
        sew.Perform(messageProgress);
        const res = sew.SewedShape();
        const result = this.getActualTypeOfShape(res);
        sew.delete();
        messageProgress.delete();
        res.delete();
        return result;
    }

    getSolidSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        const faces = this.getFaces(inputs);
        const faceAreas = this.getFacesAreas({ shapes: faces });
        return faceAreas.reduce((p, c) => p + c, 0);
    }

    getSolidsVolumes(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): number[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return inputs.shapes.map(s => this.getSolidVolume({ shape: s }));
    }

    getSolidCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): Base.Point3 {
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.VolumeProperties_1(inputs.shape, gprops, true, false, false);
        const gppnt = gprops.CentreOfMass();
        const pt: Base.Point3 = [gppnt.X(), gppnt.Y(), gppnt.Z()];
        gprops.delete();
        gppnt.delete();
        return pt;
    }

    getSolidsCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): Base.Point3[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return inputs.shapes.map(s => this.getSolidCenterOfMass({ shape: s }));
    }

    castToHandleGeomCurve(curve: Geom_Curve): Handle_Geom_Curve {
        return new this.occ.Handle_Geom_Curve_2(curve);
    }

    getActualTypeOfShape(shape: TopoDS_Shape): TopoDS_Edge | TopoDS_Wire | TopoDS_Vertex | TopoDS_Solid | TopoDS_Shell | TopoDS_Face | TopoDS_Compound {
        let result = shape;
        if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
            result = this.occ.TopoDS.Edge_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE) {
            result = this.occ.TopoDS.Wire_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_VERTEX) {
            result = this.occ.TopoDS.Vertex_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_SOLID) {
            result = this.occ.TopoDS.Solid_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_SHELL) {
            result = this.occ.TopoDS.Shell_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_FACE) {
            result = this.occ.TopoDS.Face_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_COMPSOLID) {
            result = this.occ.TopoDS.CompSolid_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_COMPOUND) {
            result = this.occ.TopoDS.Compound_1(shape);
        } else {
            result = shape;
        }
        return result;
    }

    getShapeTypeEnum(shape: TopoDS_Shape): Inputs.OCCT.shapeTypeEnum {
        let result = Inputs.OCCT.shapeTypeEnum.unknown;
        const st = shape.ShapeType();
        if (st === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
            result = Inputs.OCCT.shapeTypeEnum.edge;
        } else if (st === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE) {
            result = Inputs.OCCT.shapeTypeEnum.wire;
        } else if (st === this.occ.TopAbs_ShapeEnum.TopAbs_VERTEX) {
            result = Inputs.OCCT.shapeTypeEnum.vertex;
        } else if (st === this.occ.TopAbs_ShapeEnum.TopAbs_SOLID) {
            result = Inputs.OCCT.shapeTypeEnum.solid;
        } else if (st === this.occ.TopAbs_ShapeEnum.TopAbs_SHELL) {
            result = Inputs.OCCT.shapeTypeEnum.shell;
        } else if (st === this.occ.TopAbs_ShapeEnum.TopAbs_FACE) {
            result = Inputs.OCCT.shapeTypeEnum.face;
        } else if (st === this.occ.TopAbs_ShapeEnum.TopAbs_COMPSOLID) {
            result = Inputs.OCCT.shapeTypeEnum.compSolid;
        } else if (st === this.occ.TopAbs_ShapeEnum.TopAbs_COMPOUND) {
            result = Inputs.OCCT.shapeTypeEnum.compound;
        } else {
            result = Inputs.OCCT.shapeTypeEnum.shape;
        }
        return result;
    }

    getTopAbsStateEnum(state: TopAbs_State): Inputs.OCCT.topAbsStateEnum {
        let result = Inputs.OCCT.topAbsStateEnum.unknown;
        if (state === this.occ.TopAbs_State.TopAbs_IN) {
            result = Inputs.OCCT.topAbsStateEnum.in;
        } else if (state === this.occ.TopAbs_State.TopAbs_OUT) {
            result = Inputs.OCCT.topAbsStateEnum.out;
        } else if (state === this.occ.TopAbs_State.TopAbs_ON) {
            result = Inputs.OCCT.topAbsStateEnum.on;
        } else {
            result = Inputs.OCCT.topAbsStateEnum.unknown;
        }
        return result;
    }

    createCircle(radius: number, center: Base.Point3, direction: Base.Vector3, type: typeSpecificityEnum) {
        const circle = this.gcMakeCircle(center, direction, radius);
        if (type === typeSpecificityEnum.curve) {
            return circle;
        } else {
            const edge = this.bRepBuilderAPIMakeEdge(circle);
            if (type === typeSpecificityEnum.edge) {
                return edge;
            } else {
                const circleWire = this.bRepBuilderAPIMakeWire(edge);
                if (type === typeSpecificityEnum.wire) {
                    edge.delete();
                    return circleWire;
                } else if (type === typeSpecificityEnum.face) {
                    const face = this.bRepBuilderAPIMakeFaceFromWire(circleWire, true);
                    return face;
                }
            }
        }
        return circle;
    }

    createEllipse(minorRadius: number, majorRadius: number, center: Base.Point3, direction: Base.Vector3, type: typeSpecificityEnum) {
        const ellipse = this.gcMakeEllipse(center, direction, minorRadius, majorRadius);
        if (type === typeSpecificityEnum.curve) {
            return ellipse;
        } else {
            const edge = this.bRepBuilderAPIMakeEdge(ellipse);
            if (type === typeSpecificityEnum.edge) {
                return edge;
            } else {
                const ellipseWire = this.bRepBuilderAPIMakeWire(edge);
                if (type === typeSpecificityEnum.wire) {
                    edge.delete();
                    return ellipseWire;
                } else if (type === typeSpecificityEnum.face) {
                    const face = this.bRepBuilderAPIMakeFaceFromWire(ellipseWire, true);
                    return face;
                }
            }
        }
        return ellipse;
    }

    createSquareFace(inputs: Inputs.OCCT.SquareDto): TopoDS_Face {
        const squareWire = this.createSquareWire(inputs);
        const faceMakerFromWire = this.bRepBuilderAPIMakeFaceFromWire(squareWire, true);
        squareWire.delete();
        return faceMakerFromWire;
    }

    createRectangleFace(inputs: Inputs.OCCT.RectangleDto): TopoDS_Face {
        const rectangleWire = this.createRectangleWire(inputs);
        const faceMakerFromWire = this.bRepBuilderAPIMakeFaceFromWire(rectangleWire, true);
        rectangleWire.delete();
        return faceMakerFromWire;
    }

    createRectangleWire(inputs: Inputs.OCCT.RectangleDto): TopoDS_Wire {
        const cw = inputs.width / 2;
        const cl = inputs.length / 2;
        const pt1: Base.Point3 = [cw, 0, cl];
        const pt2: Base.Point3 = [-cw, 0, cl];
        const pt3: Base.Point3 = [-cw, 0, -cl];
        const pt4: Base.Point3 = [cw, 0, -cl];
        const points = [pt1, pt2, pt3, pt4].reverse();
        const wire = this.createPolygonWire({ points });
        const alignedWire = this.alignAndTranslate({ shape: wire, direction: inputs.direction, center: inputs.center });
        wire.delete();
        return alignedWire;
    }

    alignAndTranslate(inputs: Inputs.OCCT.AlignAndTranslateDto<TopoDS_Shape>): TopoDS_Shape {
        const alignedShape = this.align(
            {
                shape: inputs.shape,
                fromOrigin: [0, 0, 0],
                fromDirection: [0, 1, 0],
                toOrigin: [0, 0, 0],
                toDirection: inputs.direction
            }
        );
        const translated = this.translate(
            {
                shape: alignedShape,
                translation: inputs.center
            }
        );
        alignedShape.delete();
        return translated;
    }

    createSquareWire(inputs: Inputs.OCCT.SquareDto): TopoDS_Wire {
        return this.createRectangleWire({
            width: inputs.size,
            length: inputs.size,
            center: inputs.center,
            direction: inputs.direction
        });
    }

    createChristmasTreeWire(inputs: Inputs.OCCT.ChristmasTreeDto) {
        const frameInner = this.createLineWire({
            start: [inputs.innerDist, 0, 0],
            end: [0, inputs.height, 0],
        });

        const frameOuter = this.createLineWire({
            start: [inputs.outerDist, 0, 0],
            end: [0, inputs.height, 0],
        });

        const pointsOnInner = this.divideWireByEqualDistanceToPoints({
            shape: frameInner,
            nrOfDivisions: inputs.nrSkirts,
            removeEndPoint: false,
            removeStartPoint: false,
        });

        const pointsOnOuter = this.divideWireByEqualDistanceToPoints({
            shape: frameOuter,
            nrOfDivisions: inputs.nrSkirts,
            removeEndPoint: false,
            removeStartPoint: false,
        });
        const halfShapeTreePts: Base.Point3[] = [];
        if (inputs.trunkWidth > 0 && inputs.trunkHeight > 0) {
            halfShapeTreePts.push([0, -inputs.trunkHeight, 0]);
            halfShapeTreePts.push([inputs.trunkWidth / 2, -inputs.trunkHeight, 0]);
            halfShapeTreePts.push([inputs.trunkWidth / 2, 0, 0]);
        } else {
            halfShapeTreePts.push([0, 0, 0]);
        }

        pointsOnInner.forEach((pt, index) => {
            const ptOnOuter = pointsOnOuter[index];
            if (index === 0) {
                halfShapeTreePts.push(ptOnOuter);
            } else if (index !== 0 && index < pointsOnOuter.length - 1) {
                halfShapeTreePts.push([pt[0], ptOnOuter[1] + ((inputs.height / inputs.nrSkirts) * 0.1), pt[2]]);
                halfShapeTreePts.push(ptOnOuter);
            } else {
                halfShapeTreePts.push(pt);
            }
        });

        if (!inputs.half) {
            const secondHalf = halfShapeTreePts.map(pt => [-pt[0], pt[1], pt[2]] as Base.Point3);
            secondHalf.pop();
            halfShapeTreePts.push(...secondHalf.reverse());
        }

        let result;
        if (inputs.trunkHeight > 0 && inputs.trunkWidth > 0) {
            const offsetToTrunkHeight = halfShapeTreePts.map(pt => [pt[0], pt[1] + inputs.trunkHeight, pt[2]] as Base.Point3);
            result = this.createPolylineWire({ points: offsetToTrunkHeight });
        } else {
            result = this.createPolylineWire({ points: halfShapeTreePts });
        }

        const rotated = this.rotate({ shape: result, angle: inputs.rotation, axis: [0, 1, 0] });
        const aligned = this.alignAndTranslate({ shape: rotated, direction: inputs.direction, center: inputs.origin });

        return aligned;
    }

    createStarWire(inputs: Inputs.OCCT.StarDto) {
        const lines = this.shapesHelperService.starLines(inputs.innerRadius, inputs.outerRadius, inputs.numRays, inputs.half, inputs.offsetOuterEdges);
        const edges: TopoDS_Edge[] = [];
        lines.forEach(line => {
            edges.push(this.lineEdge(line));
        });
        const wire = this.combineEdgesAndWiresIntoAWire({ shapes: edges });
        const alignedWire = this.alignAndTranslate({ shape: wire, direction: inputs.direction, center: inputs.center });
        wire.delete();
        return alignedWire;
    }

    createParallelogramWire(inputs: Inputs.OCCT.ParallelogramDto) {
        const lines = this.shapesHelperService.parallelogram(inputs.width, inputs.height, inputs.angle, inputs.aroundCenter);
        const edges: TopoDS_Edge[] = [];
        lines.forEach(line => {
            edges.push(this.lineEdge(line));
        });
        const wire = this.combineEdgesAndWiresIntoAWire({ shapes: edges });
        const aligned = this.alignAndTranslate({ shape: wire, direction: inputs.direction, center: inputs.center });
        wire.delete();
        return aligned;
    }

    createHeartWire(inputs: Inputs.OCCT.Heart2DDto) {
        const sizeOfBox = inputs.sizeApprox;
        const halfSize = sizeOfBox / 2;

        const points1: Inputs.Base.Point3[] = [
            [0, 0, halfSize * 0.7],
            [halfSize / 6, 0, halfSize * 0.9],
            [halfSize / 2, 0, halfSize],
            [halfSize * 0.75, 0, halfSize * 0.9],
            [halfSize, 0, halfSize / 4],
            [halfSize / 2, 0, -halfSize / 2],
            [0, 0, -halfSize],
        ];

        const points2: Inputs.Base.Point3[] = points1.map(p => [-p[0], p[1], p[2]]);

        const tolerance = 0.00001;
        const wireFirstHalf = this.interpolatePoints({
            points: points1, periodic: false, tolerance
        });

        const wireSecondHalf = this.interpolatePoints({
            points: points2.reverse(), periodic: false, tolerance
        });

        const wire = this.combineEdgesAndWiresIntoAWire({ shapes: [wireFirstHalf, wireSecondHalf] });
        const rotated = this.rotate({ shape: wire, angle: inputs.rotation, axis: [0, 1, 0] });
        const aligned = this.alignAndTranslate({ shape: rotated, direction: inputs.direction, center: inputs.center });
        wire.delete();
        rotated.delete();
        wireFirstHalf.delete();
        wireSecondHalf.delete();
        return aligned;
    }

    createNGonWire(inputs: Inputs.OCCT.NGonWireDto) {
        const lines = this.shapesHelperService.ngon(inputs.nrCorners, inputs.radius, [0, 0]);
        const edges: TopoDS_Edge[] = [];
        lines.forEach(line => {
            edges.push(this.lineEdge(line));
        });
        const wire = this.combineEdgesAndWiresIntoAWire({ shapes: edges });
        const aligned = this.alignAndTranslate({ shape: wire, direction: inputs.direction, center: inputs.center });
        wire.delete();
        return aligned;
    }

    createLPolygonWire(inputs: Inputs.OCCT.LPolygonDto) {
        let points: Base.Point3[];
        switch (inputs.align) {
            case Inputs.OCCT.directionEnum.outside:
                points = this.shapesHelperService.polygonL(inputs.widthFirst, inputs.lengthFirst, inputs.widthSecond, inputs.lengthSecond);
                break;
            case Inputs.OCCT.directionEnum.inside:
                points = this.shapesHelperService.polygonLInverted(inputs.widthFirst, inputs.lengthFirst, inputs.widthSecond, inputs.lengthSecond);
                break;
            case Inputs.OCCT.directionEnum.middle:
                points = this.shapesHelperService.polygonLMiddle(inputs.widthFirst, inputs.lengthFirst, inputs.widthSecond, inputs.lengthSecond);
                break;
            default:
                points = this.shapesHelperService.polygonL(inputs.widthFirst, inputs.lengthFirst, inputs.widthSecond, inputs.lengthSecond);
        }
        const wire = this.createPolygonWire({
            points
        });

        const rotated = this.rotate({ shape: wire, angle: inputs.rotation, axis: [0, 1, 0] });
        const aligned = this.alignAndTranslate({ shape: rotated, direction: inputs.direction, center: inputs.center });
        wire.delete();
        rotated.delete();
        return aligned;
    }

    createPolygonWire(inputs: Inputs.OCCT.PolygonDto) {
        const gpPoints: gp_Pnt_3[] = [];
        for (let ind = 0; ind < inputs.points.length; ind++) {
            gpPoints.push(this.gpPnt(inputs.points[ind]));
        }

        const wireMaker = new this.occ.BRepBuilderAPI_MakeWire_1();
        for (let ind = 0; ind < inputs.points.length - 1; ind++) {
            const pt1 = gpPoints[ind];
            const pt2 = gpPoints[ind + 1];
            const innerWire = this.makeWireBetweenTwoPoints(pt1, pt2);
            wireMaker.Add_2(innerWire);
        }

        const pt1 = gpPoints[inputs.points.length - 1];
        const pt2 = gpPoints[0];
        const innerWire2 = this.makeWireBetweenTwoPoints(pt1, pt2);
        wireMaker.Add_2(innerWire2);
        const wire = wireMaker.Wire();
        wireMaker.delete();
        return wire;
    }

    createPolylineWire(inputs: Inputs.OCCT.PolylineDto) {
        const gpPoints: gp_Pnt_3[] = [];
        for (let ind = 0; ind < inputs.points.length; ind++) {
            gpPoints.push(this.gpPnt(inputs.points[ind]));
        }

        const wireMaker = new this.occ.BRepBuilderAPI_MakeWire_1();
        for (let ind = 0; ind < inputs.points.length - 1; ind++) {
            const pt1 = gpPoints[ind];
            const pt2 = gpPoints[ind + 1];
            const innerWire = this.makeWireBetweenTwoPoints(pt1, pt2);
            wireMaker.Add_2(innerWire);
        }

        const wire = wireMaker.Wire();
        wireMaker.delete();
        return wire;
    }

    createLineWire(inputs: Inputs.OCCT.LineDto) {
        const gpPoints: gp_Pnt_3[] = [];
        gpPoints.push(this.gpPnt(inputs.start));
        gpPoints.push(this.gpPnt(inputs.end));

        const wireMaker = new this.occ.BRepBuilderAPI_MakeWire_1();
        for (let ind = 0; ind < gpPoints.length - 1; ind++) {
            const pt1 = gpPoints[ind];
            const pt2 = gpPoints[ind + 1];
            const innerWire = this.makeWireBetweenTwoPoints(pt1, pt2);
            wireMaker.Add_2(innerWire);
        }

        const wire = wireMaker.Wire();
        wireMaker.delete();
        return wire;
    }

    private makeWireBetweenTwoPoints(pt1: gp_Pnt, pt2: gp_Pnt) {
        const seg = new this.occ.GC_MakeSegment_1(pt1, pt2);
        const segVal = seg.Value();
        const segment = segVal.get();
        const edgeMaker = new this.occ.BRepBuilderAPI_MakeEdge_24(
            new this.occ.Handle_Geom_Curve_2(segment)
        );
        const edge = edgeMaker.Edge();
        const wireMaker = new this.occ.BRepBuilderAPI_MakeWire_2(edge);
        const innerWire = wireMaker.Wire();

        edgeMaker.delete();
        seg.delete();
        segVal.delete();
        segment.delete();
        edge.delete();
        wireMaker.delete();
        return innerWire;
    }

    divideEdgeByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        const edge = inputs.shape;
        const wire = this.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        return this.divideWireByParamsToPoints({ ...inputs, shape: wire });
    }

    divideEdgeByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): Base.Point3[] {
        const edge = inputs.shape;
        const wire = this.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        return this.divideWireByEqualDistanceToPoints({ ...inputs, shape: wire });
    }

    pointOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const { uMin, uMax } = this.getEdgeBounds(edge);
        const curve = this.getGeomCurveFromEdge(edge, uMin, uMax);
        const gpPnt = this.gpPnt([0, 0, 0]);
        const param = this.remap(inputs.param, 0, 1, uMin, uMax);
        curve.D0(param, gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        return pt;
    }

    tangentOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Base.Vector3 {
        const edge = inputs.shape;
        const { uMin, uMax } = this.getEdgeBounds(edge);
        const curve = this.getGeomCurveFromEdge(edge, uMin, uMax);
        const param = this.remap(inputs.param, 0, 1, uMin, uMax);
        const vec = curve.DN(param, 1);
        const vector: Base.Vector3 = [vec.X(), vec.Y(), vec.Z()];
        vec.delete();
        return vector;
    }

    pointOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const wire = this.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        const pt = this.pointOnWireAtLength({ ...inputs, shape: wire });
        wire.delete();
        return pt;
    }

    tangentOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const wire = this.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        const tangent = this.tangentOnWireAtLength({ ...inputs, shape: wire });
        wire.delete();
        return tangent;
    }

    divideWireByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const points = this.divideCurveToNrSegments({ ...inputs, shape: curve }, curve.FirstParameter(), curve.LastParameter());
        curve.delete();
        return points;
    }

    divideWireByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Base.Point3[] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const points = this.divideCurveByEqualLengthDistance({ ...inputs, shape: curve });
        curve.delete();
        return points;
    }

    pointOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const pt = this.pointOnCurveAtParam({ ...inputs, shape: curve });
        curve.delete();
        return pt;
    }

    tangentOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const tangent = this.tangentOnCurveAtParam({ ...inputs, shape: curve });
        curve.delete();
        return tangent;
    }

    pointOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);

        const absc = new this.occ.GCPnts_AbscissaPoint_2(curve, inputs.length, curve.FirstParameter());
        const param = absc.Parameter();

        const gpPnt = this.gpPnt([0, 0, 0]);
        curve.D0(param, gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        curve.delete();
        absc.delete();
        gpPnt.delete();
        return pt;
    }

    tangentOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);

        const absc = new this.occ.GCPnts_AbscissaPoint_2(curve, inputs.length, curve.FirstParameter());
        const param = absc.Parameter();

        const tanVec = curve.DN(param, 1);
        const pt: Base.Point3 = [tanVec.X(), tanVec.Y(), tanVec.Z()];
        curve.delete();
        absc.delete();
        tanVec.delete();
        return pt;
    }

    pointOnCurveAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.gpPnt([0, 0, 0]);
        const param = this.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());
        curve.D0(param, gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        return pt;
    }

    tangentOnCurveAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Base.Point3 {
        const curve = inputs.shape;
        const param = this.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());
        const vec = curve.DN(param, 1);
        const pt: Base.Point3 = [vec.X(), vec.Y(), vec.Z()];
        vec.delete();
        return pt;
    }

    divideCurveByEqualLengthDistance(inputs: Inputs.OCCT.DivideDto<Adaptor3d_Curve>): Base.Point3[] {
        const curve = inputs.shape;
        const curveLength = this.occ.GCPnts_AbscissaPoint.Length_5(curve, curve.FirstParameter(), curve.LastParameter());
        const step = curveLength / inputs.nrOfDivisions;

        const lengths: number[] = [];
        for (let i = 0; i <= curveLength + 0.000000001; i += step) {
            lengths.push(i);
        }

        if (inputs.removeStartPoint) {
            lengths.shift();
        }
        if (inputs.removeEndPoint) {
            lengths.pop();
        }

        const paramsLength = lengths.map(l => {
            const absc = new this.occ.GCPnts_AbscissaPoint_2(curve, l, curve.FirstParameter());
            const param = absc.Parameter();
            absc.delete();
            return param;
        });

        const points = paramsLength.map(r => {
            const gpPnt = this.gpPnt([0, 0, 0]);
            curve.D0(r, gpPnt);
            const pt = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] as Base.Point3;
            gpPnt.delete();
            return pt;
        });
        return points;
    }

    divideCurveToNrSegments(inputs: Inputs.OCCT.DivideDto<Geom_Curve | BRepAdaptor_CompCurve_2>, uMin: number, uMax: number) {
        const curve = inputs.shape;

        const ranges: number[] = [];
        for (let i = 0; i <= inputs.nrOfDivisions; i++) {
            const param = (i / inputs.nrOfDivisions);
            const paramMapped = this.remap(param, 0, 1, uMin, uMax);
            ranges.push(paramMapped);
        }

        if (inputs.removeStartPoint) {
            ranges.shift();
        }
        if (inputs.removeEndPoint) {
            ranges.pop();
        }

        const points = ranges.map(r => {
            const gpPnt = this.gpPnt([0, 0, 0]);
            curve.D0(r, gpPnt);
            const pt = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] as Base.Point3;
            gpPnt.delete();
            return pt;
        });

        return points;
    }

    interpolatePoints(inputs: Inputs.OCCT.InterpolationDto) {

        const ptList = new this.occ.TColgp_Array1OfPnt_2(1, inputs.points.length);
        const gpPnts: gp_Pnt_3[] = [];
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            const gpPnt = this.gpPnt(inputs.points[pIndex - 1]);
            gpPnts.push(gpPnt);
            ptList.SetValue(pIndex, gpPnt);
        }
        const geomBSplineHandle = this.occ.BitByBitDev.BitInterpolate(ptList, inputs.periodic, inputs.tolerance);
        if (!geomBSplineHandle.IsNull()) {
            const geomBSpline = geomBSplineHandle.get();
            const geomCrvHandle = new this.occ.Handle_Geom_Curve_2(geomBSpline);
            const edgeMaker = new this.occ.BRepBuilderAPI_MakeEdge_24(geomCrvHandle);
            const edge = edgeMaker.Edge();
            const wireMaker = new this.occ.BRepBuilderAPI_MakeWire_2(edge);
            const wire = wireMaker.Wire();

            geomBSplineHandle.Nullify();
            geomBSplineHandle.delete();
            geomCrvHandle.Nullify();
            geomCrvHandle.delete();
            edgeMaker.delete();
            edge.delete();
            wireMaker.delete();
            gpPnts.forEach(p => p.delete());
            ptList.delete();
            return wire;
        } else {
            gpPnts.forEach(p => p.delete());
            ptList.delete();
            return undefined;
        }

    }

    getNumSolidsInCompound(shape: TopoDS_Shape): number {
        if (!shape ||
            this.getShapeTypeEnum(shape) !== Inputs.OCCT.shapeTypeEnum.compound ||
            shape.IsNull()
        ) {
            throw new Error("Shape is not a compound or is null.");
        }
        let solidsFound = 0;
        this.forEachSolid(shape, () => { solidsFound++; });
        return solidsFound;
    }

    getSolidFromCompound(shape: TopoDS_ShapeHash, index: number) {
        if (!shape ||
            shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_COMPSOLID ||
            shape.IsNull()
        ) {
            console.error("Not a compound shape!");
            return shape;
        }
        if (!index) {
            index = 0;
        }

        let innerSolid = shape;
        let solidsFound = 0;
        this.forEachSolid(shape, (i, s) => {
            if (i === index) { innerSolid = this.occ.TopoDS.Solid_1(s); } solidsFound++;
        });
        if (solidsFound === 0) { console.error("NO SOLIDS FOUND IN SHAPE!"); }
        innerSolid.hash = shape.hash + 1;
        return innerSolid;
    }

    forEachSolid(shape: TopoDS_Shape, callback: (index: number, solid: TopoDS_Solid) => void): void {
        let solidIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_SOLID as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum));
        for (anExplorer.Init(shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_SOLID as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)); anExplorer.More(); anExplorer.Next()) {
            callback(solidIndex++, this.occ.TopoDS.Solid_2(anExplorer.Current()));
        }
        anExplorer.delete();
    }

    getWires(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire[] {
        const wires: TopoDS_Wire[] = [];
        this.forEachWire(inputs.shape, (wireIndex: number, myWire: TopoDS_Wire) => {
            wires.push(myWire);
        });
        return wires;
    }

    getWireCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Base.Point3 {
        return this.getLinearCenterOfMass(inputs);
    }

    forEachWire(shape: TopoDS_Shape, callback: (index: number, wire: TopoDS_Wire) => void): void {
        let wireIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_WIRE as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum));
        for (anExplorer.Init(shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_WIRE as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)); anExplorer.More(); anExplorer.Next()) {
            callback(wireIndex++, this.occ.TopoDS.Wire_2(anExplorer.Current()));
        }
        anExplorer.delete();
    }

    edgesToPoints(inputs: Inputs.OCCT.EdgesToPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        const shapeType = this.getShapeTypeEnum(inputs.shape);
        let edges = [];
        if (shapeType === Inputs.OCCT.shapeTypeEnum.edge) {
            edges = [inputs.shape];
        } else if (shapeType === Inputs.OCCT.shapeTypeEnum.wire) {
            edges = this.getEdgesAlongWire({ shape: inputs.shape });
        } else {
            edges = this.getEdges({ shape: inputs.shape });
        }
        const allEdgePoints: Base.Point3[][] = [];
        // collect original start points to adjust edge directions later
        const edgeStartPoints = edges.map(e => {
            return this.startPointOnEdge({ shape: e });
        });
        // this messes up directions as curve that is being built picks up some default direction
        edges.forEach((myEdge) => {
            const edgePoints: Base.Point3[] = [];
            const aLocation = new this.occ.TopLoc_Location_1();
            const adaptorCurve = new this.occ.BRepAdaptor_Curve_2(myEdge);
            const tangDef = new this.occ.GCPnts_TangentialDeflection_2(
                adaptorCurve,
                inputs.angularDeflection,
                inputs.curvatureDeflection,
                inputs.minimumOfPoints,
                inputs.uTolerance,
                inputs.minimumLength
            );
            const nrPoints = tangDef.NbPoints();
            const tangDefValues = [];
            for (let j = 0; j < nrPoints; j++) {
                const tangDefVal = tangDef.Value(j + 1);

                edgePoints.push([
                    tangDefVal.X(),
                    tangDefVal.Y(),
                    tangDefVal.Z()
                ] as Base.Point3);
                tangDefValues.push(tangDefVal);
            }
            allEdgePoints.push(edgePoints);
            tangDefValues.forEach(v => v.delete());
            aLocation.delete();
            adaptorCurve.delete();
            tangDef.delete();
        });
        // this fixes the directions of the point arrays based on original start points
        allEdgePoints.forEach((ep, index) => {
            const distBetweenStarts = this.vecHelper.distanceBetweenPoints(ep[0], edgeStartPoints[index]);
            const distBetweenStartAndEnd = this.vecHelper.distanceBetweenPoints(edgeStartPoints[index], ep[ep.length - 1]);
            if (distBetweenStartAndEnd < distBetweenStarts) {
                ep.reverse();
            }
        });
        return allEdgePoints;
    }

    forEachEdge(shape: TopoDS_Shape, callback: (index: number, edge: TopoDS_Edge) => void) {
        const edgeHashes = {};
        let edgeIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_EDGE as TopAbs_ShapeEnum), (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)
        );
        for (anExplorer.Init(shape, (this.occ.TopAbs_ShapeEnum.TopAbs_EDGE as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum));
            anExplorer.More();
            anExplorer.Next()
        ) {
            const edge = this.occ.TopoDS.Edge_1(anExplorer.Current());
            const edgeHash = edge.HashCode(100000000);
            if (!Object.prototype.hasOwnProperty.call(edgeHashes, edgeHash)) {
                edgeHashes[edgeHash] = edgeIndex;
                edgeIndex++;
                callback(edgeIndex, edge);
            }
        }
        anExplorer.delete();
        return edgeHashes;
    }

    forEachEdgeAlongWire(shape: TopoDS_Wire, callback: (index: number, edge: TopoDS_Edge) => void) {
        const edgeHashes = {};
        let edgeIndex = 0;
        const anExplorer = new this.occ.BRepTools_WireExplorer_1();
        for (anExplorer.Init_1(shape);
            anExplorer.More();
            anExplorer.Next()
        ) {
            const edge = this.occ.TopoDS.Edge_1(anExplorer.Current());
            const edgeHash = edge.HashCode(100000000);
            if (!Object.prototype.hasOwnProperty.call(edgeHashes, edgeHash)) {
                edgeHashes[edgeHash] = edgeIndex;
                edgeIndex++;
                callback(edgeIndex, edge);
            }
        }
        anExplorer.delete();
        return edgeHashes;
    }

    forEachFace(shape: TopoDS_Shape, callback: (index: number, face: TopoDS_Face) => void): void {
        let faceIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(
            shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_FACE as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)
        );
        for (anExplorer.Init(shape, (this.occ.TopAbs_ShapeEnum.TopAbs_FACE as TopAbs_ShapeEnum), (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum));
            anExplorer.More();
            anExplorer.Next()) {
            callback(faceIndex++, this.occ.TopoDS.Face_1(anExplorer.Current()));
        }
        anExplorer.delete();
    }

    forEachShell(shape: TopoDS_Shape, callback: (index: number, shell: TopoDS_Shell) => void): void {
        let faceIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(
            shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHELL as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)
        );
        for (anExplorer.Init(shape, (this.occ.TopAbs_ShapeEnum.TopAbs_SHELL as TopAbs_ShapeEnum), (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum));
            anExplorer.More();
            anExplorer.Next()) {
            callback(faceIndex++, this.occ.TopoDS.Shell_1(anExplorer.Current()));
        }
        anExplorer.delete();
    }

    forEachVertex(shape: TopoDS_Shape, callback: (index: number, vertex: TopoDS_Vertex) => void): void {
        let faceIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(
            shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_VERTEX as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)
        );
        for (anExplorer.Init(shape, (this.occ.TopAbs_ShapeEnum.TopAbs_VERTEX as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum));
            anExplorer.More();
            anExplorer.Next()) {
            callback(faceIndex++, this.occ.TopoDS.Vertex_1(anExplorer.Current()));
        }
        anExplorer.delete();
    }

    faceNormalOnUV(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>): Base.Vector3 {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const u = uMin + (uMax - uMin) * inputs.paramU;
        const v = vMin + (vMax - vMin) * inputs.paramV;
        const gpDir = this.gpDir([0, 1, 0]);
        this.occ.GeomLib.NormEstim(handle, this.gpPnt2d([u, v]), 1e-7, gpDir);
        if(face.Orientation_1() === this.occ.TopAbs_Orientation.TopAbs_REVERSED) {
            gpDir.Reverse();
        }
        const dir: Base.Vector3 = [gpDir.X(), gpDir.Y(), gpDir.Z()];
        gpDir.delete();
        handle.delete();
        return dir;
    }

    isArrayLike(item): boolean {
        return (
            Array.isArray(item) ||
            (!!item &&
                typeof item === "object" &&
                "length" in item &&
                typeof item.length === "number" &&
                item.length > 0 &&
                (item.length - 1) in item
            )
        );
    }

    intersection(inputs: Inputs.OCCT.IntersectionDto<TopoDS_Shape>): TopoDS_Shape[] {
        if (inputs.shapes.length < 2) {
            throw (new Error("Intersection requires 2 or more shapes to be given"));
        }

        const intersectShape = inputs.shapes[0];
        let intersectionResults: TopoDS_Shape[] = [];

        // TODO Try to make a compound so that this loop would not be needed
        for (let i = 1; i < inputs.shapes.length; i++) {
            let intersectionResult: TopoDS_Shape;
            const messageProgress = new this.occ.Message_ProgressRange_1();
            const intersectedCommon = new this.occ.BRepAlgoAPI_Common_3(
                intersectShape,
                inputs.shapes[i],
                messageProgress
            );
            const messageProgress2 = new this.occ.Message_ProgressRange_1();
            if (intersectedCommon.HasGenerated()) {
                intersectedCommon.Build(messageProgress2);
                intersectionResult = intersectedCommon.Shape();
                intersectionResults.push(intersectionResult);
            }
            messageProgress.delete();
            intersectedCommon.delete();
            messageProgress2.delete();
        }

        if (!inputs.keepEdges && intersectionResults.length > 0) {
            intersectionResults = intersectionResults.map(i => {
                const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(i, true, true, false);
                fusor.Build();
                const fusedShape = fusor.Shape();
                fusor.delete();
                return fusedShape;
            });
        }

        return intersectionResults;
    }

    difference(inputs: Inputs.OCCT.DifferenceDto<TopoDS_Shape>): TopoDS_Shape {
        let difference = inputs.shape;
        const objectsToSubtract = inputs.shapes;
        for (let i = 0; i < objectsToSubtract.length; i++) {
            if (!objectsToSubtract[i] || objectsToSubtract[i].IsNull()) { console.error("Tool in Difference is null!"); }
            const messageProgress1 = new this.occ.Message_ProgressRange_1();
            const differenceCut = new this.occ.BRepAlgoAPI_Cut_3(difference, objectsToSubtract[i], messageProgress1);
            const messageProgress2 = new this.occ.Message_ProgressRange_1();
            differenceCut.Build(messageProgress2);
            difference = differenceCut.Shape();
            messageProgress1.delete();
            messageProgress2.delete();
            differenceCut.delete();
        }

        if (!inputs.keepEdges) {
            const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(difference, true, true, false);
            fusor.Build();
            const fusedShape = fusor.Shape();
            difference.delete();
            difference = fusedShape;
            fusor.delete();
        }

        if (this.getNumSolidsInCompound(difference) === 1) {
            const solid = this.getSolidFromCompound(difference, 0);
            difference.delete();
            difference = solid;
        }

        return difference;
    }

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
            this.forEachEdge(inputs.shape, (index, edge) => {
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
            const result = this.getActualTypeOfShape(curFillet);
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
            const result = this.getActualTypeOfShape(curFillet);
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
            const result = this.getActualTypeOfShape(curFillet);
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
            const result = this.getActualTypeOfShape(curFillet);
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
            const result = this.getActualTypeOfShape(curFillet);
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
            const result = this.getActualTypeOfShape(curFillet);
            curFillet.delete();
            return result;
        }
        return undefined;
    }

    private assignVariableFilletToEdge(inputs: Inputs.OCCT.FilletEdgeVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>, mkFillet: BRepFilletAPI_MakeFillet) {
        const array = new this.occ.TColgp_Array1OfPnt2d_2(1, inputs.paramsU.length);
        inputs.paramsU.forEach((param, index) => {
            array.SetValue(index + 1, this.gpPnt2d([param, inputs.radiusList[index]]));
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
            this.forEachEdge(inputs.shape, (index, edge) => {
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
            const result = this.getActualTypeOfShape(curChamfer);
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
            const result = this.getActualTypeOfShape(curChamfer);
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
        const result = this.getActualTypeOfShape(curChamfer);
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
            const result = this.getActualTypeOfShape(curChamfer);
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
            const result = this.getActualTypeOfShape(curChamfer);
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
        const result = this.getActualTypeOfShape(curChamfer);
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
            const result = this.getActualTypeOfShape(curChamfer);
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
            const result = this.getActualTypeOfShape(curChamfer);
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
        let wireTouse = this.fixEdgeOrientationsAlongWire({ shape: inputs.shape });
        if (useRadiusList && inputs.shape.Closed_1()) {
            const edgesOfWire = this.getEdgesAlongWire({ shape: inputs.shape });
            const firstEdge = edgesOfWire.shift();
            const adjustEdges = [...edgesOfWire, firstEdge];
            wireTouse = this.combineEdgesAndWiresIntoAWire({ shapes: adjustEdges });
        } else {
            wireTouse = this.getActualTypeOfShape(inputs.shape.Reversed());
        }
        const extrusion = this.extrude({ shape: wireTouse, direction: inputs.direction });

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
        const faces = this.getFaces({ shape: filletShape });
        faces.forEach((f, i) => {
            // due to reversal of wire in the beginning this is stable index now
            // also we need to translate these edges back along direction
            const edgeToAdd = this.getEdges({ shape: f })[3];
            faceEdges.push(edgeToAdd);
        });

        const res = this.combineEdgesAndWiresIntoAWire({ shapes: faceEdges });
        const result = this.translate({ shape: res, translation: inputs.direction.map(s => -s) as Base.Vector3 });
        extrusion.delete();
        filletShape.delete();
        faces.forEach(f => f.delete());
        faceEdges.forEach(e => e.delete());
        return result;
    }

    createWireFromEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): TopoDS_Wire {
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire_2(inputs.shape);
        const wire = makeWire.Wire();
        makeWire.delete();
        return wire;
    }

    combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge | TopoDS_Wire>): TopoDS_Wire {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire_1();
        inputs.shapes.forEach((shape: TopoDS_Shape) => {
            if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
                makeWire.Add_1(shape);
            } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE) {
                makeWire.Add_2(shape);
            }
        });
        if (makeWire.IsDone()) {
            this.occ.BRepLib.BuildCurves3d_1(makeWire.Wire(), 1.0e-7, this.occ.GeomAbs_Shape.GeomAbs_C1 as GeomAbs_Shape, 14, 0);
            const wire = makeWire.Wire();
            makeWire.delete();
            return wire;
        } else {
            let errorMessage;
            const error = makeWire.Error();
            makeWire.delete();
            if (error === this.occ.BRepBuilderAPI_WireError.BRepBuilderAPI_DisconnectedWire) {
                errorMessage = "Wire is disconnected and can not be constructed";
            } else if (error === this.occ.BRepBuilderAPI_WireError.BRepBuilderAPI_EmptyWire) {
                errorMessage = "Wire is empty and can not be constructed";
            } else if (error === this.occ.BRepBuilderAPI_WireError.BRepBuilderAPI_NonManifoldWire) {
                errorMessage = "Wire is non manifold and can not be constructed";
            } else if (error === this.occ.BRepBuilderAPI_WireError.BRepBuilderAPI_WireDone) {
                errorMessage = "Wire is done";
            }
            throw new Error(errorMessage);
        }
    }

    createBSpline(inputs: Inputs.OCCT.BSplineDto): TopoDS_Wire {
        const ptList = new this.occ.TColgp_Array1OfPnt_2(1, inputs.points.length + (inputs.closed ? 1 : 0));
        const gpPnts: gp_Pnt_3[] = [];
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            const gpPnt = this.gpPnt(inputs.points[pIndex - 1]);
            gpPnts.push(gpPnt);
            ptList.SetValue(pIndex, gpPnt);
        }
        if (inputs.closed) { ptList.SetValue(inputs.points.length + 1, ptList.Value(1)); }

        const ptsToBspline = new this.occ.GeomAPI_PointsToBSpline_2(ptList, 3, 8,
            (this.occ.GeomAbs_Shape.GeomAbs_C2 as GeomAbs_Shape), 1.0e-3);

        const bsplineHandle = ptsToBspline.Curve();
        const bspline = bsplineHandle.get();
        const bsplineCrv = new this.occ.Handle_Geom_Curve_2(bspline);
        const edgeMaker = new this.occ.BRepBuilderAPI_MakeEdge_24(bsplineCrv);
        const edge = edgeMaker.Edge();
        const wireMaker = new this.occ.BRepBuilderAPI_MakeWire_2(edge);
        const wire = wireMaker.Wire();

        gpPnts.forEach(p => p.delete());
        ptList.delete();
        ptsToBspline.delete();
        bsplineHandle.Nullify();
        bsplineHandle.delete();
        bsplineCrv.Nullify();
        bsplineCrv.delete();
        edgeMaker.delete();
        edge.delete();
        wireMaker.delete();

        return wire;
    }

    align(inputs: Inputs.OCCT.AlignDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf_1();

        const ax1 = this.gpAx3(inputs.fromOrigin, inputs.fromDirection);
        const ax2 = this.gpAx3(inputs.toOrigin, inputs.toDirection);

        transformation.SetDisplacement(
            ax1,
            ax2,
        );
        const translation = new this.occ.TopLoc_Location_2(transformation);
        const moved = inputs.shape.Moved(translation, false);

        transformation.delete();
        ax1.delete();
        ax2.delete();
        const shp = this.getActualTypeOfShape(moved);
        moved.delete();
        return shp;
    }

    translate(inputs: Inputs.OCCT.TranslateDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf_1();
        const gpVec = new this.occ.gp_Vec_4(inputs.translation[0], inputs.translation[1], inputs.translation[2]);
        transformation.SetTranslation_1(gpVec);
        const transf = new this.occ.BRepBuilderAPI_Transform_2(inputs.shape, transformation, true);
        const s = transf.Shape();
        const shp = this.getActualTypeOfShape(s);
        s.delete();
        transformation.delete();
        gpVec.delete();
        return shp;
    }

    mirror(inputs: Inputs.OCCT.MirrorDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf_1();
        const ax1 = this.gpAx1(inputs.origin, inputs.direction);
        transformation.SetMirror_2(ax1);
        const transformed = new this.occ.BRepBuilderAPI_Transform_2(inputs.shape, transformation, true);
        const transformedShape = transformed.Shape();
        const shp = this.getActualTypeOfShape(transformedShape);

        transformedShape.delete();
        transformed.delete();
        transformation.delete();
        ax1.delete();

        return shp;
    }

    mirrorAlongNormal(inputs: Inputs.OCCT.MirrorAlongNormalDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf_1();
        const ax = this.gpAx2(inputs.origin, inputs.normal);
        transformation.SetMirror_3(ax);
        const transformed = new this.occ.BRepBuilderAPI_Transform_2(inputs.shape, transformation, true);
        const transformedShape = transformed.Shape();
        const shp = this.getActualTypeOfShape(transformedShape);
        ax.delete();
        transformedShape.delete();
        transformed.delete();
        transformation.delete();
        return shp;
    }

    rotate(inputs: Inputs.OCCT.RotateDto<TopoDS_Shape>) {
        let rotated;
        if (inputs.angle === 0) {
            rotated = inputs.shape;
        } else {
            const transformation = new this.occ.gp_Trsf_1();
            const pt1 = new this.occ.gp_Pnt_3(0, 0, 0);
            const gpVec = new this.occ.gp_Vec_4(inputs.axis[0], inputs.axis[1], inputs.axis[2]);
            const dir = new this.occ.gp_Dir_2(gpVec);
            const ax = new this.occ.gp_Ax1_2(pt1, dir);
            transformation.SetRotation_1(ax, inputs.angle * 0.0174533);
            const rotation = new this.occ.TopLoc_Location_2(transformation);
            rotated = (inputs.shape as TopoDS_Shape).Moved(rotation, false);

            transformation.delete();
            pt1.delete();
            gpVec.delete();
            dir.delete();
            ax.delete();
            rotation.delete();
        }
        const actualShape = this.getActualTypeOfShape(rotated);
        if (inputs.angle !== 0) {
            rotated.delete();
        }
        return actualShape;
    }

    surfaceFromFace(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>) {
        const face = inputs.shape;
        const surface = this.occ.BRep_Tool.Surface_2(face);
        const srf = surface.get();
        return srf;
    }


    makeEdgeFromGeom2dCurveAndSurfaceBounded(inputs: Inputs.OCCT.CurveAndSurfaceDto<Geom2d_Curve, Geom_Surface>, umin: number, umax: number): TopoDS_Edge {
        const curve2d = new this.occ.Handle_Geom2d_Curve_2(inputs.curve as Geom2d_Curve);
        const surface = new this.occ.Handle_Geom_Surface_2(inputs.surface as Geom_Surface);
        const res = new this.occ.BRepBuilderAPI_MakeEdge_31(curve2d, surface, umin, umax);
        const resShape = res.Shape();
        const r = this.getActualTypeOfShape(resShape);
        resShape.delete();
        res.delete();
        return r;
    }

    makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.CurveAndSurfaceDto<Geom2d_Curve, Geom_Surface>): TopoDS_Edge {
        const curve2d = new this.occ.Handle_Geom2d_Curve_2(inputs.curve as Geom2d_Curve);
        const surface = new this.occ.Handle_Geom_Surface_2(inputs.surface as Geom_Surface);
        const res = new this.occ.BRepBuilderAPI_MakeEdge_30(curve2d, surface);
        const resShape = res.Shape();
        const r = this.getActualTypeOfShape(resShape);
        resShape.delete();
        res.delete();
        return r;
    }

    startPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const wire = this.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        const res = this.pointOnWireAtParam({ shape: wire, param: 0 });
        return res;
    }

    endPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const wire = this.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        const res = this.pointOnWireAtParam({ shape: wire, param: 1 });
        return res;
    }

    startPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const res = this.startPointOnCurve({ ...inputs, shape: curve });
        return res;
    }

    endPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const res = this.endPointOnCurve({ ...inputs, shape: curve });
        return res;
    }

    placeWire(wire: TopoDS_Wire, surface: Geom_Surface) {
        const edges = this.getEdges({ shape: wire });
        const newEdges: TopoDS_Edge[] = [];
        edges.forEach(e => {
            const umin = { current: 0 };
            const umax = { current: 0 };
            this.occRefReturns.BRep_Tool_Range_1(e, umin, umax);
            const crv = this.occRefReturns.BRep_Tool_Curve_2(e, umin, umax);
            if (!crv.IsNull()) {
                const plane = this.gpPln([0, 0, 0], [0, 1, 0]);
                const c2dHandle = this.occ.GeomAPI.To2d(crv, plane);
                const c2 = c2dHandle.get();
                const newEdgeOnSrf = this.makeEdgeFromGeom2dCurveAndSurfaceBounded({ curve: c2, surface }, umin.current, umax.current);
                if (newEdgeOnSrf) {
                    newEdges.push(newEdgeOnSrf);
                }
                plane.delete();
                c2dHandle.delete();
            }
            crv.delete();
        });
        edges.forEach(e => e.delete());
        const res = this.combineEdgesAndWiresIntoAWire({ shapes: newEdges });
        newEdges.forEach(e => e.delete());
        return res;
    }

    startPointOnCurve(inputs: Inputs.OCCT.ShapeDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Inputs.Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.gpPnt([0, 0, 0]);
        curve.D0(curve.FirstParameter(), gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        return pt;
    }

    endPointOnCurve(inputs: Inputs.OCCT.ShapeDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Inputs.Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.gpPnt([0, 0, 0]);
        curve.D0(curve.LastParameter(), gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        return pt;
    }

    getGeomCurveFromEdge(edge: TopoDS_Edge, uMin: number, uMax: number): Geom_Curve {
        const loc = edge.Location_1();
        const crvHandle = this.occ.BRep_Tool.Curve_1(edge, loc, uMin, uMax);
        const curve = crvHandle.get();
        return curve;
    }

    getEdgeBounds(edge: TopoDS_Edge): { uMin: number, uMax: number } {
        const p1 = { current: 0 };
        const p2 = { current: 0 };
        this.occRefReturns.BRep_Tool_Range_1(edge, p1, p2);
        return { uMin: p1.current, uMax: p2.current };
    }

    getUVBounds(face: TopoDS_Face): { uMin: number, uMax: number, vMin: number, vMax: number } {
        const uMin = { current: 0 };
        const uMax = { current: 0 };
        const vMin = { current: 0 };
        const vMax = { current: 0 };
        this.occRefReturns.BRepTools_UVBounds_1(face, uMin, uMax, vMin, vMax);
        return { uMin: uMin.current, uMax: uMax.current, vMin: vMin.current, vMax: vMax.current };
    }

    remap(value: number, from1: number, to1: number, from2: number, to2: number): number {
        return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
    }

    makeThickSolidSimple(inputs: Inputs.OCCT.ThisckSolidSimpleDto<TopoDS_Shape>) {
        const maker = new this.occ.BRepOffsetAPI_MakeThickSolid();
        maker.MakeThickSolidBySimple(inputs.shape, inputs.offset);
        maker.Build(new this.occ.Message_ProgressRange_1());
        const makerShape = maker.Shape();

        const result = this.getActualTypeOfShape(makerShape);
        let res2 = result;
        if (inputs.offset > 0) {
            const faces = this.getFaces({ shape: result });
            const revFaces = faces.map(face => face.Reversed());
            res2 = this.sewFaces({ shapes: revFaces, tolerance: 1e-7 });
            result.delete();
        }
        maker.delete();
        makerShape.delete();
        return res2;
    }

}

