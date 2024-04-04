import { OpenCascadeInstance, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs/inputs";

export class OCCTBooleans {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    union(inputs: Inputs.OCCT.UnionDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.union(inputs);
    }

    difference(inputs: Inputs.OCCT.DifferenceDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.difference(inputs);
    }

    intersection(inputs: Inputs.OCCT.IntersectionDto<TopoDS_Shape>): TopoDS_Shape {
        const int = this.och.intersection(inputs);
        const res = this.och.makeCompound({ shapes: int });
        return res;
    }

}
