import { GeomAbs_Shape, Geom_Surface, OpenCascadeInstance, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { Base } from "../../api/inputs/base-inputs";
import { OCCReferencedReturns } from "../../occ-referenced-returns";
import { ShapeGettersService } from "./shape-getters";
import { EntitiesService } from "./entities.service";
import { EnumService } from "./enum.service";
import { WiresService } from "./wires.service";
import { BooleansService } from "./booleans.service";
import { ConverterService } from "./converter.service";
import { FilletsService } from "./fillets.service";
import { TransformsService } from "./transforms.service";
import { VectorHelperService } from "../../api";

export class FacesService {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly occRefReturns: OCCReferencedReturns,
        private readonly entitiesService: EntitiesService,
        private readonly enumService: EnumService,
        private readonly shapeGettersService: ShapeGettersService,
        private readonly converterService: ConverterService,
        private readonly booleansService: BooleansService,
        private readonly wiresService: WiresService,
        private readonly transformsService: TransformsService,
        private readonly vectorService: VectorHelperService,
        public filletsService: FilletsService,
    ) { }

    createFaceFromWireOnFace(inputs: Inputs.OCCT.FaceFromWireOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Face {
        const result = this.entitiesService.bRepBuilderAPIMakeFaceFromWireOnFace(inputs.face, inputs.wire, inputs.inside);
        return result;
    }

    createFacesFromWiresOnFace(inputs: Inputs.OCCT.FacesFromWiresOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Face[] {
        const result = this.entitiesService.bRepBuilderAPIMakeFacesFromWiresOnFace(inputs.face, inputs.wires, inputs.inside);
        return result;
    }

    createFaceFromWire(inputs: Inputs.OCCT.FaceFromWireDto<TopoDS_Wire>): TopoDS_Face {
        let result: TopoDS_Face;
        if (this.enumService.getShapeTypeEnum(inputs.shape) !== Inputs.OCCT.shapeTypeEnum.wire) {
            throw new Error("Provided input shape is not a wire");
        }
        if (inputs.planar) {
            const wire = this.occ.TopoDS.Wire_1(inputs.shape);
            result = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, inputs.planar);
            wire.delete();
        } else {
            const Degree = 3;
            const NbPtsOnCur = 15;
            const NbIter = 2;
            const Anisotropie = false;
            const Tol2d = 0.00001;
            const Tol3d = 0.0001;
            const TolAng = 0.01;
            const TolCurv = 0.1;
            const MaxDeg = 8;
            const MaxSegments = 9;

            const bs = new this.occ.BRepFill_Filling(Degree, NbPtsOnCur, NbIter, Anisotropie, Tol2d, Tol3d, TolAng, TolCurv, MaxDeg, MaxSegments);
            const edges = this.shapeGettersService.getEdges(inputs);
            edges.forEach(e => {
                bs.Add_1(e, this.occ.GeomAbs_Shape.GeomAbs_C0 as GeomAbs_Shape, true);
            });
            bs.Build();
            if (!bs.IsDone()) {
                throw new Error("Could not create non planar face");
            }
            result = bs.Face();
            bs.delete();
            edges.forEach(e => e.delete());
        }

        return result;
    }



    getFaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.SurfaceProperties_1(inputs.shape, gprops, false, false);
        const area = gprops.Mass();
        gprops.delete();
        return area;
    }

    getFacesAreas(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): number[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return inputs.shapes.map(face => this.getFaceArea({ shape: face }));
    }

    getFaceCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): Base.Point3 {
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.SurfaceProperties_1(inputs.shape, gprops, false, false);
        const gppnt = gprops.CentreOfMass();
        const pt: Base.Point3 = [gppnt.X(), gppnt.Y(), gppnt.Z()];
        gprops.delete();
        gppnt.delete();
        return pt;
    }

    getFacesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): Base.Point3[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return inputs.shapes.map(face => this.getFaceCenterOfMass({ shape: face }));
    }

    filterFacePoints(inputs: Inputs.OCCT.FilterFacePointsDto<TopoDS_Face>): Base.Point3[] {
        const points = [];
        if (inputs.points.length > 0) {
            const classifier = new this.occ.BRepClass_FaceClassifier_1();
            inputs.points.forEach(pt => {
                const gpPnt = this.entitiesService.gpPnt(pt);
                classifier.Perform_2(inputs.shape, gpPnt, inputs.tolerance, inputs.useBndBox, inputs.gapTolerance);
                const top = classifier.State();
                const type = this.enumService.getTopAbsStateEnum(top);
                if (inputs.keepOn && type === Inputs.OCCT.topAbsStateEnum.on) {
                    points.push(pt);
                }
                if (inputs.keepIn && type === Inputs.OCCT.topAbsStateEnum.in) {
                    points.push(pt);
                }
                if (inputs.keepOut && type === Inputs.OCCT.topAbsStateEnum.out) {
                    points.push(pt);
                }
                if (inputs.keepUnknown && type === Inputs.OCCT.topAbsStateEnum.unknown) {
                    points.push(pt);
                }
                gpPnt.delete();
            });
            classifier.delete();
            return points;
        } else {
            return [];
        }
    }


    createSquareFace(inputs: Inputs.OCCT.SquareDto): TopoDS_Face {
        const squareWire = this.wiresService.createSquareWire(inputs);
        const faceMakerFromWire = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(squareWire, true);
        squareWire.delete();
        return faceMakerFromWire;
    }

    createRectangleFace(inputs: Inputs.OCCT.RectangleDto): TopoDS_Face {
        const rectangleWire = this.wiresService.createRectangleWire(inputs);
        const faceMakerFromWire = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(rectangleWire, true);
        rectangleWire.delete();
        return faceMakerFromWire;
    }

    createFaceFromMultipleCircleTanWires(inputs: Inputs.OCCT.FaceFromMultipleCircleTanWiresDto<TopoDS_Wire>): TopoDS_Shape {
        const circleWires = inputs.circles;
        const faces: TopoDS_Face[] = [];
        if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.allWithAll) {
            for (let i = 0; i < circleWires.length; i++) {
                for (let j = i + 1; j < circleWires.length; j++) {
                    const wire = this.wiresService.createWireFromTwoCirclesTan({
                        circle1: circleWires[i],
                        circle2: circleWires[j],
                        keepLines: Inputs.OCCT.twoSidesStrictEnum.outside,
                        circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside,
                        tolerance: inputs.tolerance,
                    });
                    const face = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, true);
                    faces.push(face);
                }
            }
        } else if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.inOrder) {
            for (let i = 0; i < circleWires.length - 1; i++) {
                const wire = this.wiresService.createWireFromTwoCirclesTan({
                    circle1: circleWires[i],
                    circle2: circleWires[i + 1],
                    keepLines: Inputs.OCCT.twoSidesStrictEnum.outside,
                    circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside,
                    tolerance: inputs.tolerance,
                });
                const face = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, true);
                faces.push(face);
            }
        } else if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.inOrderClosed) {
            for (let i = 0; i < circleWires.length; i++) {
                const wire = this.wiresService.createWireFromTwoCirclesTan({
                    circle1: circleWires[i],
                    circle2: circleWires[(i + 1) % circleWires.length],
                    keepLines: Inputs.OCCT.twoSidesStrictEnum.outside,
                    circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside,
                    tolerance: inputs.tolerance,
                });
                const face = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, true);
                faces.push(face);
            }
        }
        let result;
        if (inputs.unify) {
            result = this.booleansService.union({ shapes: faces, keepEdges: false });
        } else {
            result = this.converterService.makeCompound({ shapes: faces });
        }
        return result;
    }

    createFaceFromMultipleCircleTanWireCollections(inputs: Inputs.OCCT.FaceFromMultipleCircleTanWireCollectionsDto<TopoDS_Wire>): TopoDS_Shape {
        const listsOfCircles = inputs.listsOfCircles;

        const faces: TopoDS_Face[] = [];
        if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.allWithAll) {
            for (let i = 0; i < listsOfCircles.length; i++) {
                // lists of circles is a 2D array of circular wires
                const currentCirclesList = listsOfCircles[i];
                const nextCirclesList = listsOfCircles[(i + 1)];
                if (nextCirclesList) {
                    for (let j = 0; j < currentCirclesList.length; j++) {
                        for (let k = 0; k < nextCirclesList.length; k++) {
                            const circle1 = currentCirclesList[j];
                            const circle2 = nextCirclesList[k];
                            const wire = this.wiresService.createWireFromTwoCirclesTan({
                                circle1,
                                circle2,
                                keepLines: Inputs.OCCT.twoSidesStrictEnum.outside,
                                circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside,
                                tolerance: inputs.tolerance,
                            });
                            const face = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, true);
                            faces.push(face);
                        }
                    }
                } else {
                    break;
                }
            }
        } else if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.inOrder) {
            for (let i = 0; i < listsOfCircles.length; i++) {
                if (listsOfCircles[i].length !== listsOfCircles[0].length) {
                    throw new Error("All lists of circles must have the same length in order to use inOrder strategy.");
                }
            }
            for (let i = 0; i < listsOfCircles.length - 1; i++) {
                for (let j = 0; j < listsOfCircles[i].length; j++) {
                    const wire = this.wiresService.createWireFromTwoCirclesTan({
                        circle1: listsOfCircles[i][j],
                        circle2: listsOfCircles[i + 1][j],
                        keepLines: Inputs.OCCT.twoSidesStrictEnum.outside,
                        circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside,
                        tolerance: inputs.tolerance,
                    });
                    const face = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, true);
                    faces.push(face);
                }
            }
        } else if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.inOrderClosed) {
            // check if all lists are of the same length
            for (let i = 0; i < listsOfCircles.length; i++) {
                if (listsOfCircles[i].length !== listsOfCircles[0].length) {
                    throw new Error("All lists of circles must have the same length in order to use inOrderClosed strategy.");
                }
            }
            for (let i = 0; i < listsOfCircles.length - 1; i++) {
                for (let j = 0; j < listsOfCircles[i].length; j++) {
                    const wire = this.wiresService.createWireFromTwoCirclesTan({
                        circle1: listsOfCircles[i][j],
                        circle2: listsOfCircles[i + 1][j],
                        keepLines: Inputs.OCCT.twoSidesStrictEnum.outside,
                        circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside,
                        tolerance: inputs.tolerance,
                    });
                    const face = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, true);
                    faces.push(face);
                }
            }
            for (let i = 0; i < listsOfCircles.length; i++) {
                for (let j = 0; j < listsOfCircles[i].length; j++) {
                    const wire = this.wiresService.createWireFromTwoCirclesTan({
                        circle1: listsOfCircles[i][j],
                        circle2: listsOfCircles[i][(j + 1) % listsOfCircles[i].length],
                        keepLines: Inputs.OCCT.twoSidesStrictEnum.outside,
                        circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside,
                        tolerance: inputs.tolerance,
                    });
                    const face = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, true);
                    faces.push(face);
                }
            }
        }
        let result;
        if (inputs.unify) {
            result = this.booleansService.union({ shapes: faces, keepEdges: false });
        } else {
            result = this.converterService.makeCompound({ shapes: faces });
        }
        return result;
    }

    faceNormalOnUV(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>): Base.Vector3 {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const u = uMin + (uMax - uMin) * inputs.paramU;
        const v = vMin + (vMax - vMin) * inputs.paramV;
        const gpDir = this.entitiesService.gpDir([0, 1, 0]);
        this.occ.GeomLib.NormEstim(handle, this.entitiesService.gpPnt2d([u, v]), 1e-7, gpDir);
        if (face.Orientation_1() === this.occ.TopAbs_Orientation.TopAbs_REVERSED) {
            gpDir.Reverse();
        }
        const dir: Base.Vector3 = [gpDir.X(), gpDir.Y(), gpDir.Z()];
        gpDir.delete();
        handle.delete();
        return dir;
    }

    getUVBounds(face: TopoDS_Face): { uMin: number, uMax: number, vMin: number, vMax: number } {
        const uMin = { current: 0 };
        const uMax = { current: 0 };
        const vMin = { current: 0 };
        const vMax = { current: 0 };
        this.occRefReturns.BRepTools_UVBounds_1(face, uMin, uMax, vMin, vMax);
        return { uMin: uMin.current, uMax: uMax.current, vMin: vMin.current, vMax: vMax.current };
    }

    createFaceFromWires(inputs: Inputs.OCCT.FacesFromWiresDto<TopoDS_Wire>): TopoDS_Face {
        const result = this.entitiesService.bRepBuilderAPIMakeFaceFromWires(inputs.shapes, inputs.planar);
        return result;
    }

    createFaceFromWiresOnFace(inputs: Inputs.OCCT.FaceFromWiresOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Face {
        const result = this.entitiesService.bRepBuilderAPIMakeFaceFromWires(inputs.wires, false, inputs.face, inputs.inside);
        return result;
    }

    createFacesFromWires(inputs: Inputs.OCCT.FacesFromWiresDto<TopoDS_Wire>): TopoDS_Face[] {
        const result = inputs.shapes.map(shape => {
            return this.createFaceFromWire({ shape, planar: inputs.planar });
        });
        return result;
    }

    faceFromSurface(inputs: Inputs.OCCT.ShapeWithToleranceDto<Geom_Surface>) {
        const face = this.entitiesService.bRepBuilderAPIMakeFaceFromSurface(inputs.shape, inputs.tolerance) as TopoDS_Face;
        if (face.IsNull()) {
            face.delete();
            throw new Error("Could not construct a face from the surface. Check if surface is not infinite.");
        } else {
            return face;
        }
    }

    faceFromSurfaceAndWire(inputs: Inputs.OCCT.FaceFromSurfaceAndWireDto<Geom_Surface, TopoDS_Wire>) {
        const face = this.entitiesService.bRepBuilderAPIMakeFaceFromSurfaceAndWire(inputs.surface, inputs.wire, inputs.inside) as TopoDS_Face;
        if (face.IsNull()) {
            face.delete();
            throw new Error("Could not construct a face from the surface. Check if surface is not infinite.");
        } else {
            return face;
        }
    }

    getUMinBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        const face = inputs.shape;
        const { uMin } = this.getUVBounds(face);
        return uMin;
    }

    getUMaxBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        const face = inputs.shape;
        const { uMax } = this.getUVBounds(face);
        return uMax;
    }

    getVMinBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        const face = inputs.shape;
        const { vMin } = this.getUVBounds(face);
        return vMin;
    }

    getVMaxBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        const face = inputs.shape;
        const { vMax } = this.getUVBounds(face);
        return vMax;
    }

    subdivideToPointsControlled(inputs: Inputs.OCCT.FaceSubdivisionControlledDto<TopoDS_Face>): Base.Point3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const surface = handle.get();
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const points: Base.Point3[] = [];

        for (let i = 0; i < inputs.nrDivisionsU; i++) {
            const stepU = (uMax - uMin) / (inputs.nrDivisionsU - 1);
            const halfStepU = stepU / 2;
            const stepsU = stepU * i;

            for (let j = 0; j < inputs.nrDivisionsV; j++) {
                const stepV = (vMax - vMin) / (inputs.nrDivisionsV - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                let v = vMin + stepsV;
                v += (inputs.shiftHalfStepNthV && (i + inputs.shiftHalfStepVOffsetN) % inputs.shiftHalfStepNthV === 0) ? halfStepV : 0;
                let u = uMin + stepsU;
                u += (inputs.shiftHalfStepNthU && (j + inputs.shiftHalfStepUOffsetN) % inputs.shiftHalfStepNthU === 0) ? halfStepU : 0;
                const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
                surface.D0(u, v, gpPnt);
                const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];

                let shouldPush = true;
                if (i === 0 && inputs.removeStartEdgeNthU && (j + inputs.removeStartEdgeUOffsetN) % inputs.removeStartEdgeNthU === 0) {
                    shouldPush = false;
                } else if (i === inputs.nrDivisionsU - 1 && inputs.removeEndEdgeNthU && (j + inputs.removeEndEdgeUOffsetN) % inputs.removeEndEdgeNthU === 0) {
                    shouldPush = false;
                } else if (j === 0 && inputs.removeStartEdgeNthV && (i + inputs.removeStartEdgeVOffsetN) % inputs.removeStartEdgeNthV === 0) {
                    shouldPush = false;
                } else if (j === inputs.nrDivisionsV - 1 && inputs.removeEndEdgeNthV && (i + inputs.removeEndEdgeVOffsetN) % inputs.removeEndEdgeNthV === 0) {
                    shouldPush = false;
                }
                if (shouldPush) {
                    points.push(pt);
                }
                gpPnt.delete();
            }
        }
        handle.delete();
        return points;
    }

    subdivideToPoints(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Point3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const surface = handle.get();
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const points: Base.Point3[] = [];

        const uStartRemoval = inputs.removeStartEdgeU ? 1 : 0;
        const uEndRemoval = inputs.removeEndEdgeU ? 1 : 0;

        const vStartRemoval = inputs.removeStartEdgeV ? 1 : 0;
        const vEndRemoval = inputs.removeEndEdgeV ? 1 : 0;

        for (let i = 0 + uStartRemoval; i < inputs.nrDivisionsU - uEndRemoval; i++) {
            const stepU = (uMax - uMin) / (inputs.nrDivisionsU - 1);
            const halfStepU = stepU / 2;
            const stepsU = stepU * i;
            const u = uMin + (inputs.shiftHalfStepU ? halfStepU : 0) + stepsU;
            for (let j = 0 + vStartRemoval; j < inputs.nrDivisionsV - vEndRemoval; j++) {
                const stepV = (vMax - vMin) / (inputs.nrDivisionsV - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                const v = vMin + (inputs.shiftHalfStepV ? halfStepV : 0) + stepsV;
                const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
                surface.D0(u, v, gpPnt);
                const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
                points.push(pt);
                gpPnt.delete();
            }
        }
        handle.delete();
        return points;
    }

    subdivideToWires(inputs: Inputs.OCCT.FaceSubdivisionToWiresDto<TopoDS_Face>): TopoDS_Wire[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const surface = handle.get();
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);

        const params = [];
        const step = 1 / inputs.nrDivisions;
        for (let i = 0; i <= inputs.nrDivisions; i++) {
            const p = step * i;
            params.push(p);
        }

        if (inputs.removeStart) {
            params.shift();
        }
        if (inputs.removeEnd) {
            params.pop();
        }

        if (inputs.shiftHalfStep) {
            const halfStep = step / 2;
            params.forEach((p, i) => {
                params[i] = params[i] + halfStep;
            });
        }

        const wires: TopoDS_Wire[] = [];
        for (let i = 0; i < params.length; i++) {
            const param = params[i];
            const placedWire = this.placeWireOnParamSurface(inputs.isU, param, uMin, uMax, vMin, vMax, surface);
            wires.push(placedWire);
        }
        handle.delete();
        return wires;
    }

    subdivideToRectangleWires(inputs: Inputs.OCCT.FaceSubdivideToRectangleWiresDto<TopoDS_Face>): TopoDS_Wire[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const shapesToDelete = [];
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const surface = handle.get();
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);

        const paramsU = [];
        const stepU = 1 / inputs.nrRectanglesU;
        const halfStepU = stepU / 2;

        for (let i = 0; i < inputs.nrRectanglesU; i++) {
            const pU = stepU * i + halfStepU;
            paramsU.push(pU);
        }

        const paramsV = [];
        const stepV = 1 / inputs.nrRectanglesV;
        const halfStepV = stepV / 2;

        for (let i = 0; i < inputs.nrRectanglesV; i++) {
            const pV = stepV * i + halfStepV;
            paramsV.push(pV);
        }

        const scaleU = uMax - uMin;
        const scaleV = vMax - vMin;

        const wires = [];
        let currentScalePatternUIndex = 0;
        let currentScalePatternVIndex = 0;
        let currentInclusionPatternIndex = 0;
        let currentFilletPatternIndex = 0;

        // potentially each rectangle can have unique fillets and scale factors due to patterns applied
        // we can though optimise this by using cached rectangles to speed up the algorithm
        const cachedRectangles: { id: string, shape: TopoDS_Wire }[] = [];

        for (let i = 0; i < paramsU.length; i++) {
            for (let j = 0; j < paramsV.length; j++) {

                let scaleFromPatternU = 1;
                if (inputs.scalePatternU && inputs.scalePatternU.length > 0) {
                    scaleFromPatternU = inputs.scalePatternU[currentScalePatternUIndex];
                    currentScalePatternUIndex++;
                    if (currentScalePatternUIndex >= inputs.scalePatternU.length) {
                        currentScalePatternUIndex = 0;
                    }
                }

                let scaleFromPatternV = 1;
                if (inputs.scalePatternV && inputs.scalePatternV.length > 0) {
                    scaleFromPatternV = inputs.scalePatternV[currentScalePatternVIndex];
                    currentScalePatternVIndex++;
                    if (currentScalePatternVIndex >= inputs.scalePatternV.length) {
                        currentScalePatternVIndex = 0;
                    }
                }
                let include = true;
                if (inputs.inclusionPattern && inputs.inclusionPattern.length > 0) {
                    include = inputs.inclusionPattern[currentInclusionPatternIndex];
                    currentInclusionPatternIndex++;
                    if (currentInclusionPatternIndex >= inputs.inclusionPattern.length) {
                        currentInclusionPatternIndex = 0;
                    }
                }

                let fillet = 0;
                if (inputs.filletPattern && inputs.filletPattern.length > 0) {
                    fillet = inputs.filletPattern[currentFilletPatternIndex];
                    currentFilletPatternIndex++;
                    if (currentFilletPatternIndex >= inputs.filletPattern.length) {
                        currentFilletPatternIndex = 0;
                    }
                }

                if (include) {

                    const width = stepV * scaleFromPatternV;
                    const length = stepU * scaleFromPatternU;
                    const minForFillet = Math.min(width, length);
                    fillet = minForFillet / 2 * fillet;

                    const useRec = cachedRectangles.find(r => r.id === `${fillet}-${scaleFromPatternU}-${scaleFromPatternV}`)?.shape;

                    if (useRec) {
                        const translated = this.transformsService.translate({
                            shape: useRec,
                            translation: [paramsV[j] * scaleV + vMin, 0, paramsU[i] * scaleU + uMin],
                        });
                        const placedRec = this.wiresService.placeWire(translated, surface);
                        wires.push(placedRec);
                    } else {
                        const rectangle = this.wiresService.createRectangleWire({
                            width,
                            length,
                            center: [0, 0, 0],
                            direction: [0, 1, 0],
                        });

                        if (fillet > 0) {

                            const filletRectangle = this.filletsService.fillet2d({
                                shape: rectangle,
                                radius: fillet,
                            });

                            const scaledRec2 = this.transformsService.scale3d({
                                shape: filletRectangle,
                                center: [0, 0, 0],
                                scale: [scaleV, 1, scaleU],
                            });

                            const translated = this.transformsService.translate({
                                shape: scaledRec2,
                                translation: [paramsV[j] * scaleV + vMin, 0, paramsU[i] * scaleU + uMin],
                            });
                            shapesToDelete.push(rectangle);

                            const placedRec = this.wiresService.placeWire(translated, surface);
                            wires.push(placedRec);
                            cachedRectangles.push({ id: `${width}-${length}-${fillet}`, shape: scaledRec2 });
                        } else {
                            const placedRec = this.wiresService.placeWire(rectangle, surface);
                            wires.push(placedRec);
                            cachedRectangles.push({ id: `${width}-${length}-${fillet}`, shape: rectangle });
                        }
                    }
                }
            }
        }

        shapesToDelete.forEach(s => s.delete());

        return wires;
    }

    subdivideToRectangleHoles(inputs: Inputs.OCCT.FaceSubdivideToRectangleHolesDto<TopoDS_Face>): TopoDS_Face[] {
        // default should be smaller then 1 as that can't punch holes or create faces nicely.
        if (inputs.scalePatternU === undefined) {
            inputs.scalePatternU = [0.5];
        }
        if (inputs.scalePatternV === undefined) {
            inputs.scalePatternV = [0.5];
        }
        const wires = this.subdivideToRectangleWires(inputs);
        const faceWires = this.shapeGettersService.getWires({ shape: inputs.shape });
        const wireLengths = this.wiresService.getWiresLengths({ shapes: faceWires });
        const longestFaceWire = faceWires[wireLengths.indexOf(Math.max(...wireLengths))];

        const revWires = wires.map(wire => { return this.wiresService.reversedWire({ shape: wire }); });
        const listOfWires = [longestFaceWire, ...revWires];
        const newFace = this.createFaceFromWiresOnFace({ wires: listOfWires, face: inputs.shape, inside: true });

        // check if the normals are the same, if not reverse the face
        const normalOriginal = this.faceNormalOnUV({ shape: inputs.shape, paramU: 0, paramV: 0 });
        const normalNew = this.faceNormalOnUV({ shape: newFace, paramU: 0, paramV: 0 });

        let shouldReverse = false;
        if (this.vectorService.angleBetweenVectors(normalOriginal, normalNew) > 1e-7) {
            shouldReverse = true;
            newFace.Reverse();
        }

        let faces = [];
        if (inputs.holesToFaces) {
            faces = wires.map(wire => {
                return this.createFaceFromWireOnFace({ wire, face: inputs.shape, inside: true });
            });
            if (shouldReverse) {
                faces.forEach(f => f.Reverse());
            }
        }

        wires.forEach(w => w.delete());
        longestFaceWire.delete();
        revWires.forEach(w => w.delete());

        return [newFace, ...faces];
    }

    subdivideToNormals(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Point3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const points: Base.Point3[] = [];

        const uStartRemoval = inputs.removeStartEdgeU ? 1 : 0;
        const uEndRemoval = inputs.removeEndEdgeU ? 1 : 0;

        const vStartRemoval = inputs.removeStartEdgeV ? 1 : 0;
        const vEndRemoval = inputs.removeEndEdgeV ? 1 : 0;

        for (let i = 0 + uStartRemoval; i < inputs.nrDivisionsU - uEndRemoval; i++) {
            const stepU = (uMax - uMin) / (inputs.nrDivisionsU - 1);
            const halfStepU = stepU / 2;
            const stepsU = stepU * i;
            const u = uMin + (inputs.shiftHalfStepU ? halfStepU : 0) + stepsU;
            for (let j = 0 + vStartRemoval; j < inputs.nrDivisionsV - vEndRemoval; j++) {
                const stepV = (vMax - vMin) / (inputs.nrDivisionsV - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                const v = vMin + (inputs.shiftHalfStepV ? halfStepV : 0) + stepsV;
                const gpDir = this.entitiesService.gpDir([0, 1, 0]);
                const gpUv = this.entitiesService.gpPnt2d([u, v]);
                this.occ.GeomLib.NormEstim(handle, gpUv, 1e-7, gpDir);
                // Sometimes face gets reversed and its original surface is not reversed, thus we need to adjust for such situation.
                if (face.Orientation_1() === this.occ.TopAbs_Orientation.TopAbs_REVERSED) {
                    gpDir.Reverse();
                }
                const pt: Base.Point3 = [gpDir.X(), gpDir.Y(), gpDir.Z()];
                points.push(pt);
                gpDir.delete();
                gpUv.delete();
            }
        }
        handle.delete();
        return points;
    }

    wireAlongParam(inputs: Inputs.OCCT.WireAlongParamDto<TopoDS_Face>): TopoDS_Wire {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const surface = handle.get();
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const placedWire = this.placeWireOnParamSurface(inputs.isU, inputs.param, uMin, uMax, vMin, vMax, surface);
        handle.delete();
        return placedWire;
    }

    private placeWireOnParamSurface(isU: boolean, param: number, uMin: number, uMax: number, vMin: number, vMax: number, surface: Geom_Surface) {
        let paramToUse = param;

        let wire;
        if (isU) {
            paramToUse = uMin + (uMax - uMin) * param;
            wire = this.wiresService.createLineWire({
                start: [vMin, 0, paramToUse],
                end: [vMax, 0, paramToUse],
            });
        } else {
            paramToUse = vMin + (vMax - vMin) * param;
            wire = this.wiresService.createLineWire({
                start: [paramToUse, 0, uMin],
                end: [paramToUse, 0, uMax],
            });
        }

        const placedWire = this.wiresService.placeWire(wire, surface);
        wire.delete();
        return placedWire;
    }

    wiresAlongParams(inputs: Inputs.OCCT.WiresAlongParamsDto<TopoDS_Face>): TopoDS_Wire[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const surface = handle.get();
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);

        const wires: TopoDS_Wire[] = [];
        for (let i = 0; i < inputs.params.length; i++) {
            const param = inputs.params[i];
            const placedWire = this.placeWireOnParamSurface(inputs.isU, param, uMin, uMax, vMin, vMax, surface);
            wires.push(placedWire);
        }
        handle.delete();
        return wires;
    }

    subdivideToPointsOnParam(inputs: Inputs.OCCT.FaceLinearSubdivisionDto<TopoDS_Face>): Base.Point3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const surface = handle.get();
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const points: Base.Point3[] = [];
        const removeStart = inputs.removeStartPoint ? 1 : 0;
        const removeEnd = inputs.removeEndPoint ? 1 : 0;

        let param = inputs.param;

        if (inputs.isU) {
            param = uMin + (uMax - uMin) * param;
        } else {
            param = vMin + (vMax - vMin) * param;
        }
        for (let j = 0 + removeStart; j < inputs.nrPoints - removeEnd; j++) {
            let p;
            if (inputs.isU) {
                const stepV = (vMax - vMin) / (inputs.nrPoints - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                p = vMin + (inputs.shiftHalfStep ? halfStepV : 0) + stepsV;
            } else {
                const stepU = (uMax - uMin) / (inputs.nrPoints - 1);
                const halfStepU = stepU / 2;
                const stepsU = stepU * j;
                p = uMin + (inputs.shiftHalfStep ? halfStepU : 0) + stepsU;
            }
            const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
            if (inputs.isU) {
                surface.D0(param, p, gpPnt);
            } else {
                surface.D0(p, param, gpPnt);
            }
            const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
            points.push(pt);
            gpPnt.delete();
        }
        handle.delete();
        return points;
    }

    subdivideToUVOnParam(inputs: Inputs.OCCT.FaceLinearSubdivisionDto<TopoDS_Face>): Base.Point2[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const uvs: Base.Point2[] = [];
        const removeStart = inputs.removeStartPoint ? 1 : 0;
        const removeEnd = inputs.removeEndPoint ? 1 : 0;

        let param = inputs.param;
        if (inputs.isU) {
            param = uMin + (uMax - uMin) * param;
        } else {
            param = vMin + (vMax - vMin) * param;
        }
        for (let j = 0 + removeStart; j < inputs.nrPoints - removeEnd; j++) {
            let p;
            if (inputs.isU) {
                const stepV = (vMax - vMin) / (inputs.nrPoints - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                p = vMin + (inputs.shiftHalfStep ? halfStepV : 0) + stepsV;
            } else {
                const stepU = (uMax - uMin) / (inputs.nrPoints - 1);
                const halfStepU = stepU / 2;
                const stepsU = stepU * j;
                p = uMin + (inputs.shiftHalfStep ? halfStepU : 0) + stepsU;
            }
            let uv;
            if (inputs.isU) {
                uv = [param, p];
            } else {
                uv = [p, param];
            }
            uvs.push(uv);
        }
        return uvs;
    }

    subdivideToUV(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Point2[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);

        const uvs: Base.Point2[] = [];

        const uStartRemoval = inputs.removeStartEdgeU ? 1 : 0;
        const uEndRemoval = inputs.removeEndEdgeU ? 1 : 0;

        const vStartRemoval = inputs.removeStartEdgeV ? 1 : 0;
        const vEndRemoval = inputs.removeEndEdgeV ? 1 : 0;

        for (let i = 0 + uStartRemoval; i < inputs.nrDivisionsU - uEndRemoval; i++) {
            const stepU = (uMax - uMin) / (inputs.nrDivisionsU - 1);
            const halfStepU = stepU / 2;
            const stepsU = stepU * i;
            const u = uMin + (inputs.shiftHalfStepU ? halfStepU : 0) + stepsU;
            for (let j = 0 + vStartRemoval; j < inputs.nrDivisionsV - vEndRemoval; j++) {
                const stepV = (vMax - vMin) / (inputs.nrDivisionsV - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                const v = vMin + (inputs.shiftHalfStepV ? halfStepV : 0) + stepsV;
                uvs.push([u, v]);
            }
        }
        return uvs;
    }

    uvOnFace(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>): Base.Point2 {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const u = uMin + (uMax - uMin) * inputs.paramU;
        const v = vMin + (vMax - vMin) * inputs.paramV;
        return [u, v];
    }

    pointsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<TopoDS_Face>): Base.Point3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const surface = handle.get();
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const pts: Base.Point3[] = inputs.paramsUV.map(uv => {
            const u = uMin + (uMax - uMin) * uv[0];
            const v = vMin + (vMax - vMin) * uv[1];
            const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
            surface.D0(u, v, gpPnt);
            const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
            gpPnt.delete();
            return pt;
        });
        return pts;
    }

    normalsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<TopoDS_Face>): Base.Vector3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const nrmls: Base.Vector3[] = inputs.paramsUV.map(uv => {
            const u = uMin + (uMax - uMin) * uv[0];
            const v = vMin + (vMax - vMin) * uv[1];
            const gpDir = this.entitiesService.gpDir([0, 1, 0]);
            this.occ.GeomLib.NormEstim(handle, this.entitiesService.gpPnt2d([u, v]), 1e-7, gpDir);
            const pt = [gpDir.X(), gpDir.Y(), gpDir.Z()];
            gpDir.delete();
            return pt as Base.Vector3;
        });
        handle.delete();
        return nrmls;
    }

    pointOnUV(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>): Base.Point3 {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const surface = handle.get();
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const u = uMin + (uMax - uMin) * inputs.paramU;
        const v = vMin + (vMax - vMin) * inputs.paramV;
        const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
        surface.D0(u, v, gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        handle.delete();
        return pt;
    }

    normalOnUV(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>): Base.Vector3 {
        return this.faceNormalOnUV(inputs);
    }

    createPolygonFace(inputs: Inputs.OCCT.PolygonDto) {
        const wire = this.wiresService.createPolygonWire(inputs);
        const result = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, false);
        wire.delete();
        return result;
    }

}
