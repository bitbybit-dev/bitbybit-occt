import initOpenCascade, { OpenCascadeInstance, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTEdge } from "./edge";
import { OccHelper } from "../../occ-helper";
import { OCCTWire } from "./wire";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import * as Inputs from "../../api/inputs/inputs";
import { OCCTFace } from "./face";
import { TopoDS_Compound } from "dist";
import { OCCTShape } from "./shape";

describe("OCCT wire unit tests", () => {
    let occt: OpenCascadeInstance;
    let wire: OCCTWire;
    let edge: OCCTEdge;
    let face: OCCTFace;
    let shape: OCCTShape;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        edge = new OCCTEdge(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
        face = new OCCTFace(occt, occHelper);
        shape = new OCCTShape(occt, occHelper);
    });

    it("should create a circle edge of the right radius and it will mach the length", async () => {
        const w = wire.createCircleWire({ radius: 3, center: [1, 0, 0], direction: [0, 1, 0] });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(18.849555921538762);
        w.delete();
    });

    it("should create a square wire", async () => {
        const w = wire.createSquareWire({ size: 4, center: [1, 0, 0], direction: [0, 1, 0] });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(16);
        w.delete();
    });

    it("should create an open bezier wire", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(5.72415866652804);
        w.delete();
    });

    it("should create a closed bezier wire", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: true });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(5.333863420641158);
        w.delete();
    });

    it("should create bsplines", async () => {
        const bezierWires: Inputs.OCCT.BezierWiresDto = {
            bezierWires: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[], closed: false },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[], closed: true }
            ],
            returnCompound: false,
        };

        const wires = wire.createBezierWires(bezierWires) as TopoDS_Wire[];

        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            5.72415866652804,
            6.248234956680049
        ]);
        wires.forEach(w => w.delete());
    });

    it("should return compound bsplines", async () => {
        const bezierWires: Inputs.OCCT.BezierWiresDto = {
            bezierWires: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[], closed: false },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[], closed: true }
            ],
            returnCompound: true,
        };

        const resCompound = wire.createBezierWires(bezierWires) as TopoDS_Compound;

        const wires = wire.getWires({ shape: resCompound });
        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            5.72415866652804,
            6.248234956680049
        ]);
        wires.forEach(w => w.delete());
    });

    it("should interpolate points", async () => {
        const w = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], periodic: false, tolerance: 1e-7 });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(7.256109149279404);
        w.delete();
    });

    it("should interpolate wires", async () => {
        const interpolations = {
            interpolations: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[], periodic: false, tolerance: 1e-7 },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[], periodic: true, tolerance: 1e-7 }
            ],
            returnCompound: false,
        };
        const wires = wire.interpolateWires(interpolations) as TopoDS_Wire[];

        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            7.256109149279404,
            11.683150969483133
        ]);
        wires.forEach(w => w.delete());
    });

    it("should return compound when interpolating wires", async () => {
        const interpolations = {
            interpolations: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[], periodic: false, tolerance: 1e-7 },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[], periodic: true, tolerance: 1e-7 }
            ],
            returnCompound: true,
        };
        const resCompound = wire.interpolateWires(interpolations) as TopoDS_Compound;

        const wires = wire.getWires({ shape: resCompound });
        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            7.256109149279404,
            11.683150969483133
        ]);
        wires.forEach(w => w.delete());
    });

    it("should interpolate points into periodic bspline", async () => {
        const w = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], periodic: true, tolerance: 1e-7 });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(13.782923673238976);
        w.delete();
    });

    it("should create open bspline through points", async () => {
        const w = wire.createBSpline({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(7.064531406714803);
        w.delete();
    });

    it("should create bsplines", async () => {
        const bsplines: Inputs.OCCT.BSplinesDto = {
            bSplines: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[], closed: false },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[], closed: true }
            ],
            returnCompound: false,
        };

        const wires = wire.createBSplines(bsplines) as TopoDS_Wire[];

        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            7.064531406714803,
            12.070081119772679
        ]);
        wires.forEach(w => w.delete());
    });

    it("should return compound when creating bsplines", async () => {
        const bsplines: Inputs.OCCT.BSplinesDto = {
            bSplines: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[], closed: false },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[], closed: true }
            ],
            returnCompound: true,
        };

        const resCompound = wire.createBSplines(bsplines) as TopoDS_Compound;

        const wires = wire.getWires({ shape: resCompound });
        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            7.064531406714803,
            12.070081119772679
        ]);
        wires.forEach(w => w.delete());
    });

    it("should create closed bspline through points", async () => {
        const w = wire.createBSpline({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: true });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(14.120032294676554);
        w.delete();
    });

    it("should create a polygon wire", async () => {
        const w = wire.createPolygonWire({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(11.99553079221423);
        w.delete();
    });

    it("should create polygons", async () => {
        const polygons: Inputs.OCCT.PolygonsDto = {
            polygons: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[] },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[] }
            ],
            returnCompound: false,
        };

        const wires = wire.createPolygons(polygons) as TopoDS_Wire[];

        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            11.99553079221423,
            10.398345637668168
        ]);
        wires.forEach(w => w.delete());
    });

    it("should return compound when creating polygons", async () => {
        const polygons: Inputs.OCCT.PolygonsDto = {
            polygons: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[] },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[] }
            ],
            returnCompound: true,
        };

        const resCompound = wire.createPolygons(polygons) as TopoDS_Compound;

        const wires = wire.getWires({ shape: resCompound });
        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            11.99553079221423,
            10.398345637668168
        ]);
        wires.forEach(w => w.delete());
    });

    it("should create a polyline wire", async () => {
        const w = wire.createPolylineWire({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(6.610365985079727);
        w.delete();
    });

    it("should create polylines", async () => {
        const polylines: Inputs.OCCT.PolylinesDto = {
            polylines: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[] },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[] }
            ],
            returnCompound: false,
        };

        const wires = wire.createPolylines(polylines) as TopoDS_Wire[];

        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            6.610365985079727,
            5.398345637668168
        ]);
        wires.forEach(w => w.delete());
    });

    it("should create a line wire", async () => {
        const w = wire.createLineWire({
            start: [0, 0, 0],
            end: [0, 1, 1]
        });
        const length = wire.getWireLength({ shape: w });
        expect(length).toEqual(1.414213562373095);
        w.delete();
    });

    it("should create lines", async () => {
        const lines: Inputs.OCCT.LinesDto = {
            lines: [
                { start: [0, 0, 0], end: [0, 1, 1] },
                { start: [3, 3, 0], end: [0, 1, 1] },
                { start: [0, 2, 0], end: [0, 1, 1] },
            ],
            returnCompound: false,
        };

        const wires = wire.createLines(lines) as TopoDS_Wire[];

        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            1.414213562373095,
            3.7416573867739413,
            1.414213562373095,
        ]);
        wires.forEach(w => w.delete());
    });


    it("should create lines compound", async () => {
        const lines: Inputs.OCCT.LinesDto = {
            lines: [
                { start: [0, 0, 0], end: [0, 1, 1] },
                { start: [3, 3, 0], end: [0, 1, 1] },
                { start: [0, 2, 0], end: [0, 1, 1] },
            ],
            returnCompound: true,
        };

        const resCompound = wire.createLines(lines) as TopoDS_Compound;

        const wires = wire.getWires({ shape: resCompound });
        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            1.414213562373095,
            3.7416573867739413,
            1.414213562373095,
        ]);
        wires.forEach(w => w.delete());
    });

    it("should return compound when creating polylines", async () => {
        const polylines: Inputs.OCCT.PolylinesDto = {
            polylines: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[] },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[] }
            ],
            returnCompound: true,
        };

        const resCompound = wire.createPolylines(polylines) as TopoDS_Compound;
        const wires = wire.getWires({ shape: resCompound });
        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            6.610365985079727,
            5.398345637668168
        ]);
        wires.forEach(w => w.delete());
    });

    it("should create L polygon wire and align outside", async () => {
        const inp = new Inputs.OCCT.LPolygonDto();
        inp.lengthFirst = 10;
        inp.lengthSecond = 6;
        inp.widthFirst = 3;
        inp.widthSecond = 5;
        const res = wire.createLPolygonWire(inp);
        const length = wire.getWireLength({ shape: res });
        const corners = edge.getCornerPointsOfEdgesForShape({ shape: res });
        expect(length).toBe(48);
        expect(corners).toEqual([[0, 0, 0], [10, 0, 0], [10, 0, -3], [-5, 0, -3], [-5, 0, 6], [0, 0, 6]]);
        res.delete();
    });

    it("should create L polygon wire and align outside if alignmend is undefined", async () => {
        const inp = new Inputs.OCCT.LPolygonDto();
        inp.lengthFirst = 10;
        inp.lengthSecond = 6;
        inp.widthFirst = 3;
        inp.widthSecond = 5;
        delete inp.align;
        const res = wire.createLPolygonWire(inp);
        const length = wire.getWireLength({ shape: res });
        const corners = edge.getCornerPointsOfEdgesForShape({ shape: res });
        expect(length).toBe(48);
        expect(corners).toEqual([[0, 0, 0], [10, 0, 0], [10, 0, -3], [-5, 0, -3], [-5, 0, 6], [0, 0, 6]]);
        res.delete();
    });

    it("should create L polygon wire and align inside", async () => {
        const inp = new Inputs.OCCT.LPolygonDto();
        inp.align = Inputs.OCCT.directionEnum.inside;
        inp.lengthFirst = 10;
        inp.lengthSecond = 6;
        inp.widthFirst = 3;
        inp.widthSecond = 5;
        const res = wire.createLPolygonWire(inp);
        const length = wire.getWireLength({ shape: res });
        const corners = edge.getCornerPointsOfEdgesForShape({ shape: res });
        expect(length).toBe(32);
        expect(corners).toEqual([[0, 0, 0], [10, 0, 0], [10, 0, 3], [5, 0, 3], [5, 0, 6], [0, 0, 6]]);
        res.delete();
    });

    it("should create L polygon wire and align middle", async () => {
        const inp = new Inputs.OCCT.LPolygonDto();
        inp.align = Inputs.OCCT.directionEnum.middle;
        inp.lengthFirst = 10;
        inp.lengthSecond = 6;
        inp.widthFirst = 3;
        inp.widthSecond = 5;
        const res = wire.createLPolygonWire(inp);
        const length = wire.getWireLength({ shape: res });
        const corners = edge.getCornerPointsOfEdgesForShape({ shape: res });
        expect(length).toBe(40);
        expect(corners).toEqual([[2.5, 0, 1.5], [2.5, 0, 6], [-2.5, 0, 6], [-2.5, 0, -1.5], [10, 0, -1.5], [10, 0, 1.5]]);
        res.delete();
    });

    it("should create L polygon wire, align middle and use center shift, rotation and different direction", async () => {
        const inp = new Inputs.OCCT.LPolygonDto();
        inp.align = Inputs.OCCT.directionEnum.middle;
        inp.lengthFirst = 10;
        inp.lengthSecond = 6;
        inp.widthFirst = 3;
        inp.widthSecond = 5;
        inp.center = [0, 1, 3];
        inp.rotation = 45;
        inp.direction = [1, 0, 0];
        const res = wire.createLPolygonWire(inp);
        const length = wire.getWireLength({ shape: res });
        const corners = edge.getCornerPointsOfEdgesForShape({ shape: res });
        expect(length).toBeCloseTo(40);
        expect(corners).toEqual([[0, -1.8284268867320825, 2.292892266757705], [0, -5.010408473134127, 5.474871711034227], [0, -1.4748757572713234, 9.0104068070365], [0, 3.8284268867320836, 3.7071077332422933], [0, -5.010404902924925, -5.131730006763387], [0, -7.131725960526286, -3.010410377245702]]);
        res.delete();
    });

    it("should create a heart wire", async () => {
        const inputs = new Inputs.OCCT.Heart2DDto();
        const w = wire.createHeartWire(inputs);
        const length = wire.getWireLength({ shape: w });
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: w });
        expect(cornerPoints.length).toBe(2);
        expect(length).toBe(6.490970890684743);
        w.delete();
    });

    it("should create a star wire", async () => {
        const w = wire.createStarWire({ numRays: 9, outerRadius: 5, innerRadius: 2, center: [0, 0, 0], direction: [0, 0, 1], half: false, offsetOuterEdges: 0 });
        const length = wire.getWireLength({ shape: w });
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: w });
        expect(cornerPoints.length).toBe(18);
        expect(length).toBe(57.5047112618376);
        w.delete();
    });

    it("should create a christmas tree wire with default values", async () => {
        const options = new Inputs.OCCT.ChristmasTreeDto();
        const w = wire.createChristmasTreeWire(options);
        const length = wire.getWireLength({ shape: w });
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: w });
        expect(cornerPoints.length).toBe(24);
        expect(length).toBe(32.00472491530124);
        w.delete();
    });

    it("should create ellipse wire", async () => {
        const w = wire.createEllipseWire({ radiusMajor: 5, radiusMinor: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(23.07819782619483);
        w.delete();
    });

    it("should create rectangle wire", async () => {
        const w = wire.createRectangleWire({ width: 5, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(14);
        w.delete();
    });

    it("should create a parallelogram wire", async () => {
        const w = wire.createParallelogramWire({ width: 5, height: 2, center: [0, 0, 0], direction: [0, 1, 0], angle: 15, aroundCenter: true });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(14.141104721640332);
        w.delete();
    });

    it("should create a parallelogram wire of 0 angle", async () => {
        const w = wire.createParallelogramWire({ width: 5, height: 2, center: [0, 0, 0], direction: [0, 1, 0], angle: 0, aroundCenter: true });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(14);
        w.delete();
    });

    it("should get wires of a box", async () => {
        const b = occHelper.bRepPrimAPIMakeBox(3, 4, 5, [0, 0, 0]);
        const wires = wire.getWires({ shape: b });
        expect(wires.length).toBe(6);
        b.delete();
        wires.forEach(w => w.delete());
    });

    it("should get lengths of wires", async () => {
        const b = occHelper.bRepPrimAPIMakeBox(3, 4, 5, [0, 0, 0]);
        const wires = wire.getWires({ shape: b });
        const lengths = wire.getWiresLengths({ shapes: wires });
        expect(lengths).toEqual([18, 18, 14, 14, 16, 16]);
        b.delete();
        wires.forEach(w => w.delete());
    });

    it("should reverse wire", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const w2 = wire.reversedWire({ shape: w });
        const ptOnEnd = wire.pointOnWireAtParam({ shape: w2, param: 1 });
        expect(ptOnEnd).toEqual([0, 0, 0]);
        w.delete();
        w2.delete();
    });

    it("should get wire of a box at specific index", async () => {
        const b = occHelper.bRepPrimAPIMakeBox(3, 4, 5, [0, 0, 0]);
        const w = wire.getWire({ shape: b, index: 2 });
        const length = wire.getWireLength({ shape: w });
        expect(length).toEqual(14);
        b.delete();
        w.delete();
    });

    it("should get wire of a box at 0 index if index is undefined", async () => {
        const b = occHelper.bRepPrimAPIMakeBox(3, 4, 5, [0, 0, 0]);
        const w = wire.getWire({ shape: b, index: undefined });
        const length = wire.getWireLength({ shape: w });
        expect(length).toEqual(18);
        b.delete();
        w.delete();
    });

    it("should throw error if shape is undefined", async () => {
        expect(() => wire.getWire({ shape: undefined, index: 0 })).toThrowError("Shape is not provided or is null");
    });

    it("should throw error if shape is of incorrect type", async () => {
        const b = edge.createCircleEdge({ radius: 5, center: [0, 0, 0], direction: [0, 0, 1] });
        expect(() => wire.getWire({ shape: b, index: 0 })).toThrowError("Shape is of incorrect type");
        b.delete();
    });

    it("should throw error if innerWire not found", async () => {
        const rect = wire.createRectangleWire({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 1, 0] });
        expect(() => wire.getWire({ shape: rect, index: 10 })).toThrowError("Shape is of incorrect type");
    });

    it("should get start point on a wire", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const ptOnEnd = wire.startPointOnWire({ shape: w });
        expect(ptOnEnd).toEqual([0, 0, 0]);
        w.delete();
    });

    it("should get end point on a wire", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const ptOnEnd = wire.endPointOnWire({ shape: w });
        expect(ptOnEnd).toEqual([0, 2, 5]);
        w.delete();
    });

    it("should get derivatives of a wire on param", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const der = wire.derivativesOnWireAtParam({ shape: w, param: 0 });
        expect(der).toEqual([[2, 2, 0], [-4, 0, 10], [0, 0, 0]]);
        w.delete();
    });

    it("should get derivatives of a wire on length", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const der = wire.derivativesOnWireAtLength({ shape: w, length: 1 });
        expect(der).toEqual([
            [0.6943276223832977, 2, 3.2641809440417555],
            [-4, 0, 10],
            [0, 0, 0]
        ]);
        w.delete();
    });

    it("should get point on a wire on param", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const pt = wire.pointOnWireAtParam({ shape: w, param: 0.5 });
        expect(pt).toEqual([0.5, 1, 1.25]);
        w.delete();
    });

    it("should get point on a wire on length", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const pt = wire.pointOnWireAtLength({ shape: w, length: 0.5 });
        expect(pt).toEqual([0.2939162221922262, 0.3579972308349849, 0.16020252160689685]);
        w.delete();
    });

    it("should get tangent on a wire on param", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const t = wire.tangentOnWireAtParam({ shape: w, param: 0.5 });
        expect(t).toEqual([0, 2, 5]);
        w.delete();
    });

    it("should get tangent on a wire on length", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const t = wire.tangentOnWireAtLength({ shape: w, length: 0.5 });
        expect(t).toEqual([1.2840055383300302, 2, 1.7899861541749247]);
        w.delete();
    });

    it("should divide wire to points by params", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const pts = wire.divideWireByParamsToPoints({ shape: w, nrOfDivisions: 12, removeEndPoint: false, removeStartPoint: false });
        expect(pts.length).toEqual(13);
        expect(pts).toEqual(
            [
                [0, 0, 0],
                [0.15277777777777776, 0.16666666666666666, 0.03472222222222222],
                [0.2777777777777778, 0.3333333333333333, 0.13888888888888887],
                [0.375, 0.5, 0.3125],
                [0.4444444444444445, 0.6666666666666666, 0.5555555555555555],
                [0.48611111111111105, 0.8333333333333334, 0.8680555555555557],
                [0.5, 1, 1.25],
                [0.4861111111111111, 1.1666666666666667, 1.701388888888889],
                [0.4444444444444445, 1.3333333333333333, 2.222222222222222],
                [0.375, 1.5, 2.8125],
                [0.27777777777777773, 1.6666666666666667, 3.4722222222222228],
                [0.15277777777777785, 1.8333333333333333, 4.201388888888888],
                [0, 2, 5]
            ]
        );
        w.delete();
    });

    it("should divide wires to points by params", async () => {
        const w1 = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const w2 = wire.createBezier({ points: [[0, 1, 0], [1, 1, 2], [3, 2, 5]], closed: true });

        const pts = wire.divideWiresByParamsToPoints({ shapes: [w1, w2], nrOfDivisions: 12, removeEndPoint: false, removeStartPoint: false });
        expect(pts.length).toEqual(2);
        expect(pts[0].length).toEqual(13);
        expect(pts[1].length).toEqual(13);

        expect(pts).toEqual(
            [
                [[0, 0, 0], [0.15277777777777776, 0.16666666666666666, 0.03472222222222222], [0.2777777777777778, 0.3333333333333333, 0.13888888888888887], [0.375, 0.5, 0.3125], [0.4444444444444445, 0.6666666666666666, 0.5555555555555555], [0.48611111111111105, 0.8333333333333334, 0.8680555555555557], [0.5, 1, 1.25], [0.4861111111111111, 1.1666666666666667, 1.701388888888889], [0.4444444444444445, 1.3333333333333333, 2.222222222222222], [0.375, 1.5, 2.8125], [0.27777777777777773, 1.6666666666666667, 3.4722222222222228], [0.15277777777777785, 1.8333333333333333, 4.201388888888888], [0, 2, 5]],
                [[0, 1, 0], [0.2673611111111111, 1.0190972222222223, 0.515625], [0.5555555555555556, 1.0694444444444444, 1.0416666666666665], [0.84375, 1.140625, 1.546875], [1.1111111111111112, 1.2222222222222223, 2], [1.3368055555555556, 1.3038194444444444, 2.369791666666667], [1.5, 1.375, 2.625], [1.5798611111111114, 1.4253472222222223, 2.734375], [1.5555555555555556, 1.4444444444444444, 2.6666666666666665], [1.40625, 1.421875, 2.390625], [1.1111111111111112, 1.3472222222222223, 1.875], [0.6493055555555557, 1.2100694444444444, 1.0885416666666665], [0, 1, 0]]
            ]
        );
        w1.delete();
        w2.delete();
    });

    it("should divide wires to points by params", async () => {
        const w1 = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const w2 = wire.createBezier({ points: [[0, 1, 0], [1, 1, 2], [3, 2, 5]], closed: true });

        const pts = wire.divideWiresByEqualDistanceToPoints({ shapes: [w1, w2], nrOfDivisions: 12, removeEndPoint: false, removeStartPoint: false });
        expect(pts.length).toEqual(2);
        expect(pts[0].length).toEqual(13);
        expect(pts[1].length).toEqual(13);

        expect(pts).toEqual([
            [[0, 0, 0], [0.2838222828590555, 0.3424625985680442, 0.14660078927247172], [0.43115226769191084, 0.6289266048122308, 0.4944358428008], [0.4892636529329303, 0.8534643588264631, 0.9105017647338322], [0.49923676534972294, 1.039070056316239, 1.34958322741629], [0.480111123635674, 1.1994436078911832, 1.798331210638773], [0.4414571610105028, 1.3421778455408742, 2.2518017113259283], [0.38869559662499154, 1.4718143774303798, 2.7077969520134704], [0.32519482109496023, 1.5912785788527093, 3.1652093943943727], [0.25319786452105564, 1.702569762342423, 3.6234297445534183], [0.17427907733231243, 1.8071194740156968, 4.082100991708461], [0.08958978033353904, 1.9059914123946882, 4.541004080152873], [2.2204460492503128e-16, 1.9999999999999998, 4.999999999999998]],
            [[0, 1, 0], [0.2445415223932723, 1.0162343770636948, 0.47284866772284984], [0.4984278224951234, 1.057610239508077, 0.9392454054821698], [0.758875699662155, 1.1177927244842796, 1.3999586748400303], [1.0246956935075888, 1.1942266492049987, 1.8551647378101788], [1.2959263476180198, 1.2879719428038818, 2.303880752432158], [1.5781406397702806, 1.4234560666158775, 2.7328252129246846], [1.3521231253298114, 1.409714937782383, 2.29453131287724], [1.0629757299626925, 1.333723436835422, 1.7922280230899632], [0.8217649237290864, 1.2629879159244757, 1.3805419315336966], [0.5652427899625962, 1.1837364526010647, 0.9467491273241277], [0.29009449989277686, 1.0955717797183926, 0.4846172200671603], [-2.6645352591003765e-15, 0.9999999999999991, -3.552713678800502e-15]]
        ]);
        w1.delete();
        w2.delete();
    });

    it("should divide wire to points by params and remove start and end points", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const pts = wire.divideWireByParamsToPoints({ shape: w, nrOfDivisions: 12, removeEndPoint: true, removeStartPoint: true });
        expect(pts.length).toEqual(11);
        expect(pts).toEqual(
            [
                [0.15277777777777776, 0.16666666666666666, 0.03472222222222222],
                [0.2777777777777778, 0.3333333333333333, 0.13888888888888887],
                [0.375, 0.5, 0.3125],
                [0.4444444444444445, 0.6666666666666666, 0.5555555555555555],
                [0.48611111111111105, 0.8333333333333334, 0.8680555555555557],
                [0.5, 1, 1.25],
                [0.4861111111111111, 1.1666666666666667, 1.701388888888889],
                [0.4444444444444445, 1.3333333333333333, 2.222222222222222],
                [0.375, 1.5, 2.8125],
                [0.27777777777777773, 1.6666666666666667, 3.4722222222222228],
                [0.15277777777777785, 1.8333333333333333, 4.201388888888888],
            ]
        );
        w.delete();
    });

    it("should divide wire to points by equal distance", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const pts = wire.divideWireByEqualDistanceToPoints({ shape: w, nrOfDivisions: 12, removeEndPoint: false, removeStartPoint: false });
        expect(pts.length).toEqual(13);
        expect(pts).toEqual(
            [
                [0, 0, 0],
                [0.2838222828590555, 0.3424625985680442, 0.14660078927247172],
                [0.43115226769191084, 0.6289266048122308, 0.4944358428008],
                [0.4892636529329303, 0.8534643588264631, 0.9105017647338322],
                [0.49923676534972294, 1.039070056316239, 1.34958322741629],
                [0.480111123635674, 1.1994436078911832, 1.798331210638773],
                [0.4414571610105028, 1.3421778455408742, 2.2518017113259283],
                [0.38869559662499154, 1.4718143774303798, 2.7077969520134704],
                [0.32519482109496023, 1.5912785788527093, 3.1652093943943727],
                [0.25319786452105564, 1.702569762342423, 3.6234297445534183],
                [0.17427907733231243, 1.8071194740156968, 4.082100991708461],
                [0.08958978033353904, 1.9059914123946882, 4.541004080152873],
                [2.2204460492503128e-16, 1.9999999999999998, 4.999999999999998]
            ]
        );
        w.delete();
    });

    it("should divide wire to points by equal distance and remove start and end points", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const pts = wire.divideWireByEqualDistanceToPoints({ shape: w, nrOfDivisions: 12, removeEndPoint: true, removeStartPoint: true });
        expect(pts.length).toEqual(11);
        expect(pts).toEqual(
            [
                [0.2838222828590555, 0.3424625985680442, 0.14660078927247172],
                [0.43115226769191084, 0.6289266048122308, 0.4944358428008],
                [0.4892636529329303, 0.8534643588264631, 0.9105017647338322],
                [0.49923676534972294, 1.039070056316239, 1.34958322741629],
                [0.480111123635674, 1.1994436078911832, 1.798331210638773],
                [0.4414571610105028, 1.3421778455408742, 2.2518017113259283],
                [0.38869559662499154, 1.4718143774303798, 2.7077969520134704],
                [0.32519482109496023, 1.5912785788527093, 3.1652093943943727],
                [0.25319786452105564, 1.702569762342423, 3.6234297445534183],
                [0.17427907733231243, 1.8071194740156968, 4.082100991708461],
                [0.08958978033353904, 1.9059914123946882, 4.541004080152873],
            ]
        );
        w.delete();
    });

    it("should combine edges and wires into a wire", async () => {
        const e1 = edge.line({ start: [0, 0, 0], end: [1, 0, 0] });
        const e2 = edge.line({ start: [1, 0, 0], end: [3, 4, 0] });
        const w1 = wire.createBezier({ points: [[3, 4, 0], [4, 4, 0], [5, 5, 0]], closed: false });
        const w2 = wire.createBezier({ points: [[5, 5, 0], [6, 6, 0], [7, 7, 0]], closed: false });
        const combined = wire.combineEdgesAndWiresIntoAWire({ shapes: [e1, e2, w1, w2] });
        const length = wire.getWireLength({ shape: combined });
        expect(length).toBeCloseTo(10.596150241589982);
        e1.delete();
        e2.delete();
        w1.delete();
        w2.delete();
        combined.delete();
    });

    it("should add edges and wires into a wire", async () => {
        const wBase = wire.createBezier({ points: [[-1, 0, 0], [1, 1, 0], [0, 0, 0]], closed: false });
        const e1 = edge.line({ start: [0, 0, 0], end: [1, 0, 0] });
        const e2 = edge.line({ start: [1, 0, 0], end: [3, 4, 0] });
        const w1 = wire.createBezier({ points: [[3, 4, 0], [4, 4, 0], [5, 5, 0]], closed: false });
        const w2 = wire.createBezier({ points: [[5, 5, 0], [6, 6, 0], [7, 7, 0]], closed: false });
        const combined = wire.addEdgesAndWiresToWire({ shape: wBase, shapes: [e1, e2, w1, w2] });
        const length = wire.getWireLength({ shape: combined });
        expect(length).toBeCloseTo(12.640244335199364);
        wBase.delete();
        e1.delete();
        e2.delete();
        w1.delete();
        w2.delete();
        combined.delete();
    });

    it("should not add disconnected edges and wires into a wire", async () => {
        const wBase = wire.createBezier({ points: [[-1, 0, 0], [1, 1, 0], [0, 2, 3]], closed: false });
        const e1 = edge.line({ start: [0, 0, 0], end: [1, 0, 0] });
        const e2 = edge.line({ start: [1, 0, 0], end: [3, 4, 0] });
        const w1 = wire.createBezier({ points: [[3, 4, 0], [4, 4, 0], [5, 5, 0]], closed: false });
        const w2 = wire.createBezier({ points: [[5, 5, 0], [6, 6, 0], [7, 7, 0]], closed: false });
        expect(() => wire.addEdgesAndWiresToWire({ shape: wBase, shapes: [e1, e2, w1, w2] }))
            .toThrowError("Wire could not be constructed. Check if edges and wires do not have disconnected elements.");
        wBase.delete();
        e1.delete();
        e2.delete();
        w1.delete();
        w2.delete();
    });

    it("should be able to construct wire even if there are weird shapes in the list if the rest is correct", async () => {
        const wBase = wire.createBezier({ points: [[-1, 0, 0], [1, 1, 0], [0, 0, 0]], closed: false });
        const e1 = edge.line({ start: [0, 0, 0], end: [1, 0, 0] });
        const e2 = edge.line({ start: [1, 0, 0], end: [3, 4, 0] });
        const w1 = wire.createBezier({ points: [[3, 4, 0], [4, 4, 0], [5, 5, 0]], closed: false });
        const w2 = wire.createBezier({ points: [[5, 5, 0], [6, 6, 0], [7, 7, 0]], closed: false });
        const box = occHelper.bRepPrimAPIMakeBox(1, 1, 1, [0, 0, 0]);
        const combined = wire.addEdgesAndWiresToWire({ shape: wBase, shapes: [e1, e2, w1, w2, box] });
        const length = wire.getWireLength({ shape: combined });
        expect(length).toBeCloseTo(12.640244335199364);
        wBase.delete();
        e1.delete();
        e2.delete();
        w1.delete();
        w2.delete();
        box.delete();
        combined.delete();
    });

    it("should place wire on a face", async () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const f = face.getFace({ shape: sph, index: 0 });
        const w = wire.createEllipseWire({ radiusMajor: 0.5, radiusMinor: 0.3, center: [0, 0, 0], direction: [0, 1, 0] });
        const placed = wire.placeWireOnFace({ wire: w, face: f });
        const length = wire.getWireLength({ shape: placed });
        expect(length).toBeCloseTo(7.489657680597562);
        sph.delete();
        f.delete();
        w.delete();
        placed.delete();
    });

    it("should place wires on a face", async () => {
        const sph1 = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const f = face.getFace({ shape: sph1, index: 0 });
        const w1 = wire.createEllipseWire({ radiusMajor: 0.5, radiusMinor: 0.3, center: [0, 0, 0], direction: [0, 1, 0] });
        const w2 = wire.createEllipseWire({ radiusMajor: 0.3, radiusMinor: 0.1, center: [0, 0, 0], direction: [0, 1, 0] });

        const placed = wire.placeWiresOnFace({ face: f, wires: [w1, w2] });
        const length1 = wire.getWireLength({ shape: placed[0] });
        const length2 = wire.getWireLength({ shape: placed[1] });

        expect(length1).toBeCloseTo(7.489657680597562);
        expect(length2).toBeCloseTo(3.997689022384506);
        sph1.delete();
        f.delete();
        w1.delete();
        w2.delete();
        placed.forEach((w) => w.delete());
    });

    it("should create a ngon wire", () => {
        const w = wire.createNGonWire({ nrCorners: 6, radius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
        const length = wire.getWireLength({ shape: w });
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: w });
        expect(cornerPoints.length).toBe(6);
        expect(length).toBeCloseTo(6);
        expect(cornerPoints).toEqual(
            [
                [0, 1, 0],
                [0.8660254037844386, 0.5000000000000001, 0],
                [0.8660254037844387, -0.4999999999999998, 0],
                [1.1102230246251565e-16, -1, 0],
                [-0.8660254037844385, -0.5000000000000004, 0],
                [-0.866025403784439, 0.49999999999999933, 0]
            ]
        );
        w.delete();
    });

    it("should split circle wire by points", () => {
        const circle = wire.createSquareWire({
            size: 1,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: circle,
            removeEndPoint: false,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: circle, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(l => {
            expect(l).toBeCloseTo(0.4, 10);
        });
    });


    it("should split circle wire by points", () => {
        const circle = wire.createSquareWire({
            size: 1,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: circle,
            removeEndPoint: true,
            removeStartPoint: true,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: circle, points: pts });
        expect(split.length).toBe(9);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        expect(segmentLengths).toEqual([0.8000000000000004, 0.3999999999999999, 0.3999999999999999, 0.3999999999999999, 0.3999999999999999, 0.3999999999999999, 0.3999999999999999, 0.40000000000000013, 0.4]);
    });

    it("should split heart wire by points", () => {
        const heart = wire.createHeartWire({
            sizeApprox: 2,
            rotation: 0,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: heart,
            removeEndPoint: false,
            removeStartPoint: false,
            nrOfDivisions: 20
        });
        const split = wire.splitOnPoints({ shape: heart, points: pts });
        expect(split.length).toBe(20);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(l => {
            expect(l).toBeCloseTo(0.324548544534, 10);
        });
    });

    it("should split rectangle wire by points", () => {
        const rectangle = wire.createRectangleWire({
            width: 2,
            length: 2,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: rectangle,
            removeEndPoint: false,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: rectangle, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(l => {
            expect(l).toBeCloseTo(0.8, 10);
        });
    });

    it("should split non closed interpolated wire by points when start and end points are removed", () => {
        const interpolatedWire = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], periodic: false, tolerance: 1e-7 });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: interpolatedWire,
            removeEndPoint: true,
            removeStartPoint: true,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: interpolatedWire, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(l => {
            expect(l).toBeCloseTo(0.725389, 4);
        });
    });

    it("should split non closed interpolated wire by points when start point is removed", () => {
        const interpolatedWire = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], periodic: false, tolerance: 1e-7 });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: interpolatedWire,
            removeEndPoint: false,
            removeStartPoint: true,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: interpolatedWire, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(l => {
            expect(l).toBeCloseTo(0.72538, 4);
        });
    });

    it("should split non closed interpolated wire by points when end point is removed", () => {
        const interpolatedWire = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], periodic: false, tolerance: 1e-7 });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: interpolatedWire,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: interpolatedWire, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(l => {
            expect(l).toBeCloseTo(0.72538, 4);
        });
    });

    it("should split non periodic closed interpolated wire by points when end point is removed and when wire is quite strange", () => {
        const interpolatedWire = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5], [1, 1, 0], [1, 3, 0], [-3, -5, -10], [-2, -1, 0], [0, 0, 0]], periodic: false, tolerance: 1e-7 });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: interpolatedWire,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: interpolatedWire, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(l => {
            expect(l).toBeCloseTo(4.4, 1);
        });
    });

    it("should create less wires than there are edges on the wire and group edges correctly", () => {
        const rectangle = wire.createRectangleWire({
            width: 2,
            length: 2,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: rectangle,
            removeEndPoint: false,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: rectangle, points: pts });
        expect(split.length).toBe(10);
        const edges = [];
        split.forEach(s => {
            edges.push(edge.getEdges({ shape: s }));
        });
        expect(edges.length).toBe(10);
        const lengths = edges.map(e => e.length);
        expect(lengths).toEqual([1, 1, 1, 2, 1, 1, 1, 1, 2, 1]);
    });

    it("should create less wires than there are edges on the wire and group edges correctly even if end point is not added to the wire", () => {
        const rectangle = wire.createRectangleWire({
            width: 2,
            length: 2,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: rectangle,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: rectangle, points: pts });
        expect(split.length).toBe(10);
        const edges = [];
        split.forEach(s => {
            edges.push(edge.getEdges({ shape: s }));
        });
        expect(edges.length).toBe(10);
        const lengths = edges.map(e => e.length);
        expect(lengths).toEqual([1, 1, 1, 2, 1, 1, 1, 1, 2, 1]);
    });

    it("should create less wires than there are edges on the wire and group edges correctly even if start and end point is not added to the wire", () => {
        const rectangle = wire.createRectangleWire({
            width: 2,
            length: 2,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: rectangle,
            removeEndPoint: true,
            removeStartPoint: true,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: rectangle, points: pts });
        expect(split.length).toBe(9);
        const edges = [];
        split.forEach(s => {
            edges.push(edge.getEdges({ shape: s }));
        });
        expect(edges.length).toBe(9);
        const lengths = edges.map(e => e.length);
        expect(lengths).toEqual([2, 1, 2, 1, 1, 1, 1, 2, 1]);
    });

    it("should split star wire by points", () => {
        const star = wire.createStarWire({
            numRays: 23,
            outerRadius: 2,
            innerRadius: 1,
            half: false,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: star,
            removeEndPoint: true,
            removeStartPoint: true,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: star, points: pts });
        expect(split.length).toBe(9);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        expect(segmentLengths).toEqual([9.369811423392672, 4.684905711696324, 4.6849057116963175, 4.684905711696345, 4.684905711696367, 4.68490571169632, 4.6849057116963415, 4.68490571169634, 4.684905711696342]);
    });

    it("should close open wire", () => {
        const pln = wire.createPolylineWire({
            points: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]]
        });
        const closed = wire.closeOpenWire({ shape: pln });
        const lengthPln = wire.getWireLength({ shape: pln });
        const length = wire.getWireLength({ shape: closed });
        expect(lengthPln).toBeCloseTo(3);
        expect(length).toBeCloseTo(4);
        const startPt = wire.startPointOnWire({ shape: closed });
        const endPt = wire.endPointOnWire({ shape: closed });
        expect(startPt).toEqual(endPt);
        pln.delete();
        closed.delete();
    });

    it("should not close closed wire", () => {
        const pln = wire.createPolylineWire({
            points: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]]
        });
        const closed = wire.closeOpenWire({ shape: pln });
        const closed2 = wire.closeOpenWire({ shape: closed });
        const length = wire.getWireLength({ shape: closed2 });
        expect(length).toBeCloseTo(4);
        const startPt = wire.startPointOnWire({ shape: closed2 });
        const endPt = wire.endPointOnWire({ shape: closed2 });
        expect(startPt).toEqual(endPt);
        pln.delete();
        closed.delete();
    });

    it("should project wire on the shape", () => {
        const star = wire.createStarWire({
            numRays: 23,
            outerRadius: 2,
            innerRadius: 1,
            half: false,
            center: [0, 4, 0],
            direction: [0, 1, 0]
        });
        const sphere = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const projected = wire.project({ wire: star, shape: sphere, direction: [0, -1, 0] });
        const wires = wire.getWires({ shape: projected });
        expect(wires.length).toBe(2);
        const wireLengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(wireLengths).toEqual([54.554389938555396, 54.55438993855537]);

        star.delete();
        sphere.delete();
        projected.delete();
        wires.forEach(w => w.delete());
    });

    it("should project wires on the shape", () => {
        const star1 = wire.createStarWire({
            numRays: 15,
            outerRadius: 2,
            innerRadius: 1,
            half: false,
            center: [0, 4, 0],
            direction: [0, 1, 0]
        });
        const star2 = wire.createStarWire({
            numRays: 15,
            outerRadius: 1,
            innerRadius: 0.5,
            half: false,
            center: [0, 4, 0],
            direction: [0, 1, 0]
        });
        const sphere = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const projected = wire.projectWires({ wires: [star1, star2], shape: sphere, direction: [0, -1, 0] });
        expect(projected.length).toBe(2);
        const wires = projected.map(p => {
            return wire.getWires({ shape: p });
        }).flat();
        expect(wires.length).toBe(4);
        const wireLengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(wireLengths).toEqual([36.22718914885955, 36.22718914885927, 16.1396129404029, 16.139612940402888]);

        star1.delete();
        star2.delete();
        sphere.delete();
        projected.forEach(p => p.delete());
        wires.forEach(w => w.delete());
    });

    it("should create wire from edge", () => {
        const e = edge.createCircleEdge({
            radius: 1,
            center: [0, 0, 0],
            direction: [0, 1, 0],
        });
        const w = wire.createWireFromEdge({
            shape: e
        });
        const type = shape.getShapeType({ shape: w });
        expect(type).toBe(Inputs.OCCT.shapeTypeEnum.wire);
    });

    it("should get a center of mass from a circular wire", () => {
        const w = wire.createCircleWire({
            radius: 1,
            center: [0, 1, 0.5],
            direction: [0, 1, 0]
        });
        const center = wire.getWireCenterOfMass({
            shape: w
        });
        expect(center[0]).toBeCloseTo(0);
        expect(center[1]).toBeCloseTo(1);
        expect(center[2]).toBeCloseTo(0.5);
    });

    it("should get a center of mass from a bspline", () => {
        const w = wire.createBSpline({
            points: [[0, 0, 0], [0, 0, 1], [1, 1, 0], [1, 0, 1]],
            closed: false
        });
        const center = wire.getWireCenterOfMass({
            shape: w
        });
        expect(center[0]).toBe(0.5927437729817302);
        expect(center[1]).toBe(0.392179685881662);
        expect(center[2]).toBe(0.48928161123208896);
    });

    it("should get centers of mass from two wires", () => {
        const w1 = wire.createCircleWire({
            radius: 1,
            center: [0, 1, 0.5],
            direction: [0, 1, 0]
        });
        const w2 = wire.createEllipseWire({
            radiusMajor: 1,
            radiusMinor: 0.5,
            center: [0, 2, 1],
            direction: [0, 1, 0]
        });
        const centers = wire.getWiresCentersOfMass({
            shapes: [w1, w2]
        });
        expect(centers[0][0]).toBeCloseTo(0);
        expect(centers[0][1]).toBeCloseTo(1);
        expect(centers[0][2]).toBeCloseTo(0.5);

        expect(centers[1][0]).toBeCloseTo(0);
        expect(centers[1][1]).toBeCloseTo(2);
        expect(centers[1][2]).toBeCloseTo(1);
    });


});

