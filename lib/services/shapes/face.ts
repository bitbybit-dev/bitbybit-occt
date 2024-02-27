import { GeomAbs_Shape, Geom_Surface, OpenCascadeInstance, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper, typeSpecificityEnum } from "../../occ-helper";
import * as Inputs from "../../api/inputs/inputs";
import { Base } from "../../api/inputs/inputs";

export class OCCTFace {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    createFaceFromWire(inputs: Inputs.OCCT.FaceFromWireDto<TopoDS_Wire>): TopoDS_Face {
        let result: TopoDS_Face;
        if (this.och.getShapeTypeEnum(inputs.shape) !== Inputs.OCCT.shapeTypeEnum.wire) {
            throw new Error("Provided input shape is not a wire");
        }
        if (inputs.planar) {
            const wire = this.occ.TopoDS.Wire_1(inputs.shape);
            result = this.och.bRepBuilderAPIMakeFaceFromWire(wire, inputs.planar);
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
            const edges = this.och.getEdges(inputs);
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

    createFaceFromWires(inputs: Inputs.OCCT.FacesFromWiresDto<TopoDS_Wire>): TopoDS_Face {
        const result = this.och.bRepBuilderAPIMakeFaceFromWires(inputs.shapes, inputs.planar);
        return result;
    }

    createFacesFromWires(inputs: Inputs.OCCT.FacesFromWiresDto<TopoDS_Wire>): TopoDS_Face[] {
        const result = inputs.shapes.map(shape => {
            return this.createFaceFromWire({ shape, planar: inputs.planar });
        });
        return result;
    }

    faceFromSurface(inputs: Inputs.OCCT.ShapeWithToleranceDto<Geom_Surface>) {
        const face = this.och.bRepBuilderAPIMakeFaceFromSurface(inputs.shape, inputs.tolerance) as TopoDS_Face;
        if (face.IsNull()) {
            face.delete();
            throw new Error("Could not construct a face from the surface. Check if surface is not infinite.");
        } else {
            return face;
        }
    }

    faceFromSurfaceAndWire(inputs: Inputs.OCCT.FaceFromSurfaceAndWireDto<Geom_Surface, TopoDS_Wire>) {
        const face = this.och.bRepBuilderAPIMakeFaceFromSurfaceAndWire(inputs.surface, inputs.wire, inputs.inside) as TopoDS_Face;
        if (face.IsNull()) {
            face.delete();
            throw new Error("Could not construct a face from the surface. Check if surface is not infinite.");
        } else {
            return face;
        }
    }

    getUMinBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        const face = inputs.shape;
        const { uMin } = this.och.getUVBounds(face);
        return uMin;
    }

    getUMaxBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        const face = inputs.shape;
        const { uMax } = this.och.getUVBounds(face);
        return uMax;
    }

    getVMinBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        const face = inputs.shape;
        const { vMin } = this.och.getUVBounds(face);
        return vMin;
    }

    getVMaxBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        const face = inputs.shape;
        const { vMax } = this.och.getUVBounds(face);
        return vMax;
    }

    subdivideToPointsControlled(inputs: Inputs.OCCT.FaceSubdivisionControlledDto<TopoDS_Face>): Base.Point3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const surface = handle.get();
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
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
                const gpPnt = this.och.gpPnt([0, 0, 0]);
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
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
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
                const gpPnt = this.och.gpPnt([0, 0, 0]);
                surface.D0(u, v, gpPnt);
                const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
                points.push(pt);
                gpPnt.delete();
            }
        }
        handle.delete();
        return points;
    }

    subdivideToNormals(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Point3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
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
                const gpDir = this.och.gpDir([0, 1, 0]);
                const gpUv = this.och.gpPnt2d([u, v]);
                this.occ.GeomLib.NormEstim(handle, gpUv, 1e-7, gpDir);
                const pt: Base.Point3 = [gpDir.X(), gpDir.Y(), gpDir.Z()];
                points.push(pt);
                gpDir.delete();
                gpUv.delete();
            }
        }
        handle.delete();
        return points;
    }

    subdivideToPointsOnParam(inputs: Inputs.OCCT.FaceLinearSubdivisionDto<TopoDS_Face>): Base.Point3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const surface = handle.get();
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
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
            const gpPnt = this.och.gpPnt([0, 0, 0]);
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
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
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
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);

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
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
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
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
        const pts: Base.Point3[] = inputs.paramsUV.map(uv => {
            const u = uMin + (uMax - uMin) * uv[0];
            const v = vMin + (vMax - vMin) * uv[1];
            const gpPnt = this.och.gpPnt([0, 0, 0]);
            surface.D0(u, v, gpPnt);
            const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
            gpPnt.delete();
            return pt;
        });
        surface.delete();
        return pts;
    }

    normalsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<TopoDS_Face>): Base.Vector3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool.Surface_2(face);
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
        const nrmls: Base.Vector3[] = inputs.paramsUV.map(uv => {
            const u = uMin + (uMax - uMin) * uv[0];
            const v = vMin + (vMax - vMin) * uv[1];
            const gpDir = this.och.gpDir([0, 1, 0]);
            this.occ.GeomLib.NormEstim(handle, this.och.gpPnt2d([u, v]), 1e-7, gpDir);
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
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
        const u = uMin + (uMax - uMin) * inputs.paramU;
        const v = vMin + (vMax - vMin) * inputs.paramV;
        const gpPnt = this.och.gpPnt([0, 0, 0]);
        surface.D0(u, v, gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        handle.delete();
        return pt;
    }

    normalOnUV(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>): Base.Vector3 {
        return this.och.faceNormalOnUV(inputs);
    }

    createPolygonFace(inputs: Inputs.OCCT.PolygonDto) {
        const wire = this.och.createPolygonWire(inputs);
        const result = this.och.bRepBuilderAPIMakeFaceFromWire(wire, false);
        wire.delete();
        return result;
    }

    createCircleFace(inputs: Inputs.OCCT.CircleDto): TopoDS_Face {
        return this.och.createCircle(inputs.radius, inputs.center, inputs.direction, typeSpecificityEnum.face) as TopoDS_Face;
    }

    createEllipseFace(inputs: Inputs.OCCT.EllipseDto): TopoDS_Face {
        return this.och.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, typeSpecificityEnum.face) as TopoDS_Face;
    }

    createSquareFace(inputs: Inputs.OCCT.SquareDto): TopoDS_Face {
        return this.och.createSquareFace(inputs);
    }

    createRectangleFace(inputs: Inputs.OCCT.RectangleDto): TopoDS_Face {
        return this.och.createRectangleFace(inputs);
    }

    getFace(inputs: Inputs.OCCT.ShapeIndexDto<TopoDS_Shape>): TopoDS_Face {
        if (!inputs.shape || inputs.shape.IsNull()) {
            throw new Error("Shape is not provided or is null");
        }
        const shapeType = this.och.getShapeTypeEnum(inputs.shape);
        if (shapeType === Inputs.OCCT.shapeTypeEnum.wire ||
            shapeType === Inputs.OCCT.shapeTypeEnum.edge ||
            shapeType === Inputs.OCCT.shapeTypeEnum.vertex) {
            throw (new Error("Shape is of incorrect type"));
        }
        if (!inputs.index) { inputs.index = 0; }
        let innerFace = {}; let facesFound = 0;
        this.och.forEachFace(inputs.shape, (i, s) => {
            if (i === inputs.index) { innerFace = this.occ.TopoDS.Face_1(s); } facesFound++;
        });
        if (facesFound < inputs.index || inputs.index < 0) {
            throw (new Error("Face index is out of range"));
        }
        else {
            return innerFace as TopoDS_Face;
        }
    }

    getFaces(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Face[] {
        return this.och.getFaces(inputs);
    }

    reversedFace(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): TopoDS_Face {
        const face = inputs.shape as TopoDS_Face;
        const reversed = face.Reversed();
        const result = this.och.getActualTypeOfShape(reversed);
        reversed.delete();
        return result;
    }

    getFaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.getFaceArea(inputs);
    }

    getFacesAreas(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): number[] {
        return this.och.getFacesAreas(inputs);
    }

    getFaceCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): Base.Point3 {
        return this.och.getFaceCenterOfMass(inputs);
    }

    getFacesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): Base.Point3[] {
        return this.och.getFacesCentersOfMass(inputs);
    }

    filterFacePoints(inputs: Inputs.OCCT.FilterFacePointsDto<TopoDS_Face>): Base.Point3[] {
        return this.och.filterFacePoints(inputs);
    }
}
