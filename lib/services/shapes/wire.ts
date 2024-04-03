import { TopoDS_Face, OpenCascadeInstance, TopoDS_Wire, TopoDS_Compound, TopoDS_Shape, TopoDS_Edge } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper, typeSpecificityEnum } from "../../occ-helper";
import * as Inputs from "../../api/inputs/inputs";

export class OCCTWire {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    createPolygonWire(inputs: Inputs.OCCT.PolygonDto): TopoDS_Wire {
        return this.och.createPolygonWire(inputs);
    }

    createPolygons(inputs: Inputs.OCCT.PolygonsDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.polygons.map(p => this.createPolygonWire(p)).filter(s => s !== undefined);
        return this.och.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    createPolylineWire(inputs: Inputs.OCCT.PolylineDto): TopoDS_Wire {
        return this.och.createPolylineWire(inputs);
    }

    createPolylines(inputs: Inputs.OCCT.PolylinesDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.polylines.map(p => this.createPolylineWire(p)).filter(s => s !== undefined);
        return this.och.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    createLineWire(inputs: Inputs.OCCT.LineDto): TopoDS_Wire {
        return this.och.createLineWire(inputs);
    }

    createLines(inputs: Inputs.OCCT.LinesDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.lines.map(p => this.createLineWire(p)).filter(s => s !== undefined);
        return this.och.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    createBezier(inputs: Inputs.OCCT.BezierDto) {
        const ptList = new this.occ.TColgp_Array1OfPnt_2(1, inputs.points.length + (inputs.closed ? 1 : 0));
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            ptList.SetValue(pIndex, this.och.gpPnt(inputs.points[pIndex - 1]));
        }
        if (inputs.closed) { ptList.SetValue(inputs.points.length + 1, ptList.Value(1)); }
        const geomBezierCurveHandle = new this.occ.Geom_BezierCurve_1(ptList);
        const geomCurve = new this.occ.Handle_Geom_Curve_2(geomBezierCurveHandle);
        const edgeMaker = new this.occ.BRepBuilderAPI_MakeEdge_24(geomCurve);
        const edge = edgeMaker.Edge();
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire_2(edge);
        const result = makeWire.Wire();
        makeWire.delete();
        edgeMaker.delete();
        edge.delete();
        geomCurve.delete();
        ptList.delete();
        return result;
    }

    createBezierWires(inputs: Inputs.OCCT.BezierWiresDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.bezierWires.map(p => this.createBezier(p)).filter(s => s !== undefined);
        return this.och.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    interpolatePoints(inputs: Inputs.OCCT.InterpolationDto): TopoDS_Wire {
        return this.och.interpolatePoints(inputs);
    }

    interpolateWires(inputs: Inputs.OCCT.InterpolateWiresDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.interpolations.map(p => this.interpolatePoints(p)).filter(s => s !== undefined);
        return this.och.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    splitOnPoints(inputs: Inputs.OCCT.SplitWireOnPointsDto<TopoDS_Wire>): TopoDS_Wire[] {

        const tolerance = 1.0e-7;
        const startPointOnWire = this.och.startPointOnWire({ shape: inputs.shape });
        const endPointOnWire = this.och.endPointOnWire({ shape: inputs.shape });

        // This is needed to make follow up algorithm to work properly on open wires
        const wireIsClosed = this.och.vecHelper.vectorsTheSame(endPointOnWire, startPointOnWire, tolerance);
        if (!wireIsClosed) {
            if (!inputs.points.some(p => this.och.vecHelper.vectorsTheSame(p, startPointOnWire, tolerance))) {
                inputs.points.push(startPointOnWire);
            }

            if (!inputs.points.some(p => this.och.vecHelper.vectorsTheSame(p, endPointOnWire, tolerance))) {
                inputs.points.push(endPointOnWire);
            }
        }

        const shortLines = this.createLines({
            lines: inputs.points.map(p => ({ start: p, end: [p[0], p[1] + tolerance, p[2]] as Inputs.Base.Point3 })),
            returnCompound: false
        }) as TopoDS_Wire[];

        const diff = this.och.difference({ shape: inputs.shape, shapes: shortLines, keepEdges: true });
        const edges = this.och.getEdges({ shape: diff });

        const groupedEdges: TopoDS_Edge[][] = [];
        edges.forEach((e) => {
            const latestArray = groupedEdges[groupedEdges.length - 1];

            // direction of edges seem to be reversed, but it does not matter for this algorithm
            // better not to start reversing things and just deal with it
            const endPointOnEdge = this.och.endPointOnEdge({ shape: e });
            const startPointOnEdge = this.och.startPointOnEdge({ shape: e });
            const pointExistsOnEdgeEnd = inputs.points.some(p => this.och.vecHelper.vectorsTheSame(endPointOnEdge, p, tolerance));
            const pointExistsOnEdgeStart = inputs.points.some(p => this.och.vecHelper.vectorsTheSame(startPointOnEdge, p, tolerance));

            if (pointExistsOnEdgeEnd && !pointExistsOnEdgeStart) {
                groupedEdges.push([e]);
            } else if (!pointExistsOnEdgeEnd && pointExistsOnEdgeStart) {
                if (latestArray) {
                    latestArray.push(e);
                } else {
                    groupedEdges.push([e]);
                }
            } else if (pointExistsOnEdgeEnd && pointExistsOnEdgeStart) {
                groupedEdges.push([e]);
            } else if (!pointExistsOnEdgeEnd && !pointExistsOnEdgeStart) {
                if (latestArray) {
                    latestArray.push(e);
                } else {
                    groupedEdges.push([e]);
                }
            }
        });

        const wires = [];

        groupedEdges.forEach(g => {
            const wire = this.combineEdgesAndWiresIntoAWire({
                shapes: g
            });
            wires.push(wire);
        });
        // when wire is closed and first wire and last wire share the corner, they need to be combined if there's no split point that matches that corner
        if (wireIsClosed && wires.length > 1) {
            const endPointOnFirstWire = this.och.endPointOnWire({ shape: wires[0] });
            const startPointOnLastWire = this.och.startPointOnWire({ shape: wires[wires.length - 1] });
            if (this.och.vecHelper.vectorsTheSame(endPointOnFirstWire, startPointOnLastWire, tolerance)) {
                const pt = inputs.points.find(p => this.och.vecHelper.vectorsTheSame(p, endPointOnFirstWire, tolerance));
                if (!pt) {
                    const combined = this.addEdgesAndWiresToWire({ shape: wires[wires.length - 1], shapes: [wires[0]] });
                    wires[0] = combined;
                    wires.pop();
                }
            }
        }
        return wires;
    }

    combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire {
        return this.och.combineEdgesAndWiresIntoAWire(inputs);
    }

    createWireFromEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): TopoDS_Wire {
        return this.och.createWireFromEdges(inputs);
    }

    addEdgesAndWiresToWire(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Wire, TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire {
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire_1();
        makeWire.Add_2(inputs.shape);
        inputs.shapes.forEach((shape) => {
            if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
                makeWire.Add_1(shape);
            } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE) {
                makeWire.Add_2(shape);
            }
        });
        let result;
        if (makeWire.IsDone()) {
            result = makeWire.Wire();
        } else {
            throw new Error("Wire could not be constructed. Check if edges and wires do not have disconnected elements.");
        }
        makeWire.delete();
        return result;
    }

    createBSpline(inputs: Inputs.OCCT.BSplineDto): TopoDS_Wire {
        return this.och.createBSpline(inputs);
    }

    createBSplines(inputs: Inputs.OCCT.BSplinesDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.bSplines.map(p => this.createBSpline(p)).filter(s => s !== undefined);
        return this.och.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    createZigZagBetweenTwoWires(inputs: Inputs.OCCT.ZigZagBetweenTwoWiresDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.createZigZagBetweenTwoWires(inputs);
    }

    divideWireByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.divideWireByParamsToPoints(inputs);
    }

    divideWiresByParamsToPoints(inputs: Inputs.OCCT.DivideShapesDto<TopoDS_Wire>): Inputs.Base.Point3[][] {
        return inputs.shapes.map(s => this.divideWireByParamsToPoints({ ...inputs, shape: s }));
    }

    divideWireByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.divideWireByEqualDistanceToPoints(inputs);
    }

    divideWiresByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideShapesDto<TopoDS_Wire>): Inputs.Base.Point3[][] {
        return inputs.shapes.map(s => this.divideWireByEqualDistanceToPoints({ ...inputs, shape: s }));
    }

    pointOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.pointOnWireAtParam(inputs);
    }

    pointOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.pointOnWireAtLength(inputs);
    }

    tangentOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.tangentOnWireAtParam(inputs);
    }

    tangentOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.tangentOnWireAtLength(inputs);
    }

    derivativesOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);

        const absc = new this.occ.GCPnts_AbscissaPoint_2(curve, inputs.length, curve.FirstParameter());
        const param = absc.Parameter();
        const gpPnt = this.och.gpPnt([0, 0, 0]);

        const der1 = this.och.gpVec([0, 0, 0]);
        const der2 = this.och.gpVec([0, 0, 0]);
        const der3 = this.och.gpVec([0, 0, 0]);

        curve.D3(param, gpPnt, der1, der2, der3);
        const der: [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] = [[der1.X(), der1.Y(), der1.Z()], [der2.X(), der2.Y(), der2.Z()], [der3.X(), der3.Y(), der3.Z()]];
        der1.delete();
        der2.delete();
        der3.delete();
        curve.delete();
        absc.delete();
        gpPnt.delete();
        return der;
    }

    derivativesOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);

        const gpPnt = this.och.gpPnt([0, 0, 0]);

        const der1 = this.och.gpVec([0, 0, 0]);
        const der2 = this.och.gpVec([0, 0, 0]);
        const der3 = this.och.gpVec([0, 0, 0]);

        const param = this.och.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());

        curve.D3(param, gpPnt, der1, der2, der3);
        const der: [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] = [[der1.X(), der1.Y(), der1.Z()], [der2.X(), der2.Y(), der2.Z()], [der3.X(), der3.Y(), der3.Z()]];
        der1.delete();
        der2.delete();
        der3.delete();
        curve.delete();
        gpPnt.delete();
        return der;
    }

    startPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.startPointOnWire(inputs);
    }

    endPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.endPointOnWire(inputs);
    }

    createCircleWire(inputs: Inputs.OCCT.CircleDto) {
        return this.och.createCircle(inputs.radius, inputs.center, inputs.direction, typeSpecificityEnum.wire) as TopoDS_Wire;
    }

    createEllipseWire(inputs: Inputs.OCCT.EllipseDto) {
        return this.och.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, typeSpecificityEnum.wire) as TopoDS_Wire;
    }

    createSquareWire(inputs: Inputs.OCCT.SquareDto): TopoDS_Wire {
        return this.och.createSquareWire(inputs);
    }

    createStarWire(inputs: Inputs.OCCT.StarDto): TopoDS_Wire {
        return this.och.createStarWire(inputs);
    }

    createChristmasTreeWire(inputs: Inputs.OCCT.ChristmasTreeDto): TopoDS_Wire {
        return this.och.createChristmasTreeWire(inputs);
    }

    createParallelogramWire(inputs: Inputs.OCCT.ParallelogramDto): TopoDS_Wire {
        return this.och.createParallelogramWire(inputs);
    }

    createHeartWire(inputs: Inputs.OCCT.Heart2DDto): TopoDS_Wire {
        return this.och.createHeartWire(inputs);
    }

    createNGonWire(inputs: Inputs.OCCT.NGonWireDto): TopoDS_Wire {
        return this.och.createNGonWire(inputs);
    }

    createRectangleWire(inputs: Inputs.OCCT.RectangleDto): TopoDS_Wire {
        return this.och.createRectangleWire(inputs);
    }

    createLPolygonWire(inputs: Inputs.OCCT.LPolygonDto): TopoDS_Wire {
        return this.och.createLPolygonWire(inputs);
    }

    getWire(inputs: Inputs.OCCT.ShapeIndexDto<TopoDS_Shape>): TopoDS_Wire {
        if (!inputs.shape || inputs.shape.IsNull()) {
            throw (new Error("Shape is not provided or is null"));
        }
        const shapeType = this.och.getShapeTypeEnum(inputs.shape);
        if ((shapeType === Inputs.OCCT.shapeTypeEnum.wire ||
            shapeType === Inputs.OCCT.shapeTypeEnum.edge ||
            shapeType === Inputs.OCCT.shapeTypeEnum.vertex)) {
            throw (new Error("Shape is of incorrect type"));
        }
        if (!inputs.index) { inputs.index = 0; }
        let innerWire: TopoDS_Wire | undefined;
        this.och.forEachWire(inputs.shape, (i, s) => {
            if (i === inputs.index) { innerWire = this.occ.TopoDS.Wire_1(s); }
        });
        if (!innerWire) {
            throw (Error("Wire not found"));
        }
        return innerWire;
    }

    getWires(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Wire[] {
        return this.och.getWires(inputs);
    }

    getWireLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): number {
        return this.och.getWireLength(inputs);
    }

    getWiresLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire>): number[] {
        return this.och.getWiresLengths(inputs);
    }

    getWireCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.getWireCenterOfMass(inputs);
    }

    getWiresCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return inputs.shapes.map(w => this.och.getWireCenterOfMass({
            shape: w
        }));
    }

    reversedWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        const wire: TopoDS_Wire = inputs.shape;
        const reversed = wire.Reversed();
        const result = this.och.getActualTypeOfShape(reversed);
        reversed.delete();
        return result;
    }

    reversedWireFromReversedEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        const wire: TopoDS_Wire = inputs.shape;
        const edges = this.och.getEdgesAlongWire({ shape: wire });
        const reversedEdges = edges.map(e => {
            return this.och.getActualTypeOfShape(e.Reversed());
        });
        const reversed = this.och.combineEdgesAndWiresIntoAWire({ shapes: reversedEdges.reverse() });
        const result = this.och.getActualTypeOfShape(reversed);
        reversed.delete();
        reversedEdges.forEach(e => e.delete());
        return result;
    }

    placeWireOnFace(inputs: Inputs.OCCT.WireOnFaceDto<TopoDS_Wire, TopoDS_Face>) {
        const wire = inputs.wire as TopoDS_Wire;
        const face = inputs.face as TopoDS_Face;
        const srf = this.och.surfaceFromFace({ shape: face });
        const result = this.och.placeWire(wire, srf);
        return result;
    }

    placeWiresOnFace(inputs: Inputs.OCCT.WiresOnFaceDto<TopoDS_Wire, TopoDS_Face>) {
        const wires = inputs.wires;
        const face = inputs.face;
        const srf = this.och.surfaceFromFace({ shape: face });
        const result = wires.map(wire => this.och.placeWire(wire, srf));
        return result;
    }

    closeOpenWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        const wire = inputs.shape;
        const firstPoint = this.och.startPointOnWire({ shape: wire });
        const lastPoint = this.och.endPointOnWire({ shape: wire });
        const tolerance = 1.0e-7;
        if (this.och.vecHelper.vectorsTheSame(firstPoint, lastPoint, tolerance)) {
            return wire;
        }
        const edgeWire = this.createLineWire({ start: lastPoint, end: firstPoint });
        const result = this.addEdgesAndWiresToWire({ shape: wire, shapes: [edgeWire] });
        edgeWire.delete();
        return result;
    }

    project(inputs: Inputs.OCCT.ProjectWireDto<TopoDS_Wire, TopoDS_Shape>): TopoDS_Compound {
        const wire = inputs.wire;
        const gpDir = this.och.gpDir(inputs.direction);
        const proj = new this.occ.BRepProj_Projection_1(wire, inputs.shape, gpDir);
        const shape = proj.Shape();
        gpDir.delete();
        proj.delete();
        return shape;
    }

    wiresToPoints(inputs: Inputs.OCCT.WiresToPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        const wires = this.getWires({ shape: inputs.shape });
        const allWirePoints = [];
        wires.forEach(w => {
            const edgePoints = this.och.edgesToPoints({ ...inputs, shape: w });
            const flatPoints = edgePoints.flat();
            const dupsRemoved = this.och.vecHelper.removeConsecutiveDuplicates(flatPoints, false);
            allWirePoints.push(dupsRemoved);
        });
        return allWirePoints;
    }

    projectWires(inputs: Inputs.OCCT.ProjectWiresDto<TopoDS_Wire, TopoDS_Shape>): TopoDS_Compound[] {
        const shapes = [];
        inputs.wires.forEach(wire => {
            const gpDir = this.och.gpDir(inputs.direction);
            const proj = new this.occ.BRepProj_Projection_1(wire, inputs.shape, gpDir);
            const shape = proj.Shape();
            shapes.push(shape);
            gpDir.delete();
            proj.delete();
        });

        return shapes;
    }
}
