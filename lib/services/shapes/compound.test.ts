import initOpenCascade, { OpenCascadeInstance } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper, shapeTypeEnum } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTSolid } from "./solid";
import { OCCTCompound } from "./compound";

describe("OCCT compound unit tests", () => {
    let occt: OpenCascadeInstance;
    let solid: OCCTSolid;
    let compound: OCCTCompound;
    let occHelper: OccHelper

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        solid = new OCCTSolid(occt, occHelper);
        compound = new OCCTCompound(occt, occHelper);
    });

    it("should compound any shapes", async () => {
        const box = solid.createBox({ width: 2, height: 2, length: 2, center: [0, 0, 0] });
        const cylinder = solid.createCylinder({ radius: 2, height: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const c = compound.makeCompound({ shapes: [box, cylinder] });
        expect(c).toBeDefined();
        expect(occHelper.getShapeTypeEnum(c)).toBe(shapeTypeEnum.compound);
        box.delete();
        cylinder.delete();
    });

});
