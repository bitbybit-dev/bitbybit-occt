import initOpenCascade, { OpenCascadeInstance, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { VectorHelperService } from "../api/vector-helper.service";
import { OccHelper } from "../occ-helper";
import { OCCTGeom } from "./geom/geom";
import { OCCTOperations } from "./operations";
import { OCCTFace } from "./shapes/face";
import { OCCTWire } from "./shapes/wire";

describe('OCCT operations unit tests', () => {
    let occt: OpenCascadeInstance;
    let wire: OCCTWire;
    let face: OCCTFace;
    let geom: OCCTGeom;
    let operations: OCCTOperations;
    let occHelper: OccHelper

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        wire = new OCCTWire(occt, occHelper);
        face = new OCCTFace(occt, occHelper);
        geom = new OCCTGeom(occt, occHelper);
        operations = new OCCTOperations(occt, occHelper);
    });

    it('should get two closest points between two shapes', async () => {
        const sph1 = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 1);
        const sph2 = occHelper.bRepPrimAPIMakeSphere([3, 3, 3], [0, 1, 0], 1);
        const res = operations.closestPointsBetweenTwoShapes({ shapes: [sph1, sph2] });
        expect(res.length).toBe(2);
        expect(res).toEqual([
            [0.5773398570788231, 0.577340634175626, 0.5773703157921182],
            [2.4226416164327524, 2.4226611251606816, 2.4226464510164636]
        ]);
    });
});

