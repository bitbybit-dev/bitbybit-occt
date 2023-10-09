import {OCCT} from "./occ-inputs";

describe("OCC Inputs", () => {
    test("FilletTwoEdgesInPlaneDto - defaults", ()=>{
        const dto = new OCCT.FilletTwoEdgesInPlaneDto();

        expect(dto.edge1).toBeUndefined();
        expect(dto.edge2).toBeUndefined();
        expect(dto.planeOrigin).toMatchObject([0, 0, 0]);
        expect(dto.planeDirection).toMatchObject([0, 1, 0]);
        expect(dto.radius).toBe(0.3);
        expect(dto.solution).toBe(-1);
    });

    test("FilletTwoEdgesInPlaneDto - passing arguments", ()=>{
        const dto = new OCCT.FilletTwoEdgesInPlaneDto([1,2], [0,0,1], [1,0,0], 2.7, 5);

        expect(dto.edge1).toBe(1);
        expect(dto.edge2).toBe(2);
        expect(dto.planeOrigin).toMatchObject([0, 0, 1]);
        expect(dto.planeDirection).toMatchObject([1, 0, 0]);
        expect(dto.radius).toBe(2.7);
        expect(dto.solution).toBe(5);
    });

    test("ClosestPointsOnShapesFromPointsDto - defaults", ()=>{
        const dto = new OCCT.ClosestPointsOnShapesFromPointsDto();

        expect(dto.shapes).toBeUndefined();
        expect(dto.points).toBeUndefined();
    });

    test("ClosestPointsOnShapesFromPointsDto - passing arguments", ()=>{
        const dto = new OCCT.ClosestPointsOnShapesFromPointsDto([1,2], [[0,0,0],[0,1,2]]);

        expect(dto.shapes).toHaveLength(2);
        expect(dto.points).toHaveLength(2);
    });

    test("ClosestPointsBetweenTwoShapesDto - defaults", ()=>{
        const dto = new OCCT.ClosestPointsBetweenTwoShapesDto();

        expect(dto.shapes).toBeUndefined();
        expect(dto.shape1).toBeUndefined();
        expect(dto.shape2).toBeUndefined();
    });

    test("ClosestPointsBetweenTwoShapesDto - passing arguments", ()=>{
        const dto = new OCCT.ClosestPointsBetweenTwoShapesDto(1,1);

        expect(dto.shapes).toBeDefined();
        expect(dto.shape1).toBeDefined();
        expect(dto.shape2).toBeDefined();
    });

    test("FaceFromSurfaceAndWireDto - defaults", ()=>{
        const dto = new OCCT.FaceFromSurfaceAndWireDto();

        expect(dto.shapes).toBeUndefined();
        expect(dto.surface).toBeUndefined();
        expect(dto.wire).toBeUndefined();
        expect(dto.inside).toBeTruthy();
    });

    test("FaceFromSurfaceAndWireDto - passing arguments", ()=>{
        const dto = new OCCT.FaceFromSurfaceAndWireDto(1, 2, false);

        expect(dto.shapes).toBeDefined();
        expect(dto.surface).toBeDefined();
        expect(dto.wire).toBeDefined();
        expect(dto.inside).toBeFalsy();
    });

    test("EdgeFromGeom2dCurveAndSurfaceDto - defaults", ()=>{
        const dto = new OCCT.EdgeFromGeom2dCurveAndSurfaceDto();

        expect(dto.shapes).toBeUndefined();
        expect(dto.surface).toBeUndefined();
        expect(dto.curve).toBeUndefined();
    });

    test("EdgeFromGeom2dCurveAndSurfaceDto - passing arguments", ()=>{
        const dto = new OCCT.EdgeFromGeom2dCurveAndSurfaceDto(1, 2);

        expect(dto.shapes).toBeDefined();
        expect(dto.surface).toBeDefined();
        expect(dto.curve).toBeDefined();
    });

    test("WireOnFaceDto - defaults", ()=>{
        const dto = new OCCT.WireOnFaceDto();

        expect(dto.shapes).toBeUndefined();
        expect(dto.wire).toBeUndefined();
        expect(dto.face).toBeUndefined();
    });

    test("WireOnFaceDto - passing arguments", ()=>{
        const dto = new OCCT.WireOnFaceDto(1,1);

        expect(dto.shapes).toBeDefined();
        expect(dto.wire).toBeDefined();
        expect(dto.face).toBeDefined();
    });

    test("DrawShapeDto - defaults", ()=>{
        const dto = new OCCT.DrawShapeDto();

        expect(dto.shape).toBeUndefined();
        expect(dto.faceOpacity).toBe(1);
        expect(dto.edgeOpacity).toBe(1);
        expect(dto.edgeColour).toBe("#ffffff");
        expect(dto.faceMaterial).toBeUndefined();
        expect(dto.faceColour).toBe("#ff0000");
        expect(dto.edgeWidth).toBe(2);
        expect(dto.drawEdges).toBeTruthy();
        expect(dto.precision).toBe(0.01);
        expect(dto.drawEdgeIndexes).toBeFalsy();
        expect(dto.edgeIndexHeight).toBe(0.06);
        expect(dto.edgeIndexColour).toBe("#ff00ff");
        expect(dto.drawFaceIndexes).toBeFalsy();
        expect(dto.faceIndexHeight).toBe(0.06);
        expect(dto.faceIndexColour).toBe("#0000ff");
    });

    test("DrawShapeDto - passing parameters", ()=>{
        const dto = new OCCT.DrawShapeDto(1);

        expect(dto.shape).toBeDefined();

    });



    test("SquareDto - defaults", ()=>{
        const dto = new OCCT.SquareDto();

        expect(dto.size).toBe(1);
        expect(dto.center).toMatchObject([0, 0, 0]);
        expect(dto.direction).toMatchObject([0, 1, 0]);
    });

    test("SquareDto - passing arguments", ()=>{
        const dto = new OCCT.SquareDto(5, [1, 2, 3], [1,0,0]);

        expect(dto.size).toBe(5);
        expect(dto.center).toMatchObject([1, 2, 3]);
        expect(dto.direction).toMatchObject([1, 0, 0]);
    });

    test("RectangleDto - defaults", ()=>{
        const dto = new OCCT.RectangleDto();

        expect(dto.width).toBe(1);
        expect(dto.length).toBe(2);
        expect(dto.center).toMatchObject([0, 0, 0]);
        expect(dto.direction).toMatchObject([0, 1, 0]);
    });

    test("RectangleDto - passing arguments", ()=>{
        const dto = new OCCT.RectangleDto(5, 10, [1, 2, 3], [1,0,0]);

        expect(dto.width).toBe(5);
        expect(dto.length).toBe(10);
        expect(dto.center).toMatchObject([1, 2, 3]);
        expect(dto.direction).toMatchObject([1, 0, 0]);
    });

    test("BoxDto - defaults", ()=>{
        const dto = new OCCT.BoxDto();

        expect(dto.width).toBe(1);
        expect(dto.length).toBe(2);
        expect(dto.height).toBe(3);
        expect(dto.center).toMatchObject([0, 0, 0]);
    });

    test("BoxDto - passing arguments", ()=>{
        const dto = new OCCT.BoxDto(5, 7, 1, [2, 5, 7]);

        expect(dto.width).toBe(5);
        expect(dto.length).toBe(7);
        expect(dto.height).toBe(1);
        expect(dto.center).toMatchObject([2, 5, 7]);
    });

    test("BoxFromCornerDto - defaults", ()=>{
        const dto = new OCCT.BoxFromCornerDto();

        expect(dto.width).toBe(1);
        expect(dto.length).toBe(2);
        expect(dto.height).toBe(3);
        expect(dto.corner).toMatchObject([0, 0, 0]);
    });

    test("BoxFromCornerDto - passing arguments", ()=>{
        const dto = new OCCT.BoxFromCornerDto(5, 7, 1, [2, 5, 7]);

        expect(dto.width).toBe(5);
        expect(dto.length).toBe(7);
        expect(dto.height).toBe(1);
        expect(dto.corner).toMatchObject([2, 5, 7]);
    });

    test("SphereDto - defaults", ()=>{
        const dto = new OCCT.SphereDto();

        expect(dto.radius).toBe(1);
        expect(dto.center).toMatchObject([0, 0, 0]);
    });

    test("SphereDto - passing arguments", ()=>{
        const dto = new OCCT.SphereDto(7, [2, 5, 7]);

        expect(dto.radius).toBe(7);
        expect(dto.center).toMatchObject([2, 5, 7]);
    });


    test("CircleDto - defaults", ()=>{
        const dto = new OCCT.CircleDto();

        expect(dto.radius).toBe(1);
        expect(dto.center).toMatchObject([0, 0, 0]);
        expect(dto.direction).toMatchObject([0, 1, 0]);
    });

    test("CircleDto - passing arguments", ()=>{
        const dto = new OCCT.CircleDto(5, [1, 2, 3], [1,0,0]);

        expect(dto.radius).toBe(5);
        expect(dto.center).toMatchObject([1, 2, 3]);
        expect(dto.direction).toMatchObject([1, 0, 0]);
    });

});