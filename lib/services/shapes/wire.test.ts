import initOpenCascade, { OpenCascadeInstance } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTEdge } from "./edge";
import { OccHelper } from "../../occ-helper";
import { OCCTWire } from "./wire";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTFace } from "./face";

describe("OCCT wire unit tests", () => {
    let occt: OpenCascadeInstance;
    let wire: OCCTWire;
    let edge: OCCTEdge;
    let face: OCCTFace;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        edge = new OCCTEdge(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
        face = new OCCTFace(occt, occHelper);
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

    it("should interpolate points", async () => {
        const w = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], periodic: false, tolerance: 1e-7 });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(7.256109149279404);
        w.delete();
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

    it("should create a polyline wire", async () => {
        const w = wire.createPolylineWire({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(6.610365985079727);
        w.delete();
    });

    it("should create a star wire", async () => {
        const w = wire.createStarWire({ numRays: 9, outerRadius: 5, innerRadius: 2, center: [0, 0, 0], direction: [0, 0, 1], half: false });
        const length = wire.getWireLength({ shape: w });
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: w });
        expect(cornerPoints.length).toBe(18);
        expect(length).toBe(57.5047112618376);
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
        expect(() => wire.getWire({ shape: undefined, index: 0 })).toThrowError("Shape is not provided or is of incorrect type");
    });

    it("should throw error if shape is of incorrect type", async () => {
        const b = edge.createCircleEdge({ radius: 5, center: [0, 0, 0], direction: [0, 0, 1] });
        expect(() => wire.getWire({ shape: b, index: 0 })).toThrowError("Shape is not provided or is of incorrect type");
        b.delete();
    });

    it("should throw error if innerWire not found", async () => {
        const rect = wire.createRectangleWire({width: 10, length: 10, center: [0, 0, 0], direction: [0, 1, 0]});
        expect(() => wire.getWire({ shape: rect, index: 10 })).toThrowError("Wire not found");
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
        const placed = wire.placeWireOnFace({ shapes: [w, f] });
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

        const placed = wire.placeWiresOnFace({ shape: f, shapes: [w1, w2] });
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
    
    it("placeWireOnFace throws with undefined shapes", () => {
        expect(() => wire.placeWireOnFace({})).toThrowError("Shapes needs to be an array of length 2");
    });
});

