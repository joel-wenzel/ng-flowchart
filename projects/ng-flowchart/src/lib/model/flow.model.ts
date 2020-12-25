import { EmbeddedViewRef } from '@angular/core';
import { NgFlowCanvas } from './canvas.model';

export namespace NgFlowChart {
    export interface Flow {
        name?: string;
        steps: Step[];
    }

    export interface Step {
        id: string;
        name: string;
        data?: any;
        children?: Step[];
    }

    export interface StepView extends EmbeddedViewRef<any> {
        data?: any
    }

    export class Options {
        /** The gap (in pixels) between flow steps*/
        stepGap: number = 40;

        /** An inner deadzone radius (in pixels) that will not register the hover icon  */
        hoverDeadzoneRadius: number = 20;

        /** Is the flow sequential? If true, then you will not be able to drag parallel steps */
        isSequential: boolean = false;

        /** Should all children of a step be deleted along with the step. If false, the nodes will be reparented */
        recursiveDelete: boolean = true;
    }

    export type Callbacks = {
        canAddStep?: (movingElement: NgFlowCanvas.CanvasElement, targetElement: NgFlowCanvas.CanvasElement, position: NgFlowCanvas.DropPosition) => boolean;
        canMoveStep?: (movingElement: NgFlowCanvas.CanvasElement, targetElement: NgFlowCanvas.CanvasElement, position: NgFlowCanvas.DropPosition) => boolean;
        onDropError?: (element: NgFlowCanvas.CanvasElement, targetElement: NgFlowCanvas.CanvasElement, position: NgFlowCanvas.DropPosition) => void;
    };
}

    


