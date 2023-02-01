import initOpenCascade, { OpenCascadeInstance, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTEdge } from "./edge";
import { OccHelper } from "../../occ-helper";
import { OCCTWire } from "./wire";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTFace } from "./face";
import { OCCTGeom } from "../geom/geom";

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
        const area = face.getFaceArea({ shape: f }).result;
        expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.TopAbs_FACE);
        expect(area).toBeCloseTo(28.274333882308138);
        w.delete();
        f.delete();
    });

    it('should create a face from closed non-planar wire', async () => {
        const w = wire.interpolatePoints({ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], periodic: true, tolerance: 1e-7 });
        const f = face.createFaceFromWire({ shape: w, planar: false });
        const area = face.getFaceArea({ shape: f }).result;
        expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.TopAbs_FACE);
        expect(area).toBeCloseTo(1.5999655130076433);
        w.delete();
        f.delete();
    });

    it('should not create a good face from open non-planar wire', async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], closed: false });
        const f = face.createFaceFromWire({ shape: w, planar: false });
        const area = face.getFaceArea({ shape: f }).result;
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
        const area1 = face.getFaceArea({ shape: f[0] }).result;
        const area2 = face.getFaceArea({ shape: f[1] }).result;
        expect(area1).toBeCloseTo(28.274333882308138);
        expect(area2).toBeCloseTo(12.566370614359167);
        w1.delete();
        w2.delete();
        f.forEach(s => s.delete());
    });

    it('should create an infinite face from surface', async () => {
        const srf = geom.surfaces.cylindricalSurface({ radius: 3, center: [0, 0, 0], direction: [0, 0, 1] });
        const f = face.faceFromSurface({ shape: srf, tolerance: 1e-7 });
        const area = face.getFaceArea({ shape: f }).result;
        expect(area).toBeCloseTo(2e+100);
    });

    it('should create an face from surface and wire', async () => {
        const f1 = face.createCircleFace({ radius: 3, center: [0, 0, 0], direction: [0, 0, 1] });
        const srf = geom.surfaces.surfaceFromFace({ shape: f1 });
        const w = wire.createCircleWire({ radius: 2, center: [0, 0, 1], direction: [0, 0, 1] });
        const f = face.faceFromSurfaceAndWire({ shapes: [srf, w], inside: true });
        const area = face.getFaceArea({ shape: f }).result;
        expect(area).toBeCloseTo(12.566370614359167);
    });

    it('should get u min bound', () => {
        const f = face.createRectangleFace({ width: 1, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const uMin = face.getUMinBound({ shape: f }).result;
        expect(uMin).toBe(-1);
    });

    it('should get u max bound', () => {
        const f = face.createRectangleFace({ width: 1, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const uMax = face.getUMaxBound({ shape: f }).result;
        expect(uMax).toBe(1);
    });

    it('should get v min bound', () => {
        const f = face.createRectangleFace({ width: 1, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const vMin = face.getVMinBound({ shape: f }).result;
        expect(vMin).toBe(-0.5);
    });

    it('should get v max bound', () => {
        const f = face.createRectangleFace({ width: 1, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const vMax = face.getVMaxBound({ shape: f }).result;
        expect(vMax).toBe(0.5);
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
        }).result;
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
        ])
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
        }).result;
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
        ])
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
        }).result;
        expect(pts.length).toBe(6);
        expect(pts).toEqual([
            [1.4142135623730951, -4.440892098500626e-16, -1.414213562373095],
            [0.707106781186548, 1.732050807568877, -0.7071067811865479],
            [-1.414213562373095, -4.440892098500626e-16, -1.4142135623730954],
            [-0.7071067811865479, 1.732050807568877, -0.7071067811865481],
            [-1.4142135623730954, -4.440892098500626e-16, 1.4142135623730947],
            [-0.7071067811865481, 1.732050807568877, 0.7071067811865478]
        ])
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
        }).result;
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
        }).result;
        expect(normals.length).toBe(6);
        expect(normals).toEqual([
            [0.7071067811865476, -2.220446049250313e-16, -0.7071067811865475],
            [0.353553390593274, 0.8660254037844385, -0.35355339059327395],
            [-0.7071067811865475, -2.220446049250313e-16, -0.7071067811865477],
            [-0.35355339059327384, 0.8660254037844385, -0.35355339059327395],
            [-0.7071067811865477, -2.220446049250313e-16, 0.7071067811865474],
            [-0.35355339059327406, 0.8660254037844385, 0.3535533905932739]
        ])
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
        }).result;
        expect(points.length).toBe(4);
        expect(points).toEqual([
            [1.1647083184890923e-16, -2, 3.7843667304341506e-17],
            [1.6472782070926637, -1, 0.535233134659635],
            [1.647278207092664, 0.9999999999999997, 0.535233134659635],
            [1.1647083184890923e-16, 2, 3.7843667304341506e-17]
        ]);
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
        }).result;
        expect(points.length).toBe(4);
        expect(points).toEqual([
            [0, 0, 2],
            [1.7320508075688774, 0, -0.9999999999999996],
            [-1.732050807568877, 0, -1.0000000000000009],
            [-4.898587196589413e-16, 0, 2]
        ]);
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
        }).result;
        expect(points.length).toBe(5);
        expect(points).toEqual([
            [1.618033988749895, -1.1755705045849463, 9.907600726170916e-17],
            [0.809016994374948, -1.1755705045849463, -1.4012585384440732],
            [-0.809016994374947, -1.1755705045849463, -1.4012585384440739],
            [-1.618033988749895, -1.1755705045849463, -2.9722802178512745e-16],
            [-0.8090169943749481, -1.1755705045849463, 1.4012585384440732]
        ]);
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
        }).result;
        expect(points.length).toBe(5);
        expect(points).toEqual([
            [1.3449970239279145, -1.4142135623730951, -0.43701602444882093],
            [1.8373001026999978, -0.5176380902050418, -0.5969749912579707],
            [1.837300102699998, 0.5176380902050414, -0.5969749912579708],
            [1.344997023927915, 1.4142135623730947, -0.43701602444882104],
            [0.49230307877208407, 1.9318516525781364, -0.15995896680915006]
        ]);
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
        }).result;
        expect(uvs.length).toBe(4);
        expect(uvs).toEqual([
            [1.2566370614359172, -1.5707963267948966],
            [1.2566370614359172, -0.5235987755982989],
            [1.2566370614359172, 0.5235987755982987],
            [1.2566370614359172, 1.5707963267948966]
        ]);
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
        }).result;
        expect(uvs.length).toBe(4);
        expect(uvs).toEqual([
            [2.1507343306475724, -1.5707963267948966],
            [2.1507343306475724, -0.5235987755982989],
            [2.1507343306475724, 0.5235987755982987],
            [2.1507343306475724, 1.5707963267948966]
        ]);
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
        }).result;
        expect(uvs.length).toBe(4);
        expect(uvs).toEqual([
            [0, -0.4954291614711104],
            [2.0943951023931953, -0.4954291614711104],
            [4.1887902047863905, -0.4954291614711104],
            [6.283185307179586, -0.4954291614711104]
        ]);
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
        }).result;
        expect(uvs.length).toBe(6);
        expect(uvs).toEqual([
            [1.3948671381938682, -0.8975979010256552],
            [1.3948671381938682, -0.4487989505128276],
            [1.3948671381938682, 0],
            [1.3948671381938682, 0.4487989505128276],
            [1.3948671381938682, 0.8975979010256552],
            [1.3948671381938682, 1.3463968515384828]
        ]);
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
        }).result;
        expect(uvs.length).toBe(6);
        expect(uvs).toEqual([
            [ 1.3463968515384828, 0.5215043804959056 ],
            [ 2.243994752564138, 0.5215043804959056 ],
            [ 3.141592653589793, 0.5215043804959056 ],
            [ 4.039190554615448, 0.5215043804959056 ],
            [ 4.9367884556411035, 0.5215043804959056 ],
            [ 5.834386356666759, 0.5215043804959056 ]
        ]);
    });



});

