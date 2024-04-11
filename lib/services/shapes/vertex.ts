import { OpenCascadeInstance, TopoDS_Vertex, TopoDS_Shape, TopoDS_Compound } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs/inputs";

export class OCCTVertex {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    vertexFromPoint(inputs: Inputs.OCCT.PointDto): TopoDS_Vertex {
        return this.och.entitiesService.makeVertex(inputs.point);
    }

    verticesFromPoints(inputs: Inputs.OCCT.PointsDto): TopoDS_Vertex[] {
        return inputs.points.map(p => this.vertexFromPoint({ point: p }));
    }

    verticesCompoundFromPoints(inputs: Inputs.OCCT.PointsDto): TopoDS_Compound {
        const vertexes = this.verticesFromPoints(inputs);
        return this.och.converterService.makeCompound({ shapes: vertexes });
    }

    getVertices(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Vertex[] {
        return this.och.shapeGettersService.getVertices(inputs);
    }

    getVerticesAsPoints(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.verticesService.getVerticesAsPoints(inputs);
    }

    verticesToPoints(inputs: Inputs.OCCT.ShapesDto<TopoDS_Vertex>): Inputs.Base.Point3[] {
        return this.och.verticesService.verticesToPoints(inputs);
    }

    vertexToPoint(inputs: Inputs.OCCT.ShapeDto<TopoDS_Vertex>): Inputs.Base.Point3 {
        return this.och.converterService.vertexToPoint(inputs);
    }
}
