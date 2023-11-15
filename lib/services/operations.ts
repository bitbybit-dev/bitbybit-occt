import {
    Approx_ParametrizationType, BRepFill_TypeOfContact, BRepOffsetAPI_MakeOffsetShape,
    BRepOffsetAPI_MakeOffset_1, BRepOffset_Mode, GeomAbs_JoinType, OpenCascadeInstance,
    TopoDS_Compound, TopoDS_Edge, TopoDS_Shape, TopoDS_Vertex, TopoDS_Wire
} from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper, shapeTypeEnum, typeSpecificityEnum } from "../occ-helper";
import * as Inputs from "../api/inputs/inputs";

export class OCCTOperations {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    closestPointsBetweenTwoShapes(inputs: Inputs.OCCT.ClosestPointsBetweenTwoShapesDto<TopoDS_Shape>): [Inputs.Base.Point3, Inputs.Base.Point3] {
        if (inputs.shapes === undefined || inputs.shapes.length < 2) {
            throw (Error(("Shapes needs to be an array of length 2")));
        }
        return this.och.closestPointsBetweenTwoShapes(inputs.shapes[0], inputs.shapes[1]);
    }

    closestPointsOnShapeFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        const vertexes = inputs.points.map(p => this.och.makeVertex(p));
        const pointsOnShape = vertexes.map(v => this.och.closestPointsBetweenTwoShapes(v, inputs.shape));
        return pointsOnShape.map(p => p[1]);
    }

    closestPointsOnShapesFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapesFromPointsDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        const vertexes = inputs.points.map(p => this.och.makeVertex(p));
        const result: Inputs.Base.Point3[] = [];
        inputs.shapes.forEach((s) => {
            const pointsOnShape = vertexes.map(v => this.och.closestPointsBetweenTwoShapes(v, s));
            result.push(...pointsOnShape.map(p => p[1]));
        });
        return result;
    }

    loft(inputs: Inputs.OCCT.LoftDto<TopoDS_Wire | TopoDS_Edge>) {
        const pipe = new this.occ.BRepOffsetAPI_ThruSections(inputs.makeSolid, false, 1.0e-06);
        inputs.shapes.forEach((wire) => {
            if (this.och.getShapeTypeEnum(wire) === shapeTypeEnum.edge) {
                wire = this.och.bRepBuilderAPIMakeWire(wire);
            }
            pipe.AddWire(wire);
        });
        pipe.CheckCompatibility(false);
        const pipeShape = pipe.Shape();
        const res = this.och.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        return res;
    }

    loftAdvanced(inputs: Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire | TopoDS_Edge>) {
        if (inputs.periodic && !inputs.closed) {
            throw new Error("Cant construct periodic non closed loft.");
        }
        const pipe = new this.occ.BRepOffsetAPI_ThruSections(inputs.makeSolid, inputs.straight, inputs.tolerance);
        const wires: TopoDS_Wire[] = [];
        const vertices: TopoDS_Vertex[] = [];
        if (inputs.startVertex) {
            const v = this.och.makeVertex(inputs.startVertex);
            pipe.AddVertex(v);
            vertices.push(v);
        }
        if (inputs.closed && !inputs.periodic) {
            inputs.shapes.push(inputs.shapes[0]);
        } else if (inputs.closed && inputs.periodic) {
            const pointsOnCrvs: Inputs.Base.Point3[][] = [];
            inputs.shapes.forEach((s: TopoDS_Wire | TopoDS_Edge) => {
                if (this.och.getShapeTypeEnum(s) === shapeTypeEnum.edge) {
                    s = this.och.bRepBuilderAPIMakeWire(s);
                }
                const pts = this.och.divideWireByParamsToPoints({ shape: s, nrOfDivisions: inputs.nrPeriodicSections, removeStartPoint: false, removeEndPoint: false });
                pointsOnCrvs.push(pts);
            });

            // <= needed due to start and end points that are added
            for (let i = 0; i <= inputs.nrPeriodicSections; i++) {
                const ptsForPerpWire = pointsOnCrvs.map(p => p[i]);
                const periodicWire = this.och.interpolatePoints({ points: ptsForPerpWire, tolerance: inputs.tolerance, periodic: true });
                pipe.AddWire(periodicWire);
                wires.push(periodicWire);
            }
        }
        if (!inputs.periodic) {
            inputs.shapes.forEach((wire) => {
                pipe.AddWire(wire);
            });
        }
        const endVertices: TopoDS_Vertex[] = [];
        if (inputs.endVertex) {
            const v = this.och.makeVertex(inputs.endVertex);
            pipe.AddVertex(v);
            endVertices.push(v);
        }
        if (inputs.useSmoothing) {
            pipe.SetSmoothing(inputs.useSmoothing);
        }
        if (inputs.maxUDegree) {
            pipe.SetMaxDegree(inputs.maxUDegree);
        }
        let parType: Approx_ParametrizationType | undefined = undefined;
        if (inputs.parType === Inputs.OCCT.ApproxParametrizationTypeEnum.approxChordLength) {
            parType = this.occ.Approx_ParametrizationType.Approx_ChordLength as Approx_ParametrizationType;
        } else if (inputs.parType === Inputs.OCCT.ApproxParametrizationTypeEnum.approxCentripetal) {
            parType = this.occ.Approx_ParametrizationType.Approx_Centripetal as Approx_ParametrizationType;
        } else if (inputs.parType === Inputs.OCCT.ApproxParametrizationTypeEnum.approxIsoParametric) {
            parType = this.occ.Approx_ParametrizationType.Approx_IsoParametric as Approx_ParametrizationType;
        }
        if (parType) {
            pipe.SetParType(parType);
        }
        pipe.CheckCompatibility(false);
        const pipeShape = pipe.Shape();
        const res = this.och.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        wires.forEach(w => w.delete());
        vertices.forEach(v => v.delete());
        endVertices.forEach(v => v.delete());
        return res;
    }

    offset(inputs: Inputs.OCCT.OffsetDto<TopoDS_Shape>) {
        return this.offsetAdv({ shape: inputs.shape, distance: inputs.distance, tolerance: inputs.tolerance, joinType: Inputs.OCCT.JoinTypeEnum.arc, removeIntEdges: false });
    }

    offsetAdv(inputs: Inputs.OCCT.OffsetAdvancedDto<TopoDS_Shape>) {
        if (!inputs.tolerance) { inputs.tolerance = 0.1; }
        if (inputs.distance === 0.0) { return inputs.shape; }
        let offset: BRepOffsetAPI_MakeOffset_1 | BRepOffsetAPI_MakeOffsetShape;
        const joinType: GeomAbs_JoinType = this.getJoinType(inputs.joinType);
        // only this mode is implemented currently, so we cannot expose others...
        const brepOffsetMode: BRepOffset_Mode = this.occ.BRepOffset_Mode.BRepOffset_Skin as BRepOffset_Mode;

        const wires: TopoDS_Wire[] = [];

        if ((this.och.getShapeTypeEnum(inputs.shape) === shapeTypeEnum.wire ||
            this.och.getShapeTypeEnum(inputs.shape) === shapeTypeEnum.edge)) {
            let wire: TopoDS_Wire;
            if (this.och.getShapeTypeEnum(inputs.shape) === shapeTypeEnum.edge) {
                wire = this.och.bRepBuilderAPIMakeWire(inputs.shape);
                wires.push(wire);
            } else {
                wire = inputs.shape;
            }
            try {
                offset = new this.occ.BRepOffsetAPI_MakeOffset_1();
                (offset as BRepOffsetAPI_MakeOffset_1).Init_2(joinType, false);
                (offset as BRepOffsetAPI_MakeOffset_1).AddWire(wire);
                (offset as BRepOffsetAPI_MakeOffset_1).Perform(inputs.distance, 0.0);
            } catch (ex) {
                // if first method fails we can still try the second one on wire
                offset = new this.occ.BRepOffsetAPI_MakeOffsetShape();
                (offset as BRepOffsetAPI_MakeOffsetShape).PerformByJoin(
                    wire,
                    inputs.distance,
                    inputs.tolerance,
                    brepOffsetMode,
                    false,
                    false,
                    joinType,
                    inputs.removeIntEdges,
                    new this.occ.Message_ProgressRange_1()
                );
            }

        } else {
            const shapeToOffset = inputs.shape;
            offset = new this.occ.BRepOffsetAPI_MakeOffsetShape();
            (offset as BRepOffsetAPI_MakeOffsetShape).PerformByJoin(
                shapeToOffset,
                inputs.distance,
                inputs.tolerance,
                brepOffsetMode,
                false,
                false,
                joinType,
                inputs.removeIntEdges,
                new this.occ.Message_ProgressRange_1()
            );
        }
        const offsetShape = offset.Shape();
        const result = this.och.getActualTypeOfShape(offsetShape);
        offsetShape.delete();
        if (offset) {
            offset.delete();
        }
        wires.forEach(w => w.delete());
        return result;
    }

    extrudeShapes(inputs: Inputs.OCCT.ExtrudeShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        return inputs.shapes.map(shape => {
            const extruded = this.extrude({ shape, direction: inputs.direction });
            const result = this.och.getActualTypeOfShape(extruded);
            extruded.delete();
            return result;
        });
    }

    extrude(inputs: Inputs.OCCT.ExtrudeDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.extrude(inputs);
    }

    splitShapeWithShapes(inputs: Inputs.OCCT.SplitDto<TopoDS_Shape>) {
        return this.och.splitShapeWithShapes(inputs);
    }

    revolve(inputs: Inputs.OCCT.RevolveDto<TopoDS_Shape>) {
        if (!inputs.angle) { inputs.angle = 360.0; }
        if (!inputs.direction) { inputs.direction = [0, 0, 1]; }
        let result;
        if (inputs.angle >= 360.0) {
            const pt1 = new this.occ.gp_Pnt_3(0, 0, 0);
            const dir = new this.occ.gp_Dir_4(inputs.direction[0], inputs.direction[1], inputs.direction[2]);
            const ax1 = new this.occ.gp_Ax1_2(pt1, dir);
            const makeRevol = new this.occ.BRepPrimAPI_MakeRevol_2(inputs.shape,
                ax1,
                inputs.copy);
            result = makeRevol.Shape();
            makeRevol.delete();
            pt1.delete();
            dir.delete();
            ax1.delete();
        } else {
            const pt1 = new this.occ.gp_Pnt_3(0, 0, 0);
            const dir = new this.occ.gp_Dir_4(inputs.direction[0], inputs.direction[1], inputs.direction[2]);
            const ax1 = new this.occ.gp_Ax1_2(pt1, dir);
            const makeRevol = new this.occ.BRepPrimAPI_MakeRevol_1(inputs.shape,
                ax1,
                inputs.angle * 0.0174533, inputs.copy);
            result = makeRevol.Shape();
            makeRevol.delete();
            pt1.delete();
            dir.delete();
            ax1.delete();
        }
        const actual = this.och.getActualTypeOfShape(result);
        result.delete();
        return actual;
    }

    rotatedExtrude(inputs: Inputs.OCCT.RotationExtrudeDto<TopoDS_Shape>) {
        const translatedShape = this.och.translate({
            translation: [0, inputs.height, 0],
            shape: inputs.shape,
        });
        const upperPolygon = this.och.rotate(
            {
                axis: [0, 1, 0],
                angle: inputs.angle,
                shape: translatedShape
            });

        // Define the straight spine going up the middle of the sweep
        const spineWire = this.och.createBSpline({
            points: [
                [0, 0, 0],
                [0, inputs.height, 0]
            ],
            closed: false,
        });

        // Define the guiding helical auxiliary spine (which controls the rotation)
        const steps = 30;
        const aspinePoints: Inputs.Base.Point3[] = [];
        for (let i = 0; i <= steps; i++) {
            const alpha = i / steps;
            aspinePoints.push([
                20 * Math.sin(alpha * inputs.angle * 0.0174533),
                inputs.height * alpha,
                20 * Math.cos(alpha * inputs.angle * 0.0174533),
            ]);
        }

        const aspineWire = this.och.createBSpline({ points: aspinePoints, closed: false });

        // Sweep the face wires along the spine to create the extrusion
        const pipe = new this.occ.BRepOffsetAPI_MakePipeShell(spineWire);
        pipe.SetMode_5(aspineWire, true, (this.occ.BRepFill_TypeOfContact.BRepFill_NoContact as BRepFill_TypeOfContact));
        pipe.Add_1(inputs.shape, false, false);
        pipe.Add_1(upperPolygon, false, false);
        pipe.Build(new this.occ.Message_ProgressRange_1());
        pipe.MakeSolid();

        const pipeShape = pipe.Shape();
        const result = this.och.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        aspineWire.delete();
        spineWire.delete();
        upperPolygon.delete();
        translatedShape.delete();
        return result;
    }

    pipe(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Wire, TopoDS_Shape>) {
        const pipe = new this.occ.BRepOffsetAPI_MakePipeShell(inputs.shape);
        inputs.shapes.forEach(sh => {
            pipe.Add_1(sh, false, false);
        });
        pipe.Build(new this.occ.Message_ProgressRange_1());
        pipe.MakeSolid();
        const pipeShape = pipe.Shape();
        const result = this.och.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        return result;
    }

    pipePolylineWireNGon(inputs: Inputs.OCCT.PipePolygonWireNGonDto<TopoDS_Wire>) {
        const wire = inputs.shape;
        const shapesToPassThrough: TopoDS_Shape[] = [];
        const edges = this.och.getEdges({ shape: wire });
        edges.forEach((e, index) => {
            const edgeStartPt = this.och.startPointOnEdge({ shape: e });
            const tangent = this.och.tangentOnEdgeAtParam({ shape: e, param: 0 });
            let tangentPreviousEdgeEnd: Inputs.Base.Vector3;
            let averageTangentVec = tangent;

            if (index > 0 && index < edges.length - 1) {
                const previousEdge = edges[index - 1];
                tangentPreviousEdgeEnd = this.och.tangentOnEdgeAtParam({ shape: previousEdge, param: 1 });
                averageTangentVec = [tangent[0] + tangentPreviousEdgeEnd[0] / 2, tangent[1] + tangentPreviousEdgeEnd[1] / 2, tangent[2] + tangentPreviousEdgeEnd[2] / 2];
            }
            const ngon = this.och.createNGonWire({ radius: inputs.radius, center: edgeStartPt, direction: averageTangentVec, nrCorners: inputs.nrCorners }) as TopoDS_Wire;
            shapesToPassThrough.push(ngon);
            if (index === edges.length - 1) {
                const edgeEndPt = this.och.endPointOnEdge({ shape: e });
                const tangentEndPt = this.och.tangentOnEdgeAtParam({ shape: e, param: 1 });
                const ngon = this.och.createNGonWire({ radius: inputs.radius, center: edgeEndPt, direction: tangentEndPt, nrCorners: inputs.nrCorners }) as TopoDS_Wire;
                shapesToPassThrough.push(ngon);
            }
        });

        const pipe = new this.occ.BRepOffsetAPI_MakePipeShell(wire);
        shapesToPassThrough.forEach(s => {
            pipe.Add_1(s, false, false);
        });

        pipe.Build(new this.occ.Message_ProgressRange_1());
        pipe.MakeSolid();
        const pipeShape = pipe.Shape();
        const result = this.och.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        return result;
    }

    pipeWireCylindrical(inputs: Inputs.OCCT.PipeWireCylindricalDto<TopoDS_Wire>) {
        const wire = inputs.shape;
        const shapesToPassThrough: TopoDS_Shape[] = [];
        const edges = this.och.getEdges({ shape: wire });
        edges.forEach((e, index) => {
            const edgeStartPt = this.och.startPointOnEdge({ shape: e });
            const tangent = this.och.tangentOnEdgeAtParam({ shape: e, param: 0 });
            let tangentPreviousEdgeEnd: Inputs.Base.Vector3;
            let averageTangentVec = tangent;

            if (index > 0 && index < edges.length - 1) {
                const previousEdge = edges[index - 1];
                tangentPreviousEdgeEnd = this.och.tangentOnEdgeAtParam({ shape: previousEdge, param: 1 });
                averageTangentVec = [tangent[0] + tangentPreviousEdgeEnd[0] / 2, tangent[1] + tangentPreviousEdgeEnd[1] / 2, tangent[2] + tangentPreviousEdgeEnd[2] / 2];
            }
            const circle = this.och.createCircle(inputs.radius, edgeStartPt, averageTangentVec, typeSpecificityEnum.wire) as TopoDS_Wire;
            shapesToPassThrough.push(circle);
            if (index === edges.length - 1) {
                const edgeEndPt = this.och.endPointOnEdge({ shape: e });
                const tangentEndPt = this.och.tangentOnEdgeAtParam({ shape: e, param: 1 });
                const line = this.och.createCircle(inputs.radius, edgeEndPt, tangentEndPt, typeSpecificityEnum.wire) as TopoDS_Wire;
                shapesToPassThrough.push(line);
            }
        });

        const pipe = new this.occ.BRepOffsetAPI_MakePipeShell(wire);
        shapesToPassThrough.forEach(s => {
            pipe.Add_1(s, false, false);
        });

        pipe.Build(new this.occ.Message_ProgressRange_1());
        pipe.MakeSolid();
        const pipeShape = pipe.Shape();
        const result = this.och.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        return result;
    }

    pipeWiresCylindrical(inputs: Inputs.OCCT.PipeWiresCylindricalDto<TopoDS_Wire>) {
        return inputs.shapes.map(wire => {
            return this.pipeWireCylindrical({ shape: wire, radius: inputs.radius });
        });
    }

    makeThickSolidSimple(inputs: Inputs.OCCT.ThisckSolidSimpleDto<TopoDS_Shape>) {
        const maker = new this.occ.BRepOffsetAPI_MakeThickSolid();
        maker.MakeThickSolidBySimple(inputs.shape, inputs.offset);
        maker.Build(new this.occ.Message_ProgressRange_1());
        const makerShape = maker.Shape();
        const result = this.och.getActualTypeOfShape(makerShape);
        maker.delete();
        makerShape.delete();
        return result;
    }

    makeThickSolidByJoin(inputs: Inputs.OCCT.ThickSolidByJoinDto<TopoDS_Shape>) {
        const facesToRemove = new this.occ.TopTools_ListOfShape_1();
        inputs.shapes.forEach(shape => {
            facesToRemove.Append_1(shape);
        });
        const myBody = new this.occ.BRepOffsetAPI_MakeThickSolid();
        const jointType: GeomAbs_JoinType = this.getJoinType(inputs.joinType);

        myBody.MakeThickSolidByJoin(
            inputs.shape,
            facesToRemove,
            inputs.offset,
            inputs.tolerance,
            this.occ.BRepOffset_Mode.BRepOffset_Skin as BRepOffset_Mode, // currently a single option
            inputs.intersection,
            inputs.selfIntersection,
            jointType,
            inputs.removeIntEdges,
            new this.occ.Message_ProgressRange_1());
        const makeThick = myBody.Shape();
        const result = this.och.getActualTypeOfShape(makeThick);
        makeThick.delete();
        myBody.delete();
        facesToRemove.delete();
        return result;
    }

    private getJoinType(jointType: Inputs.OCCT.JoinTypeEnum): GeomAbs_JoinType {
        let res: GeomAbs_JoinType;
        switch (jointType) {
            case Inputs.OCCT.JoinTypeEnum.arc: {
                res = this.occ.GeomAbs_JoinType.GeomAbs_Arc as GeomAbs_JoinType;
                break;
            }
            case Inputs.OCCT.JoinTypeEnum.intersection: {
                res = this.occ.GeomAbs_JoinType.GeomAbs_Intersection as GeomAbs_JoinType;
                break;
            }
            case Inputs.OCCT.JoinTypeEnum.tangent: {
                res = this.occ.GeomAbs_JoinType.GeomAbs_Tangent as GeomAbs_JoinType;
                break;
            }
        }
        return res;
    }



    private getBRepOffsetMode(offsetMode: Inputs.OCCT.BRepOffsetModeEnum): BRepOffset_Mode {
        let res: BRepOffset_Mode;
        switch (offsetMode) {
            case Inputs.OCCT.BRepOffsetModeEnum.skin: {
                res = this.occ.BRepOffset_Mode.BRepOffset_Skin as BRepOffset_Mode;
                break;
            }
            case Inputs.OCCT.BRepOffsetModeEnum.pipe: {
                res = this.occ.BRepOffset_Mode.BRepOffset_Pipe as BRepOffset_Mode;
                break;
            }
            case Inputs.OCCT.BRepOffsetModeEnum.rectoVerso: {
                res = this.occ.BRepOffset_Mode.BRepOffset_RectoVerso as BRepOffset_Mode;
                break;
            }
        }
        return res;
    }

    slice(inputs: Inputs.OCCT.SliceDto<TopoDS_Shape>): TopoDS_Compound {
        if (inputs.step <= 0) {
            throw new Error("Step needs to be positive.");
        }
        const shape = inputs.shape;
        // we orient the given shape to the reverse direction of sections so that slicing
        // would always happen in flat bbox aligned orientation
        // after algorithm computes, we turn all intersections to original shape so that it would match a given shape.
        // const fromDir
        const transformedShape = this.och.align({
            shape,
            fromOrigin: [0, 0, 0],
            fromDirection: inputs.direction,
            toOrigin: [0, 0, 0],
            toDirection: [0, 1, 0],
        });
        const bbox = new this.occ.Bnd_Box_1();
        this.occ.BRepBndLib.Add(transformedShape, bbox, false);
        const intersections = [];
        if (!bbox.IsThin(0.0001)) {
            const cornerMin = bbox.CornerMin();
            const cornerMax = bbox.CornerMax();
            const minY = cornerMin.Y();
            const maxY = cornerMax.Y();

            const minX = cornerMin.X();
            const maxX = cornerMax.X();

            const minZ = cornerMin.Z();
            const maxZ = cornerMax.Z();

            const distX = maxX - minX;
            const distZ = maxZ - minZ;

            const percentage = 1.2;
            let maxDist = distX >= distZ ? distX : distZ;
            maxDist *= percentage;



            const planes = [];
            for (let i = minY; i < maxY; i += inputs.step) {
                const pq = this.och.createSquareFace({ size: maxDist, center: [0, i, 0], direction: [0, 1, 0] });
                planes.push(pq);
            }

            const shapesToSlice = [];
            if (this.och.getShapeTypeEnum(transformedShape) === shapeTypeEnum.solid) {
                shapesToSlice.push(transformedShape);
            } else {
                const solids = this.och.getSolids({ shape: transformedShape });
                shapesToSlice.push(...solids);
            }

            if (shapesToSlice.length === 0) {
                throw new Error("No solids found to slice.");
            }

            shapesToSlice.forEach(s => {
                const intInputs = new Inputs.OCCT.IntersectionDto<TopoDS_Shape>();
                intInputs.keepEdges = true;
                intInputs.shapes = [s];

                const compound = this.och.makeCompound({ shapes: planes });
                intInputs.shapes.push(compound);

                const ints = this.och.intersection(intInputs);
                ints.forEach(int => {
                    if (int && !int.IsNull()) {
                        const transformedInt = this.och.align({
                            shape: int,
                            fromOrigin: [0, 0, 0],
                            fromDirection: [0, 1, 0],
                            toOrigin: [0, 0, 0],
                            toDirection: inputs.direction,
                        });
                        intersections.push(transformedInt);
                    }
                });
            });
        }
        const res = this.och.makeCompound({ shapes: intersections });
        return res;
    }

}
