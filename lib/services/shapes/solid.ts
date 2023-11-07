import { OccHelper } from "../../occ-helper";
import { OpenCascadeInstance, TopoDS_Shape, TopoDS_Shell, TopoDS_Solid } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { Base } from "../../api/inputs/inputs";

export class OCCTSolid {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    fromClosedShell(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): TopoDS_Solid {
        const shell = this.och.getActualTypeOfShape(inputs.shape);
        const builder = new this.occ.BRepBuilderAPI_MakeSolid_3(shell);
        const result = builder.Solid();
        builder.delete();
        shell.delete();
        return result;
    }

    createBox(inputs: Inputs.OCCT.BoxDto): TopoDS_Solid {
        return this.och.bRepPrimAPIMakeBox(inputs.width, inputs.length, inputs.height, inputs.center);
    }

    createCube(inputs: Inputs.OCCT.CubeDto): TopoDS_Solid {
        return this.och.bRepPrimAPIMakeBox(inputs.size, inputs.size, inputs.size, inputs.center);
    }

    createBoxFromCorner(inputs: Inputs.OCCT.BoxFromCornerDto): TopoDS_Solid {
        const box = this.och.bRepPrimAPIMakeBox(inputs.width, inputs.length, inputs.height, inputs.corner);
        const cornerBox = this.och.translate({ shape: box, translation: [inputs.width / 2, inputs.height / 2, inputs.length / 2] });
        box.delete();
        return cornerBox;
    }

    createCylinder(inputs: Inputs.OCCT.CylinderDto): TopoDS_Solid {
        return this.och.bRepPrimAPIMakeCylinder(
            inputs.center,
            inputs.direction ? inputs.direction : [0., 1., 0.],
            inputs.radius,
            inputs.height
        );
    }

    createCylindersOnLines(inputs: Inputs.OCCT.CylindersOnLinesDto): TopoDS_Solid[] {
        const cylinders = inputs.lines.map(line => {
            return this.och.bRepPrimAPIMakeCylinderBetweenPoints(
                line.start,
                line.end,
                inputs.radius,
            );
        });
        return cylinders;
    }

    createSphere(inputs: Inputs.OCCT.SphereDto): TopoDS_Shape {
        return this.och.bRepPrimAPIMakeSphere(inputs.center, [0., 0., 1.], inputs.radius);
    }

    createCone(inputs: Inputs.OCCT.ConeDto): TopoDS_Shape {
        const ax = this.och.gpAx2(inputs.center, inputs.direction);
        const makeCone = new this.occ.BRepPrimAPI_MakeCone_4(ax, inputs.radius1, inputs.radius2, inputs.height, inputs.angle);
        const coneShape = makeCone.Shape();
        makeCone.delete();
        ax.delete();
        return coneShape;
    }

    getSolidSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        return this.och.getSolidSurfaceArea(inputs);
    }

    getSolidVolume(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        return this.och.getSolidVolume(inputs);
    }

    getSolidsVolumes(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): number[] {
        return this.och.getSolidsVolumes(inputs);
    }

    getSolidCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): Base.Point3 {
        return this.och.getSolidCenterOfMass(inputs);
    }

    getSolidsCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): Base.Point3[] {
        return this.och.getSolidsCentersOfMass(inputs);
    }

    getSolids(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Solid[] {
        return this.och.getSolids(inputs);
    }
}
