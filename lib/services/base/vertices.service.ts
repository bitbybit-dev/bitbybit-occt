import { OpenCascadeInstance, TopoDS_Shape, TopoDS_Vertex } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { ShapeGettersService } from "./shape-getters";

export class VerticesService {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly shapeGettersService: ShapeGettersService
    ) { }


    getVerticesAsPoints(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        const vertices = this.shapeGettersService.getVertices(inputs);
        return this.verticesToPoints({ shapes: vertices });
    }

    verticesToPoints(inputs: Inputs.OCCT.ShapesDto<TopoDS_Vertex>): Inputs.Base.Point3[] {
        return inputs.shapes.map(v => {
            const pt = this.occ.BRep_Tool.Pnt(v);
            const res = [pt.X(), pt.Y(), pt.Z()] as Inputs.Base.Point3;
            pt.delete();
            return res;
        });
    }

}
