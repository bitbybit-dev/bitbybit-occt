import {OCCT} from "./occ-inputs";

describe("OCC Inputs", () => {
    test("FilletTwoEdgesInPlaneDto - defaults", ()=>{
        const cDto = new OCCT.FilletTwoEdgesInPlaneDto();

        expect(cDto.edge1).toBeUndefined();
        expect(cDto.edge2).toBeUndefined();
        expect(cDto.planeOrigin).toMatchObject([0, 0, 0]);
        expect(cDto.planeDirection).toMatchObject([0, 1, 0]);
        expect(cDto.radius).toBe(0.3);
        expect(cDto.solution).toBe(-1);
    });

    test("FilletTwoEdgesInPlaneDto - passing arguments", ()=>{
        const cDto = new OCCT.FilletTwoEdgesInPlaneDto([1,2], [0,0,1], [1,0,0], 2.7, 5);

        expect(cDto.edge1).toBe(1);
        expect(cDto.edge2).toBe(2);
        expect(cDto.planeOrigin).toMatchObject([0, 0, 1]);
        expect(cDto.planeDirection).toMatchObject([1, 0, 0]);
        expect(cDto.radius).toBe(2.7);
        expect(cDto.solution).toBe(5);
    });

    test("ClosestPointsOnShapesFromPointsDto - defaults", ()=>{
        const cDto = new OCCT.ClosestPointsOnShapesFromPointsDto();

        expect(cDto.shapes).toBeUndefined();
        expect(cDto.points).toBeUndefined();
    });

    test("ClosestPointsOnShapesFromPointsDto - passing arguments", ()=>{
        const cDto = new OCCT.ClosestPointsOnShapesFromPointsDto([1,2], [[0,0,0],[0,1,2]]);

        expect(cDto.shapes).toHaveLength(2);
        expect(cDto.points).toHaveLength(2);
    });

    test("ClosestPointsBetweenTwoShapesDto - defaults", ()=>{
        const cDto = new OCCT.ClosestPointsBetweenTwoShapesDto();

        expect(cDto.shapes).toBeUndefined();
        expect(cDto.shape1).toBeUndefined();
        expect(cDto.shape2).toBeUndefined();
    });

    test("ClosestPointsBetweenTwoShapesDto - passing arguments", ()=>{
        const cDto = new OCCT.ClosestPointsBetweenTwoShapesDto(1,1);

        expect(cDto.shapes).toBeDefined();
        expect(cDto.shape1).toBeDefined();
        expect(cDto.shape2).toBeDefined();
    });

    test("FaceFromSurfaceAndWireDto - defaults", ()=>{
        const cDto = new OCCT.FaceFromSurfaceAndWireDto();

        expect(cDto.shapes).toBeUndefined();
        expect(cDto.surface).toBeUndefined();
        expect(cDto.wire).toBeUndefined();
        expect(cDto.inside).toBeTruthy();
    });

    test("FaceFromSurfaceAndWireDto - passing arguments", ()=>{
        const cDto = new OCCT.FaceFromSurfaceAndWireDto(1, 2, false);

        expect(cDto.shapes).toBeDefined();
        expect(cDto.surface).toBeDefined();
        expect(cDto.wire).toBeDefined();
        expect(cDto.inside).toBeFalsy();
    });

    test("EdgeFromGeom2dCurveAndSurfaceDto - defaults", ()=>{
        const cDto = new OCCT.EdgeFromGeom2dCurveAndSurfaceDto();

        expect(cDto.shapes).toBeUndefined();
        expect(cDto.surface).toBeUndefined();
        expect(cDto.curve).toBeUndefined();
    });

    test("EdgeFromGeom2dCurveAndSurfaceDto - passing arguments", ()=>{
        const cDto = new OCCT.EdgeFromGeom2dCurveAndSurfaceDto(1, 2);

        expect(cDto.shapes).toBeDefined();
        expect(cDto.surface).toBeDefined();
        expect(cDto.curve).toBeDefined();
    });

    test("WireOnFaceDto - defaults", ()=>{
        const cDto = new OCCT.WireOnFaceDto();

        expect(cDto.shapes).toBeUndefined();
        expect(cDto.wire).toBeUndefined();
        expect(cDto.face).toBeUndefined();
    });

    test("WireOnFaceDto - passing arguments", ()=>{
        const cDto = new OCCT.WireOnFaceDto(1,1);

        expect(cDto.shapes).toBeDefined();
        expect(cDto.wire).toBeDefined();
        expect(cDto.face).toBeDefined();
    });








    test("CircleDto - defaults", ()=>{
        const cDto = new OCCT.CircleDto();

        expect(cDto.radius).toBe(1);
        expect(cDto.center).toMatchObject([0, 0, 0]);
        expect(cDto.direction).toMatchObject([0, 1, 0]);
    });

    test("CircleDto - passing arguments", ()=>{
        const cDto = new OCCT.CircleDto(5, [1, 2, 3], [1,0,0]);

        expect(cDto.radius).toBe(5);
        expect(cDto.center).toMatchObject([1, 2, 3]);
        expect(cDto.direction).toMatchObject([1, 0, 0]);
    });

});