import initOpenCascade, { OpenCascadeInstance, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { Inputs } from "../api";
import { OCCTFillets } from "./fillets";
import { OCCTWire } from "./shapes";

describe("OCCT fillets unit tests", () => {
    let occt: OpenCascadeInstance;
    let wire: OCCTWire;
    let fillets: OCCTFillets;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();

        occHelper = new OccHelper(vec, s, occt);
        wire = new OCCTWire(occt, occHelper);
        fillets = new OCCTFillets(occt, occHelper);
    });

    it("should fillet closed 3D wire on various corners", () => {
        const starOpt = new Inputs.OCCT.StarDto(10, 6, 7, [0, 0, 0], [0, 1, 0], 3);
        const star = wire.createStarWire(starOpt);
        const filletOptions = new Inputs.OCCT.Fillet3DWireDto<TopoDS_Wire>(
            star,
            undefined,
            [0, 1, 0],
            [0.4, 0.2, 0.5, 0.3, 0.6],
            [1, 2, 3, 4, 5],
        );
        const result = fillets.fillet3DWire(filletOptions);
        const edges = occHelper.getEdgesAlongWire({ shape: result });
        const edgeLengths = edges.map(e => occHelper.getEdgeLength({ shape: e }));
        expect(edgeLengths).toEqual([
            5.3481464663832385, 0.44755930960454227,
            5.268367175439688, 0.6392454970881697,
            5.065399912120434, 0.6713389644068103,
            4.985620621176884, 0.7670945965058046,
            5.594522411134649, 6.073198156795948,
            6.073198156795948, 6.073198156795948,
            6.073198156795948, 6.073198156795949,
            6.073198156795948, 6.073198156795948,
            6.073198156795948, 5.7540809930217485,
            0.511396397670537
        ]);
        expect(edgeLengths[1]).toBeLessThan(1);
        expect(edgeLengths[3]).toBeLessThan(1);
        expect(edgeLengths[5]).toBeLessThan(1);
        expect(edgeLengths[7]).toBeLessThan(1);
        expect(edgeLengths[18]).toBeLessThan(1);
    });

    it("should fillet closed 3D wire", () => {
        const starOpt = new Inputs.OCCT.StarDto(10, 6, 7, [0, 0, 0], [0, 1, 0], 3);
        const star = wire.createStarWire(starOpt);
        const filletOptions = new Inputs.OCCT.Fillet3DWireDto<TopoDS_Wire>(
            star,
            undefined,
            [0, 1, 0],
            [0.3, 0.2, 0.3, 0.3, 0.3],
            [4, 7, 8, 9, 12],
        );
        const result = fillets.fillet3DWire(filletOptions);
        const edges = occHelper.getEdgesAlongWire({ shape: result });
        const edgeLengths = edges.map(e => occHelper.getEdgeLength({ shape: e }));
        expect(edgeLengths).toEqual([
            5.464296366838181, 0.6713389644068103,
            5.464296366838182, 6.073198156795947,
            5.913639574908848, 0.2556981988352673,
            5.304737784951084, 0.6713389644068118,
            5.224958494007533, 0.38354729825290185,
            5.8338602839653, 6.073198156795949,
            5.46429636683818, 0.6713389644068125,
            5.46429636683818, 6.073198156795948,
            6.073198156795948, 6.073198156795948,
            6.073198156795948
        ]);

        expect(edgeLengths[1]).toBeLessThan(1);
        expect(edgeLengths[5]).toBeLessThan(1);
        expect(edgeLengths[7]).toBeLessThan(1);
        expect(edgeLengths[9]).toBeLessThan(1);
        expect(edgeLengths[13]).toBeLessThan(1);
    });

    it("should fillet open 3D wire", () => {
        const starOpt = new Inputs.OCCT.StarDto(10, 6, 7, [0, 0, 0], [0, 1, 0], 3);
        const star = wire.createStarWire(starOpt);

        const edgesStar = occHelper.getEdges({ shape: star });
        edgesStar.pop();
        const wireStarOpen = occHelper.combineEdgesAndWiresIntoAWire({ shapes: edgesStar });

        const filletOptions = new Inputs.OCCT.Fillet3DWireDto<TopoDS_Wire>(
            wireStarOpen,
            undefined,
            [0, 1, 0],
            [0.4, 0.2, 0.5, 0.3, 0.6],
            [1, 2, 3, 4, 5],
        );
        const result = fillets.fillet3DWire(filletOptions);
        const edges = occHelper.getEdges({ shape: result });
        const edgeLengths = edges.map(e => occHelper.getEdgeLength({ shape: e }));
        expect(edgeLengths).toEqual([
            5.7540809930217485, 0.5113963976705357,
            5.3481464663832385, 0.44755930960454227,
            5.268367175439688, 0.6392454970881697,
            5.065399912120434, 0.6713389644068103,
            4.985620621176884, 0.7670945965058046,
            5.594522411134649, 6.073198156795948,
            6.073198156795948, 6.073198156795948,
            6.073198156795948, 6.073198156795949,
            6.073198156795948, 6.073198156795948
        ]);
        expect(edgeLengths[1]).toBeLessThan(1);
        expect(edgeLengths[3]).toBeLessThan(1);
        expect(edgeLengths[5]).toBeLessThan(1);
        expect(edgeLengths[7]).toBeLessThan(1);
        expect(edgeLengths[9]).toBeLessThan(1);
    });

    it("should fillet closed 2D wire on various corners", () => {
        const starOpt = new Inputs.OCCT.StarDto(10, 6, 7, [0, 0, 0], [0, 1, 0], 0);
        const star = wire.createStarWire(starOpt);
        const filletOptions = new Inputs.OCCT.FilletDto<TopoDS_Wire>(
            star,
            undefined,
            [0.4, 0.2, 0.5, 0.3, 0.6],
            [4, 6, 7, 8, 13],
        );
        const result = fillets.fillet2d(filletOptions);
        const edges = occHelper.getEdgesAlongWire({ shape: result });
        const edgeLengths = edges.map(e => occHelper.getEdgeLength({ shape: e }));
        console.log(edgeLengths);
        expect(edgeLengths).toEqual([
            5.280505264812232, 5.280505264812232,
            5.280505264812232, 4.574603909466177,
            0.8442070927826265, 4.574603909466179,
            4.927554587139205, 0.4221035463913136,
            4.580723350141781, 0.6064599154654552,
            4.404248011305268, 0.6331553195869692,
            4.75107924830269, 5.280505264812232,
            5.280505264812233, 5.280505264812232,
            4.864307780415325, 0.7277518985585464,
            4.864307780415325
        ]);
        expect(edgeLengths[4]).toBeLessThan(1);
        expect(edgeLengths[7]).toBeLessThan(1);
        expect(edgeLengths[9]).toBeLessThan(1);
        expect(edgeLengths[11]).toBeLessThan(1);
        expect(edgeLengths[17]).toBeLessThan(1);
    });

    it("should fillet open 2D wire", () => {
        const starOpt = new Inputs.OCCT.StarDto(10, 6, 7, [0, 0, 0], [0, 1, 0], 0);
        const star = wire.createStarWire(starOpt);

        const edgesStar = occHelper.getEdges({ shape: star });
        edgesStar.pop();
        const wireStarOpen = occHelper.combineEdgesAndWiresIntoAWire({ shapes: edgesStar });

        const filletOptions = new Inputs.OCCT.FilletDto<TopoDS_Wire>(
            wireStarOpen,
            undefined,
            [0.4, 0.2, 0.5, 0.3, 0.6],
            [1, 2, 3, 4, 5],
        );
        const result = fillets.fillet2d(filletOptions);
        const edges = occHelper.getEdges({ shape: result });
        const edgeLengths = edges.map(e => occHelper.getEdgeLength({ shape: e }));
        expect(edgeLengths).toEqual([
            5.0030402752142935, 0.48516793237236433,
            4.650089597541265, 0.42210354639131314,
            4.58072335014178, 0.6064599154654553,
            4.4042480113052696, 0.6331553195869704,
            4.334881763905784, 0.727751898558546,
            4.864307780415325, 5.280505264812232,
            5.280505264812232, 5.280505264812232,
            5.280505264812232, 5.280505264812233,
            5.280505264812232, 5.280505264812232
        ]);
        expect(edgeLengths[1]).toBeLessThan(1);
        expect(edgeLengths[3]).toBeLessThan(1);
        expect(edgeLengths[5]).toBeLessThan(1);
        expect(edgeLengths[7]).toBeLessThan(1);
        expect(edgeLengths[9]).toBeLessThan(1);
    });
});


