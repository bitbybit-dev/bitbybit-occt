import initOpenCascade, { OpenCascadeInstance, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper, shapeTypeEnum } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTFace } from "./face";
import { OCCTShell } from "./shell";
import { OCCTSolid } from "./solid";

describe('OCCT solid unit tests', () => {
    let occt: OpenCascadeInstance;
    let face: OCCTFace;
    let shell: OCCTShell;
    let solid: OCCTSolid;
    let occHelper: OccHelper

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        face = new OCCTFace(occt, occHelper);
        shell = new OCCTShell(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
    });

    it('should recreate a solid from closed shell if sewing all edges of the box', async () => {
        const box = occHelper.bRepPrimAPIMakeBox(2, 2, 2, [0, 0, 0]);
        const faces = face.getFaces({shape: box});
        const s = shell.sewFaces({ shapes: faces, tolerance: 1e-7 });
        const so = solid.fromClosedShell({shape: s});
        expect(occHelper.getShapeTypeEnum(so)).toBe(shapeTypeEnum.solid);
        expect(solid.getSolidVolume({shape: so})).toBeCloseTo(8);
        box.delete();
        s.delete();
        faces.forEach(f => f.delete());
        so.delete();
    });

});
