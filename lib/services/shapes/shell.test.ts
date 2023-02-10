import initOpenCascade, { OpenCascadeInstance, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper, shapeTypeEnum } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTFace } from "./face";
import { OCCTGeom } from "../geom/geom";
import { OCCTShell } from "./shell";

describe('OCCT shell unit tests', () => {
    let occt: OpenCascadeInstance;
    let face: OCCTFace;
    let shell: OCCTShell;
    let geom: OCCTGeom;
    let occHelper: OccHelper

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        face = new OCCTFace(occt, occHelper);
        shell = new OCCTShell(occt, occHelper);
        geom = new OCCTGeom(occt, occHelper);
    });

    it('should create a shell from two faces', async () => {
        const f1 = face.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const f2 = face.createSquareFace({ size: 1, center: [0, 0, 1], direction: [0, 1, 0] });
        const s = shell.sewFaces({ shapes: [f1, f2], tolerance: 1e-7 });
        const area = shell.getShellSurfaceArea({ shape: s });
        expect(occHelper.getShapeTypeEnum(s)).toBe(shapeTypeEnum.shell);
        expect(area).toBe(2);
        f1.delete();
        f2.delete();
        s.delete();
    });

    it('should check if the shell is closed', async () => {
        const f1 = face.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const f2 = face.createSquareFace({ size: 1, center: [0, 0, 1], direction: [0, 1, 0] });
        const s = shell.sewFaces({ shapes: [f1, f2], tolerance: 1e-7 });
        expect(shell.isClosed({ shape: s })).toBe(false);
        f1.delete();
        f2.delete();
        s.delete();
    });

    it('should create a compound shape rather than shell from two faces if tolerance is not picking the edge to form a unified shell', async () => {
        const f1 = face.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const f2 = face.createSquareFace({ size: 1, center: [0, 0, 1.6], direction: [0, 1, 0] });
        const s = shell.sewFaces({ shapes: [f1, f2], tolerance: 1e-7 });
        const area = shell.getShellSurfaceArea({ shape: s });
        expect(occHelper.getShapeTypeEnum(s)).toBe(shapeTypeEnum.compound);
        expect(area).toBe(2);
        f1.delete();
        f2.delete();
        s.delete();
    });

    it('should create a compound shape rather than shell from two faces if tolerance is just a bit off', async () => {
        const f1 = face.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const f2 = face.createSquareFace({ size: 1, center: [0, 0, 1 + 1e-7], direction: [0, 1, 0] });
        const s = shell.sewFaces({ shapes: [f1, f2], tolerance: 1e-7 });
        const area = shell.getShellSurfaceArea({ shape: s });
        expect(occHelper.getShapeTypeEnum(s)).toBe(shapeTypeEnum.compound);
        expect(area).toBe(2);
        f1.delete();
        f2.delete();
        s.delete();
    });

    it('should check if the shell is closed', async () => {
        const f1 = face.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const f2 = face.createSquareFace({ size: 1, center: [0, 0, 1], direction: [0, 1, 0] });
        const s = shell.sewFaces({ shapes: [f1, f2], tolerance: 1e-7 });
        expect(shell.isClosed({ shape: s })).toBe(false);
        f1.delete();
        f2.delete();
        s.delete();
    });

    it('should recreate a closed shell if sewing all edges of the box', async () => {
        const box = occHelper.bRepPrimAPIMakeBox(2, 2, 2, [0, 0, 0]);
        const faces = face.getFaces({shape: box});
        const s = shell.sewFaces({ shapes: faces, tolerance: 1e-7 });
        expect(shell.isClosed({ shape: s })).toBe(true);
        box.delete();
        s.delete();
        faces.forEach(f => f.delete());
    });

});
