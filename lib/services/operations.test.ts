import initOpenCascade, { OpenCascadeInstance } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { Base } from "../api/inputs/base-inputs";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { VectorHelperService } from "../api/vector-helper.service";
import { OccHelper } from "../occ-helper";
import { OCCTOperations } from "./operations";

describe("OCCT operations unit tests", () => {
    let occt: OpenCascadeInstance;
    let operations: OCCTOperations;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        operations = new OCCTOperations(occt, occHelper);
    });

    it("should get two closest points between two shapes", async () => {
        const sph1 = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 1);
        const sph2 = occHelper.bRepPrimAPIMakeSphere([3, 3, 3], [0, 1, 0], 1);
        const res = operations.closestPointsBetweenTwoShapes({ shapes: [sph1, sph2] });
        expect(res.length).toBe(2);
        expect(res).toEqual([
            [0.5773398570788231, 0.577340634175626, 0.5773703157921182],
            [2.4226416164327524, 2.4226611251606816, 2.4226464510164636]
        ]);
    });

    it("should get five closest points between a shape and a collection of points", async () => {
        const points = [
            [0, 2, 0],
            [1, 1, 1],
            [2, -2, 2],
            [-3, 3, 3],
            [4, 4, -4],
        ] as Base.Point3[];
        const sph = occHelper.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 1);
        const res = operations.closestPointsOnShapeFromPoints({ shape: sph, points });
        expect(res.length).toBe(5);
        expect(res).toEqual([
            [-1.4997597826618576e-32, 1, 6.123233995736766e-17],
            [0.5773502691896258, 0.5773502691896257, 0.5773502691896257],
            [0.5773502691896258, -0.5773502691896257, 0.5773502691896257],
            [-0.5773502691896258, 0.5773502691896257, 0.5773502691896256],
            [0.5773502691896258, 0.5773502691896257, -0.5773502691896257]
        ]);
    });

    it("should get ten closest points between two shape and a collection of points", async () => {
        const points = [
            [0, 2, 0],
            [1, 1, 1],
            [2, -2, 2],
            [-3, 3, 3],
            [4, 4, -4],
        ] as Base.Point3[];
        const sph1 = occHelper.bRepPrimAPIMakeSphere([0, 10, 0], [0, 1, 0], 1);
        const sph2 = occHelper.bRepPrimAPIMakeSphere([0, 0, 10], [0, 1, 0], 2);

        const res = operations.closestPointsOnShapesFromPoints({ shapes: [sph1, sph2], points });
        expect(res.length).toBe(10);
        expect(res).toEqual(
            [
                [ -1.4997597826618576e-32, 9, 6.123233995736766e-17 ],
                [ 0.1097642599896904, 9.012121660092786, 0.10976425998969039 ],
                [ 0.1622214211307626, 9.026671473215425, 0.16222142113076257 ],
                [ -0.3665083330689157, 9.144813889505864, 0.36650833306891556 ],
                [ 0.48507125007266594, 9.272393124891002, -0.4850712500726658 ],
                [ 2.4017299715812683e-16, 0.3922322702763681, 8.03883864861816 ],
                [ 0.21952851997938053, 0.21952851997938067, 8.024243320185574 ],
                [ 0.471404520791032, -0.47140452079103173, 8.114381916835873 ],
                [ -0.733016666137831, 0.7330166661378313, 8.289627779011727 ],
                [ 0.5298129428260179, 0.5298129428260177, 8.145654700108938 ]
            ]
        );
    });
});

