import initOpenCascade, { OpenCascadeInstance, TopoDS_Face, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTEdge } from "./edge";
import { OccHelper } from "../../occ-helper";
import { OCCTWire } from "./wire";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTFace } from "./face";
import { OCCTGeom } from "../geom/geom";
import { OCCT } from "../../api/inputs";

describe('OCCT face unit tests', () => {
    let occt: OpenCascadeInstance;
    let wire: OCCTWire;
    let face: OCCTFace;
    let geom: OCCTGeom;
    let occHelper: OccHelper

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        wire = new OCCTWire(occt, occHelper);
        face = new OCCTFace(occt, occHelper);
        geom = new OCCTGeom(occt, occHelper);
    });

    it('should create a face from closed planar wire', async () => {
        const w = wire.createCircleWire({ radius: 3, center: [0, 0, 0], direction: [0, 0, 1] });
        const f = face.createFaceFromWire({ shape: w, planar: true });
        const area = face.getFaceArea({ shape: f });
        expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.TopAbs_FACE);
        expect(area).toBeCloseTo(28.274333882308138);
        w.delete();
        f.delete();
    });

    it('should create a face from closed non-planar wire', async () => {
        const w = wire.interpolatePoints({ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], periodic: true, tolerance: 1e-7 });
        const f = face.createFaceFromWire({ shape: w, planar: false });
        const area = face.getFaceArea({ shape: f });
        expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.TopAbs_FACE);
        expect(area).toBeCloseTo(1.5999655130076433);
        w.delete();
        f.delete();
    });

    it('should not create a good face from open non-planar wire', async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], closed: false });
        const f = face.createFaceFromWire({ shape: w, planar: false });
        const area = face.getFaceArea({ shape: f });
        expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.TopAbs_FACE);
        //TODO check how to test validity of a face later
        expect(area).toBeLessThan(0);
        w.delete();
        f.delete();
    });

    it('should not create a good face from shape that is not a wire', async () => {
        const b = occHelper.bRepPrimAPIMakeBox(1, 1, 1, [0, 0, 0]);
        expect(() => face.createFaceFromWire({ shape: b, planar: false })).toThrowError('Provided input shape is not a wire');
        b.delete();
    });

    it('should create a faces from closed planar wires', async () => {
        const w1 = wire.createCircleWire({ radius: 3, center: [0, 0, 0], direction: [0, 0, 1] });
        const w2 = wire.createCircleWire({ radius: 2, center: [0, 0, 1], direction: [0, 0, 1] });
        const f = face.createFacesFromWires({ shapes: [w1, w2], planar: true });
        const area1 = face.getFaceArea({ shape: f[0] });
        const area2 = face.getFaceArea({ shape: f[1] });
        expect(area1).toBeCloseTo(28.274333882308138);
        expect(area2).toBeCloseTo(12.566370614359167);
        w1.delete();
        w2.delete();
        f.forEach(s => s.delete());
    });

    it('should create an infinite face from surface', async () => {
        const srf = geom.surfaces.cylindricalSurface({ radius: 3, center: [0, 0, 0], direction: [0, 0, 1] });
        const f = face.faceFromSurface({ shape: srf, tolerance: 1e-7 });
        const area = face.getFaceArea({ shape: f });
        expect(area).toBeCloseTo(2e+100);
        srf.delete();
        f.delete();
    });

    it('should create an face from surface and wire', async () => {
        const f1 = face.createCircleFace({ radius: 3, center: [0, 0, 0], direction: [0, 0, 1] });
        const srf = geom.surfaces.surfaceFromFace({ shape: f1 });
        const w = wire.createCircleWire({ radius: 2, center: [0, 0, 1], direction: [0, 0, 1] });
        const f = face.faceFromSurfaceAndWire({ shapes: [srf, w], inside: true });
        const area = face.getFaceArea({ shape: f });
        expect(area).toBeCloseTo(12.566370614359167);
        f1.delete();
        srf.delete();
        w.delete();
        f.delete();
    });

    it('should get u min bound', () => {
        const f = face.createRectangleFace({ width: 1, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const uMin = face.getUMinBound({ shape: f });
        expect(uMin).toBe(-1);
        f.delete();
    });

    it('should get u max bound', () => {
        const f = face.createRectangleFace({ width: 1, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const uMax = face.getUMaxBound({ shape: f });
        expect(uMax).toBe(1);
        f.delete();
    });

    it('should get v min bound', () => {
        const f = face.createRectangleFace({ width: 1, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const vMin = face.getVMinBound({ shape: f });
        expect(vMin).toBe(-0.5);
        f.delete();
    });

    it('should get v max bound', () => {
        const f = face.createRectangleFace({ width: 1, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const vMax = face.getVMaxBound({ shape: f });
        expect(vMax).toBe(0.5);
        f.delete();
    });

    it('should subdivide face into points', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const pts = face.subdivideToPoints({
            shape: f,
            nrDivisionsU: 5,
            nrDivisionsV: 6,
            removeEndEdgeU: false,
            removeEndEdgeV: false,
            removeStartEdgeU: false,
            removeStartEdgeV: false,
            shiftHalfStepU: false,
            shiftHalfStepV: false,
        });
        expect(pts.length).toBe(30);
        expect(pts).toEqual([
            [0, -2, 1.2246467991473532e-16],
            [0, -1.618033988749895, 1.1755705045849463],
            [0, -0.6180339887498948, 1.902113032590307],
            [0, 0.6180339887498948, 1.902113032590307],
            [0, 1.618033988749895, 1.1755705045849463],
            [0, 2, 1.2246467991473532e-16],
            [1.2246467991473532e-16, -2, 7.498798913309288e-33],
            [1.1755705045849463, -1.618033988749895, 7.198293278059966e-17],
            [1.902113032590307, -0.6180339887498948, 1.1647083184890923e-16],
            [1.902113032590307, 0.6180339887498948, 1.1647083184890923e-16],
            [1.1755705045849463, 1.618033988749895, 7.198293278059966e-17],
            [1.2246467991473532e-16, 2, 7.498798913309288e-33],
            [1.4997597826618576e-32, -2, -1.2246467991473532e-16],
            [1.4396586556119933e-16, -1.618033988749895, -1.1755705045849463],
            [2.3294166369781847e-16, -0.6180339887498948, -1.902113032590307],
            [2.3294166369781847e-16, 0.6180339887498948, -1.902113032590307],
            [1.4396586556119933e-16, 1.618033988749895, -1.1755705045849463],
            [1.4997597826618576e-32, 2, -1.2246467991473532e-16],
            [-1.2246467991473532e-16, -2, -2.2496396739927864e-32],
            [-1.1755705045849463, -1.618033988749895, -2.15948798341799e-16],
            [-1.902113032590307, -0.6180339887498948, -3.494124955467277e-16],
            [-1.902113032590307, 0.6180339887498948, -3.494124955467277e-16],
            [-1.1755705045849463, 1.618033988749895, -2.15948798341799e-16],
            [-1.2246467991473532e-16, 2, -2.2496396739927864e-32],
            [-2.999519565323715e-32, -2, 1.2246467991473532e-16],
            [-2.8793173112239865e-16, -1.618033988749895, 1.1755705045849463],
            [-4.658833273956369e-16, -0.6180339887498948, 1.902113032590307],
            [-4.658833273956369e-16, 0.6180339887498948, 1.902113032590307],
            [-2.8793173112239865e-16, 1.618033988749895, 1.1755705045849463],
            [-2.999519565323715e-32, 2, 1.2246467991473532e-16]
        ]);
        sph.delete();
        f.delete();
    });

    it('should subdivide face into points controlled', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const subdOpt = new OCCT.FaceSubdivisionControlledDto<TopoDS_Face>(f);
        subdOpt.nrDivisionsU = 5;
        subdOpt.nrDivisionsV = 6;
        subdOpt.shiftHalfStepNthU = 2;
        const pts = face.subdivideToPointsControlled(subdOpt);
        expect(pts.length).toBe(30);
        expect(pts).toEqual(
            [
                [8.659560562354932e-17, -2, 8.659560562354934e-17],
                [0, -1.618033988749895, 1.1755705045849463],
                [1.3449970239279145, -0.6180339887498948, 1.3449970239279148],
                [0, 0.6180339887498948, 1.902113032590307],
                [0.8312538755549068, 1.618033988749895, 0.8312538755549069],
                [0, 2, 1.2246467991473532e-16],
                [8.659560562354934e-17, -2, -8.659560562354932e-17],
                [1.1755705045849463, -1.618033988749895, 7.198293278059966e-17],
                [1.3449970239279148, -0.6180339887498948, -1.3449970239279145],
                [1.902113032590307, 0.6180339887498948, 1.1647083184890923e-16],
                [0.8312538755549069, 1.618033988749895, -0.8312538755549068],
                [1.2246467991473532e-16, 2, 7.498798913309288e-33],
                [-8.659560562354932e-17, -2, -8.659560562354935e-17],
                [1.4396586556119933e-16, -1.618033988749895, -1.1755705045849463],
                [-1.3449970239279145, -0.6180339887498948, -1.344997023927915],
                [2.3294166369781847e-16, 0.6180339887498948, -1.902113032590307],
                [-0.8312538755549068, 1.618033988749895, -0.831253875554907],
                [1.4997597826618576e-32, 2, -1.2246467991473532e-16],
                [-8.659560562354935e-17, -2, 8.65956056235493e-17],
                [-1.1755705045849463, -1.618033988749895, -2.15948798341799e-16],
                [-1.344997023927915, -0.6180339887498948, 1.3449970239279143],
                [-1.902113032590307, 0.6180339887498948, -3.494124955467277e-16],
                [-0.831253875554907, 1.618033988749895, 0.8312538755549067],
                [-1.2246467991473532e-16, 2, -2.2496396739927864e-32],
                [8.65956056235493e-17, -2, 8.659560562354935e-17],
                [-2.8793173112239865e-16, -1.618033988749895, 1.1755705045849463],
                [1.3449970239279143, -0.6180339887498948, 1.344997023927915],
                [-4.658833273956369e-16, 0.6180339887498948, 1.902113032590307],
                [0.8312538755549067, 1.618033988749895, 0.831253875554907],
                [-2.999519565323715e-32, 2, 1.2246467991473532e-16]
            ]
        );
        sph.delete();
        f.delete();
    });

    it('should subdivide face into points controlled with removals', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const subdOpt = new OCCT.FaceSubdivisionControlledDto<TopoDS_Face>(f);
        subdOpt.nrDivisionsU = 4;
        subdOpt.nrDivisionsV = 7;
        subdOpt.shiftHalfStepNthV = 3;
        subdOpt.removeEndEdgeNthV = 2;
        subdOpt.removeEndEdgeNthU = 1;
        subdOpt.removeStartEdgeNthV = 2;
        subdOpt.removeStartEdgeNthU = 1;
        const pts = face.subdivideToPointsControlled(subdOpt);
        expect(pts.length).toBe(12);
        expect(pts).toEqual(
            [
                [1.0605752387249069e-16, -2, -6.123233995736764e-17],
                [0.8660254037844385, -1.7320508075688774, -0.49999999999999967],
                [1.5, -1, -0.8660254037844383],
                [1.7320508075688774, 0, -0.9999999999999996],
                [1.5000000000000002, 0.9999999999999997, -0.8660254037844384],
                [0.8660254037844393, 1.732050807568877, -0.5000000000000001],
                [1.0605752387249069e-16, 2, -6.123233995736764e-17],
                [-0.8660254037844383, -1.7320508075688774, -0.5000000000000003],
                [-1.4999999999999996, -1, -0.8660254037844394],
                [-1.732050807568877, 0, -1.0000000000000009],
                [-1.4999999999999998, 0.9999999999999997, -0.8660254037844395],
                [-0.866025403784439, 1.732050807568877, -0.5000000000000008]
            ]
        );
        sph.delete();
        f.delete();
    });

    it('should subdivide face into points', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const pts = face.subdivideToPoints({
            shape: f,
            nrDivisionsU: 4,
            nrDivisionsV: 3,
            removeEndEdgeU: false,
            removeEndEdgeV: false,
            removeStartEdgeU: false,
            removeStartEdgeV: false,
            shiftHalfStepU: false,
            shiftHalfStepV: false,
        });
        expect(pts.length).toBe(12);
        expect(pts).toEqual([
            [0, -2, 1.2246467991473532e-16],
            [0, 0, 2],
            [0, 2, 1.2246467991473532e-16],
            [1.0605752387249069e-16, -2, -6.123233995736764e-17],
            [1.7320508075688774, 0, -0.9999999999999996],
            [1.0605752387249069e-16, 2, -6.123233995736764e-17],
            [-1.0605752387249067e-16, -2, -6.123233995736771e-17],
            [-1.732050807568877, 0, -1.0000000000000009],
            [-1.0605752387249067e-16, 2, -6.123233995736771e-17],
            [-2.999519565323715e-32, -2, 1.2246467991473532e-16],
            [-4.898587196589413e-16, 0, 2],
            [-2.999519565323715e-32, 2, 1.2246467991473532e-16]
        ]);
        sph.delete();
        f.delete();
    });

    it('should subdivide face into points, remove end edges and shift u and v directions', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const pts = face.subdivideToPoints({
            shape: f,
            nrDivisionsU: 5,
            nrDivisionsV: 4,
            removeEndEdgeU: true,
            removeEndEdgeV: true,
            removeStartEdgeU: true,
            removeStartEdgeV: true,
            shiftHalfStepU: true,
            shiftHalfStepV: true,
        });
        expect(pts.length).toBe(6);
        expect(pts).toEqual([
            [1.4142135623730951, -4.440892098500626e-16, -1.414213562373095],
            [0.707106781186548, 1.732050807568877, -0.7071067811865479],
            [-1.414213562373095, -4.440892098500626e-16, -1.4142135623730954],
            [-0.7071067811865479, 1.732050807568877, -0.7071067811865481],
            [-1.4142135623730954, -4.440892098500626e-16, 1.4142135623730947],
            [-0.7071067811865481, 1.732050807568877, 0.7071067811865478]
        ])
        sph.delete();
        f.delete();
    });

    it('should subdivide into normals', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const normals = face.subdivideToNormals({
            shape: f,
            nrDivisionsU: 4,
            nrDivisionsV: 3,
            removeEndEdgeU: false,
            removeEndEdgeV: false,
            removeStartEdgeU: false,
            removeStartEdgeV: false,
            shiftHalfStepU: false,
            shiftHalfStepV: false,
        });
        expect(normals.length).toBe(12);
        expect(normals).toEqual([
            [0, -1, 1.2246467991473532e-16],
            [0, -0, 1],
            [-0, 1, 1.2246467991473532e-16],
            [1.060575238724907e-16, -1, -6.123233995736765e-17],
            [0.8660254037844388, 0, -0.49999999999999983],
            [1.060575238724907e-16, 1, -6.123233995736765e-17],
            [-1.0605752387249067e-16, -1, -6.123233995736771e-17],
            [-0.8660254037844385, 0, -0.5000000000000004],
            [-1.0605752387249067e-16, 1, -6.123233995736771e-17],
            [-2.999519565323715e-32, -1, 1.2246467991473532e-16],
            [-2.4492935982947064e-16, 0, 1],
            [-2.999519565323715e-32, 1, 1.2246467991473532e-16]
        ])
        sph.delete();
        f.delete();
    });

    it('should subdivide face into normals, remove end edges and shift u and v directions', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const normals = face.subdivideToNormals({
            shape: f,
            nrDivisionsU: 5,
            nrDivisionsV: 4,
            removeEndEdgeU: true,
            removeEndEdgeV: true,
            removeStartEdgeU: true,
            removeStartEdgeV: true,
            shiftHalfStepU: true,
            shiftHalfStepV: true,
        });
        expect(normals.length).toBe(6);
        expect(normals).toEqual([
            [0.7071067811865476, -2.220446049250313e-16, -0.7071067811865475],
            [0.353553390593274, 0.8660254037844385, -0.35355339059327395],
            [-0.7071067811865475, -2.220446049250313e-16, -0.7071067811865477],
            [-0.35355339059327384, 0.8660254037844385, -0.35355339059327395],
            [-0.7071067811865477, -2.220446049250313e-16, 0.7071067811865474],
            [-0.35355339059327406, 0.8660254037844385, 0.3535533905932739]
        ]);
        sph.delete();
        f.delete();
    });

    it('should subdivide to points on param on u', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const points = face.subdivideToPointsOnParam({
            shape: f,
            nrPoints: 4,
            removeEndPoint: false,
            removeStartPoint: false,
            shiftHalfStep: false,
            param: 0.2,
            isU: true
        });
        expect(points.length).toBe(4);
        expect(points).toEqual([
            [1.1647083184890923e-16, -2, 3.7843667304341506e-17],
            [1.6472782070926637, -1, 0.535233134659635],
            [1.647278207092664, 0.9999999999999997, 0.535233134659635],
            [1.1647083184890923e-16, 2, 3.7843667304341506e-17]
        ]);
        sph.delete();
        f.delete();
    });

    it('should subdivide to points on param on v', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const points = face.subdivideToPointsOnParam({
            shape: f,
            nrPoints: 4,
            removeEndPoint: false,
            removeStartPoint: false,
            shiftHalfStep: false,
            param: 0.5,
            isU: false
        });
        expect(points.length).toBe(4);
        expect(points).toEqual([
            [0, 0, 2],
            [1.7320508075688774, 0, -0.9999999999999996],
            [-1.732050807568877, 0, -1.0000000000000009],
            [-4.898587196589413e-16, 0, 2]
        ]);
        sph.delete();
        f.delete();
    });

    it('should subdivide to points on param, remove start and end points and shift half step on v', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const points = face.subdivideToPointsOnParam({
            shape: f,
            nrPoints: 7,
            removeEndPoint: true,
            removeStartPoint: true,
            shiftHalfStep: true,
            param: 0.3,
            isU: false
        });
        expect(points.length).toBe(5);
        expect(points).toEqual([
            [1.618033988749895, -1.1755705045849463, 9.907600726170916e-17],
            [0.809016994374948, -1.1755705045849463, -1.4012585384440732],
            [-0.809016994374947, -1.1755705045849463, -1.4012585384440739],
            [-1.618033988749895, -1.1755705045849463, -2.9722802178512745e-16],
            [-0.8090169943749481, -1.1755705045849463, 1.4012585384440732]
        ]);
        sph.delete();
        f.delete();
    });

    it('should subdivide to points on param, remove start and end points and shift half step on u', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const points = face.subdivideToPointsOnParam({
            shape: f,
            nrPoints: 7,
            removeEndPoint: true,
            removeStartPoint: true,
            shiftHalfStep: true,
            param: 0.3,
            isU: true
        });
        expect(points.length).toBe(5);
        expect(points).toEqual([
            [1.3449970239279145, -1.4142135623730951, -0.43701602444882093],
            [1.8373001026999978, -0.5176380902050418, -0.5969749912579707],
            [1.837300102699998, 0.5176380902050414, -0.5969749912579708],
            [1.344997023927915, 1.4142135623730947, -0.43701602444882104],
            [0.49230307877208407, 1.9318516525781364, -0.15995896680915006]
        ]);
        sph.delete();
        f.delete();
    });

    it('should subdivide to points on param on u', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUVOnParam({
            shape: f,
            nrPoints: 4,
            removeEndPoint: false,
            removeStartPoint: false,
            shiftHalfStep: false,
            param: 0.2,
            isU: true
        });
        expect(uvs.length).toBe(4);
        expect(uvs).toEqual([
            [1.2566370614359172, -1.5707963267948966],
            [1.2566370614359172, -0.5235987755982989],
            [1.2566370614359172, 0.5235987755982987],
            [1.2566370614359172, 1.5707963267948966]
        ]);
        sph.delete();
        f.delete();
    });

    it('should subdivide to points on param on u', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUVOnParam({
            shape: f,
            nrPoints: 4,
            removeEndPoint: false,
            removeStartPoint: false,
            shiftHalfStep: false,
            param: 0.3423,
            isU: true
        });
        expect(uvs.length).toBe(4);
        expect(uvs).toEqual([
            [2.1507343306475724, -1.5707963267948966],
            [2.1507343306475724, -0.5235987755982989],
            [2.1507343306475724, 0.5235987755982987],
            [2.1507343306475724, 1.5707963267948966]
        ]);
        sph.delete();
        f.delete();
    });

    it('should subdivide to points on param on v', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUVOnParam({
            shape: f,
            nrPoints: 4,
            removeEndPoint: false,
            removeStartPoint: false,
            shiftHalfStep: false,
            param: 0.3423,
            isU: false
        });
        expect(uvs.length).toBe(4);
        expect(uvs).toEqual([
            [0, -0.4954291614711104],
            [2.0943951023931953, -0.4954291614711104],
            [4.1887902047863905, -0.4954291614711104],
            [6.283185307179586, -0.4954291614711104]
        ]);
        sph.delete();
        f.delete();
    });

    it('should subdivide to points on param on u and remove edge points and shift step', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUVOnParam({
            shape: f,
            nrPoints: 8,
            removeEndPoint: true,
            removeStartPoint: true,
            shiftHalfStep: true,
            param: 0.222,
            isU: true
        });
        expect(uvs.length).toBe(6);
        expect(uvs).toEqual([
            [1.3948671381938682, -0.8975979010256552],
            [1.3948671381938682, -0.4487989505128276],
            [1.3948671381938682, 0],
            [1.3948671381938682, 0.4487989505128276],
            [1.3948671381938682, 0.8975979010256552],
            [1.3948671381938682, 1.3463968515384828]
        ]);
        sph.delete();
        f.delete();
    });

    it('should subdivide to points on param on v and remove edge points and shift step', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUVOnParam({
            shape: f,
            nrPoints: 8,
            removeEndPoint: true,
            removeStartPoint: true,
            shiftHalfStep: true,
            param: 0.666,
            isU: false
        });
        expect(uvs.length).toBe(6);
        expect(uvs).toEqual([
            [1.3463968515384828, 0.5215043804959056],
            [2.243994752564138, 0.5215043804959056],
            [3.141592653589793, 0.5215043804959056],
            [4.039190554615448, 0.5215043804959056],
            [4.9367884556411035, 0.5215043804959056],
            [5.834386356666759, 0.5215043804959056]
        ]);
        sph.delete();
        f.delete();
    });

    it('should subdivide face into uvs', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUV({
            shape: f,
            nrDivisionsU: 5,
            nrDivisionsV: 6,
            removeEndEdgeU: false,
            removeEndEdgeV: false,
            removeStartEdgeU: false,
            removeStartEdgeV: false,
            shiftHalfStepU: false,
            shiftHalfStepV: false,
        });
        expect(uvs.length).toBe(30);
        expect(uvs).toEqual([
            [0, -1.5707963267948966],
            [0, -0.9424777960769379],
            [0, -0.3141592653589793],
            [0, 0.3141592653589793],
            [0, 0.9424777960769379],
            [0, 1.5707963267948966],
            [1.5707963267948966, -1.5707963267948966],
            [1.5707963267948966, -0.9424777960769379],
            [1.5707963267948966, -0.3141592653589793],
            [1.5707963267948966, 0.3141592653589793],
            [1.5707963267948966, 0.9424777960769379],
            [1.5707963267948966, 1.5707963267948966],
            [3.141592653589793, -1.5707963267948966],
            [3.141592653589793, -0.9424777960769379],
            [3.141592653589793, -0.3141592653589793],
            [3.141592653589793, 0.3141592653589793],
            [3.141592653589793, 0.9424777960769379],
            [3.141592653589793, 1.5707963267948966],
            [4.71238898038469, -1.5707963267948966],
            [4.71238898038469, -0.9424777960769379],
            [4.71238898038469, -0.3141592653589793],
            [4.71238898038469, 0.3141592653589793],
            [4.71238898038469, 0.9424777960769379],
            [4.71238898038469, 1.5707963267948966],
            [6.283185307179586, -1.5707963267948966],
            [6.283185307179586, -0.9424777960769379],
            [6.283185307179586, -0.3141592653589793],
            [6.283185307179586, 0.3141592653589793],
            [6.283185307179586, 0.9424777960769379],
            [6.283185307179586, 1.5707963267948966]
        ]);
        sph.delete();
        f.delete();
    });

    it('should subdivide face into uvs', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUV({
            shape: f,
            nrDivisionsU: 4,
            nrDivisionsV: 3,
            removeEndEdgeU: false,
            removeEndEdgeV: false,
            removeStartEdgeU: false,
            removeStartEdgeV: false,
            shiftHalfStepU: false,
            shiftHalfStepV: false,
        });
        expect(uvs.length).toBe(12);
        expect(uvs).toEqual([
            [0, -1.5707963267948966],
            [0, 0],
            [0, 1.5707963267948966],
            [2.0943951023931953, -1.5707963267948966],
            [2.0943951023931953, 0],
            [2.0943951023931953, 1.5707963267948966],
            [4.1887902047863905, -1.5707963267948966],
            [4.1887902047863905, 0],
            [4.1887902047863905, 1.5707963267948966],
            [6.283185307179586, -1.5707963267948966],
            [6.283185307179586, 0],
            [6.283185307179586, 1.5707963267948966]
        ]);
        sph.delete();
        f.delete();
    });


    it('should subdivide face into uvs remove end and start edges and shift half step both on u and v', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUV({
            shape: f,
            nrDivisionsU: 6,
            nrDivisionsV: 5,
            removeEndEdgeU: true,
            removeEndEdgeV: true,
            removeStartEdgeU: true,
            removeStartEdgeV: true,
            shiftHalfStepU: true,
            shiftHalfStepV: true,
        });
        expect(uvs.length).toBe(12);
        expect(uvs).toEqual([
            [1.8849555921538759, -0.39269908169872414],
            [1.8849555921538759, 0.39269908169872414],
            [1.8849555921538759, 1.1780972450961724],
            [3.141592653589793, -0.39269908169872414],
            [3.141592653589793, 0.39269908169872414],
            [3.141592653589793, 1.1780972450961724],
            [4.39822971502571, -0.39269908169872414],
            [4.39822971502571, 0.39269908169872414],
            [4.39822971502571, 1.1780972450961724],
            [5.654866776461628, -0.39269908169872414],
            [5.654866776461628, 0.39269908169872414],
            [5.654866776461628, 1.1780972450961724]
        ]);
        sph.delete();
        f.delete();
    });

    it('should get uv on face', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uv = face.uvOnFace({ shape: f, paramU: 0.2, paramV: 0.3 });
        expect(uv.length).toBe(2);
        expect(uv).toEqual([
            1.2566370614359172, -0.6283185307179586
        ])
        sph.delete();
        f.delete();
    });

    it('should get points on uvs', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const points = face.pointsOnUVs({ shape: f, paramsUV: [[0.2, 0.3], [0, 0], [0.5, 0.4]] });
        expect(points.length).toBe(3);
        expect(points).toEqual([
            [1.5388417685876268, -1.1755705045849463, 0.5000000000000001],
            [0, -2, 1.2246467991473532e-16],
            [2.3294166369781847e-16, -0.6180339887498948, -1.902113032590307]
        ])
        sph.delete();
        f.delete();
    });


    it('should get normals on uvs', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const normals = face.normalsOnUVs({ shape: f, paramsUV: [[0.2, 0.3], [0, 0], [0.5, 0.4]] });
        expect(normals.length).toBe(3);
        expect(normals).toEqual([
            [0.7694208842938133, -0.5877852522924731, 0.25000000000000006],
            [0, -1, 1.2246467991473532e-16],
            [1.1647083184890923e-16, -0.3090169943749474, -0.9510565162951536]
        ])
        sph.delete();
        f.delete();
    });

    it('should get point on uv', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const point = face.pointOnUV({ shape: f, paramU: 0.2, paramV: 0.3 });
        expect(point.length).toBe(3);
        expect(point).toEqual([1.5388417685876268, -1.1755705045849463, 0.5000000000000001])
        sph.delete();
        f.delete();
    });

    it('should get normal on uv', () => {
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const normal = face.normalOnUV({ shape: f, paramU: 0.2, paramV: 0.3 });
        expect(normal.length).toBe(3);
        expect(normal).toEqual([0.7694208842938133, -0.5877852522924731, 0.25000000000000006])
        sph.delete();
        f.delete();
    });

    it('should create polygon face', () => {
        const f = face.createPolygonFace({ points: [[0, 0, 0], [1, 0, -2], [1, 0, 0], [0, 0, 1]] });
        const area = face.getFaceArea({ shape: f });
        expect(area).toBe(1.5);
        f.delete();
    });

    it('should create ellipse face', () => {
        const f = face.createEllipseFace({ center: [0, 0, 0], radiusMinor: 1, radiusMajor: 2, direction: [0, 1, 0] });
        const area = face.getFaceArea({ shape: f });
        expect(area).toBe(6.283185307179584);
        f.delete();
    });

    it('should not create ellipse face when radius major is smaller then minor', () => {
        expect(() => face.createEllipseFace({ center: [0, 0, 0], radiusMinor: 2, radiusMajor: 1, direction: [0, 1, 0] }))
            .toThrowError('Ellipse could not be created');
    });

    it('should create square face', () => {
        const f = face.createSquareFace({ center: [0, 0, 0], size: 2, direction: [0, 1, 0] });
        const area = face.getFaceArea({ shape: f });
        expect(area).toBe(4);
        f.delete();
    });

    it('should not get a face of a shape that does not have faces', async () => {
        const d = occHelper.lineEdge({ start: [0, 0, 0], end: [1, 1, 1] });
        expect(() => face.getFace({ shape: d, index: 22 })).toThrowError('Shape is not provided or is of incorrect type');
        d.delete();
    });

    it('should not get a face of a shape that does not have particular index', async () => {
        const b = occHelper.bRepPrimAPIMakeBox(1, 1, 1, [0, 0, 0]);
        expect(() => face.getFace({ shape: b, index: 22 })).toThrowError('Face index is out of range');
        b.delete();
    });

    it('should not get a face of a shape that does not have particular index', async () => {
        const b = occHelper.bRepPrimAPIMakeBox(1, 1, 1, [0, 0, 0]);
        expect(() => face.getFace({ shape: b, index: -22 })).toThrowError('Face index is out of range');
        b.delete();
    });

    it('should get faces', async () => {
        const b = occHelper.bRepPrimAPIMakeBox(1, 1, 1, [0, 0, 0]);
        const faces = face.getFaces({ shape: b });
        expect(faces.length).toBe(6);
        b.delete();
        faces.forEach(f => f.delete());
    });

    it('should reverse a face', async () => {
        const f = face.createRectangleFace({ center: [0, 0, 0], width: 2, length: 1, direction: [0, 1, 0] });
        const w = wire.getWire({ shape: f, index: 0 });
        const fr = face.reversedFace({ shape: f });
        const wr = wire.getWire({ shape: fr, index: 0 });
        const pt1 = wire.pointOnWireAtLength({ shape: w, length: 0.1 });
        const pt2 = wire.pointOnWireAtLength({ shape: wr, length: 0.1 });
        expect(pt1).not.toEqual(pt2);
        f.delete();
        fr.delete();
        w.delete();
        wr.delete();
    });

    it('should get faces areas', async () => {
        const f1 = face.createRectangleFace({ center: [0, 0, 0], width: 2, length: 1, direction: [0, 1, 0] });
        const f2 = face.createCircleFace({ radius: 3, center: [0, 0, 0], direction: [0, 0, 1] });
        const areas = face.getFacesAreas({ shapes: [f1, f2] });
        expect(areas.length).toBe(2);
        expect(areas[0]).toBe(2);
        expect(areas[1]).toBe(28.274333882308138);
        f1.delete();
        f2.delete();
    });

    it('should get faces centers of mass', async () => {
        const f1 = face.createRectangleFace({ center: [0, 1, 0], width: 2, length: 1, direction: [0, 1, 0] });
        const f2 = face.createCircleFace({ radius: 3, center: [0, 3, 3], direction: [0, 0, 1] });
        const centers = face.getFacesCentersOfMass({ shapes: [f1, f2] });
        expect(centers).toEqual([
            [2.0816681711721685e-17, 1, -8.023096076392733e-18],
            [4.440892098500626e-16, 2.9999999999999996, 3]
        ]);
        f1.delete();
        f2.delete();
    });


    it('should get face center of mass', async () => {
        const f1 = face.createRectangleFace({ center: [0, 1, 0], width: 2, length: 1, direction: [0, 1, 0] });
        const center = face.getFaceCenterOfMass({ shape: f1 });
        expect(center).toEqual(
            [2.0816681711721685e-17, 1, -8.023096076392733e-18],
        );
        f1.delete();
    });
});
