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

    test("FaceSubdivisionDto - defaults", ()=>{
        const dto = new OCCT.FaceSubdivisionDto();

        expect(dto.shape).toBeUndefined();
    });

    test("FaceSubdivisionDto - passing parameters", ()=>{
        const dto = new OCCT.FaceSubdivisionDto(1);

        expect(dto.shape).toBeDefined();
    });

    test("FaceLinearSubdivisionDto - defaults", ()=>{
        const dto = new OCCT.FaceLinearSubdivisionDto();

        expect(dto.shape).toBeUndefined();
    });

    test("FaceLinearSubdivisionDto - passing parameters", ()=>{
        const dto = new OCCT.FaceLinearSubdivisionDto(1);

        expect(dto.shape).toBeDefined();
    });

    test("DataOnUVDto - defaults", ()=>{
        const dto = new OCCT.DataOnUVDto();

        expect(dto.shape).toBeUndefined();
    });

    test("DataOnUVDto - passing parameters", ()=>{
        const dto = new OCCT.DataOnUVDto(1);

        expect(dto.shape).toBeDefined();
    });

    test("DataOnUVsDto - defaults", ()=>{
        const dto = new OCCT.DataOnUVsDto();

        expect(dto.shape).toBeUndefined();
    });

    test("DataOnUVsDto - passing parameters", ()=>{
        const dto = new OCCT.DataOnUVsDto(1);

        expect(dto.shape).toBeDefined();
    });

    test("PolygonDto - defaults", ()=>{
        const dto = new OCCT.PolygonDto();

        expect(dto.points).toBeUndefined();
    });

    test("PolygonDto - passing parameters", ()=>{
        const dto = new OCCT.PolygonDto([[0,0,0]]);

        expect(dto.points).toBeDefined();
        expect(dto.points).toHaveLength(1);
    });

    test("PolylineDto - defaults", ()=>{
        const dto = new OCCT.PolylineDto();

        expect(dto.points).toBeUndefined();
    });

    test("PolylineDto - passing parameters", ()=>{
        const dto = new OCCT.PolylineDto([[0,0,0]]);

        expect(dto.points).toBeDefined();
        expect(dto.points).toHaveLength(1);
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

    test("LPolygonDto - defaults", ()=>{
        const dto = new OCCT.LPolygonDto();

        expect(dto.widthFirst).toBe(1);
        expect(dto.lengthFirst).toBe(2);
        expect(dto.widthSecond).toBe(0.5);
        expect(dto.lengthSecond).toBe(2);
        expect(dto.align).toBe("outside");
        expect(dto.rotation).toBe(0);
        expect(dto.center).toMatchObject([0, 0, 0]);
        expect(dto.direction).toMatchObject([0, 1, 0]);
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

    test("ConeDto - defaults", ()=>{
        const dto = new OCCT.ConeDto();

        expect(dto.radius1).toBe(2);
        expect(dto.radius2).toBe(1);
        expect(dto.height).toBe(2);
        expect(dto.angle).toBe(360);
        expect(dto.center).toMatchObject([0, 0, 0]);
        expect(dto.direction).toMatchObject([0, 1, 0]);
    });

    test("ConeDto - passing arguments", ()=>{
        const dto = new OCCT.ConeDto(7, 3, 20, 273, [2, 5, 7], [0,0,1]);

        expect(dto.radius1).toBe(7);
        expect(dto.radius2).toBe(3);
        expect(dto.height).toBe(20);
        expect(dto.angle).toBe(273);
        expect(dto.center).toMatchObject([2, 5, 7]);
        expect(dto.direction).toMatchObject([0, 0, 1]);
    });

    test("LineDto - defaults", ()=>{
        const dto = new OCCT.LineDto();

        expect(dto.start).toMatchObject([0, 0, 0]);
        expect(dto.end).toMatchObject([0, 1, 0]);
    });

    test("ArcEdgeThreePointsDto - defaults", ()=>{
        const dto = new OCCT.ArcEdgeThreePointsDto();

        expect(dto.start).toMatchObject([0, 0, 0]);
        expect(dto.middle).toMatchObject([0, 1, 0]);
        expect(dto.end).toMatchObject([0, 0, 1]);
    });

    test("CylinderDto - defaults", ()=>{
        const dto = new OCCT.CylinderDto();

        expect(dto.radius).toBe(1);
        expect(dto.height).toBe(2);
        expect(dto.center).toMatchObject([0, 0, 0]);
        expect(dto.direction).toMatchObject([0, 1, 0]);
    });

    test("CylindersOnLinesDto - defaults", ()=>{
        const dto = new OCCT.CylindersOnLinesDto();

        expect(dto.radius).toBe(1);
        expect(dto.lines).toBeUndefined();
    });

    test("FilletDto - defaults", ()=>{
        const dto = new OCCT.FilletDto();

        expect(dto.shape).toBeUndefined();
        expect(dto.radius).toBe(0.1);
        expect(dto.radiusList).toBeUndefined();
        expect(dto.indexes).toBeUndefined();
    });

    test("FilletDto - passing arguments", ()=>{
        const dto = new OCCT.FilletDto(5, 2, [1], [3]);

        expect(dto.shape).toBeDefined();
        expect(dto.radius).toBe(2);
        expect(dto.radiusList).toMatchObject([3]);
        expect(dto.indexes).toMatchObject([1]);
    });

    test("Fillet3DWireDto - defaults", ()=>{
        const dto = new OCCT.Fillet3DWireDto();

        expect(dto.shape).toBeUndefined();
    });

    test("Fillet3DWireDto - passing arguments", ()=>{
        const dto = new OCCT.Fillet3DWireDto(5);

        expect(dto.shape).toBeDefined();
    });

    test("ChamferDto - defaults", ()=>{
        const dto = new OCCT.ChamferDto();

        expect(dto.shape).toBeUndefined();
        expect(dto.distance).toBe(0.1);
        expect(dto.distanceList).toBeUndefined();
        expect(dto.indexes).toBeUndefined();
    });

    test("ChamferDto - passing arguments", ()=>{
        const dto = new OCCT.ChamferDto(5, 2, [1], [3]);

        expect(dto.shape).toBeDefined();
        expect(dto.distance).toBe(2);
        expect(dto.distanceList).toMatchObject([3]);
        expect(dto.indexes).toMatchObject([1]);
    });

    test("BSplineDto - defaults", ()=>{
        const dto = new OCCT.BSplineDto();

        expect(dto.points).toBeUndefined();
        expect(dto.closed).toBeFalsy();
    });

    test("BSplineDto - passing arguments", ()=>{
        const dto = new OCCT.BSplineDto([[0,0,0]], true);

        expect(dto.points).toBeDefined();
        expect(dto.closed).toBeTruthy();
    });

    test("InterpolationDto - InterpolationDto", ()=>{
        const dto = new OCCT.InterpolationDto();

        expect(dto.points).toBeUndefined();
        expect(dto.periodic).toBeFalsy();
        expect(dto.tolerance).toBe(1e-7);
    });

    test("InterpolationDto - passing arguments", ()=>{
        const dto = new OCCT.InterpolationDto([[0,0,0]], true);

        expect(dto.points).toBeDefined();
        expect(dto.periodic).toBeTruthy();
        expect(dto.tolerance).toBe(1e-7);
    });

    test("BezierDto - defaults", ()=>{
        const dto = new OCCT.BezierDto();

        expect(dto.points).toBeUndefined();
        expect(dto.closed).toBeFalsy();
    });

    test("BezierDto - passing arguments", ()=>{
        const dto = new OCCT.BezierDto([[0,0,0]], true);

        expect(dto.points).toBeDefined();
        expect(dto.closed).toBeTruthy();
    });

    test("DivideDto - defaults", ()=>{
        const dto = new OCCT.DivideDto();

        expect(dto.shape).toBeUndefined();
        expect(dto.nrOfDivisions).toBe(10);
        expect(dto.removeStartPoint).toBeFalsy();
        expect(dto.removeEndPoint).toBeFalsy();
    });

    test("DivideDto - passing arguments", ()=>{
        const dto = new OCCT.DivideDto(1, 25, true, true);

        expect(dto.shape).toBeDefined();
        expect(dto.nrOfDivisions).toBe(25);
        expect(dto.removeStartPoint).toBeTruthy();
        expect(dto.removeEndPoint).toBeTruthy();
    });

    test("DataOnGeometryAtParamDto - defaults", ()=>{
        const dto = new OCCT.DataOnGeometryAtParamDto();

        expect(dto.shape).toBeUndefined();
        expect(dto.param).toBe(0.5);
    });

    test("DataOnGeometryAtParamDto - passing arguments", ()=>{
        const dto = new OCCT.DataOnGeometryAtParamDto(1, 1.3);

        expect(dto.shape).toBeDefined();
        expect(dto.param).toBe(1.3);
    });

    test("PointInFaceDto - defaults", ()=>{
        const dto = new OCCT.PointInFaceDto();

        expect(dto.face).toBeUndefined();
        expect(dto.edge).toBeUndefined();
        expect(dto.tEdgeParam).toBe(0.5);
        expect(dto.distance2DParam).toBe(0.5);
    });

    test("PointInFaceDto - passing arguments", ()=>{
        const dto = new OCCT.PointInFaceDto(1, 2, 1.3, 2.7);

        expect(dto.face).toBeDefined();
        expect(dto.edge).toBeDefined();
        expect(dto.tEdgeParam).toBe(1.3);
        expect(dto.distance2DParam).toBe(2.7);
    });

    test("DataOnGeometryAtLengthDto - defaults", ()=>{
        const dto = new OCCT.DataOnGeometryAtLengthDto();

        expect(dto.shape).toBeUndefined();
        expect(dto.length).toBe(0.5);
    });

    test("DataOnGeometryAtLengthDto - passing arguments", ()=>{
        const dto = new OCCT.DataOnGeometryAtLengthDto(1, 1.3);

        expect(dto.shape).toBeDefined();
        expect(dto.length).toBe(1.3);
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