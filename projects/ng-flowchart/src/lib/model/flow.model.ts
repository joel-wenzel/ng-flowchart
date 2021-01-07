import { TemplateRef, Type } from '@angular/core';
import { NgFlowchartCanvasService } from '../ng-flowchart-canvas.service';
import { NgFlowchartStepComponent } from '../ng-flowchart-step/ng-flowchart-step.component';

export namespace NgFlowchart {
    export class Flow {
        constructor(private canvas: NgFlowchartCanvasService) {

        }

        /**
         * Returns the json representation of this flow
         * @param indent Optional indent to specify for formatting
         */
        toJSON(indent?: number) {
            return JSON.stringify({
                root: this.canvas.flow.rootStep?.toJSON()
            }, null, indent);
        }

        /**
         * Create a flow and render it on the canvas from a json string
         * @param json The json string of the flow to render
         */
        async upload(json: string): Promise<void> {
            let root: any = JSON.parse(json).root;
            this.clear();

            await this.canvas.upload(root);
        }

        /**
         * Returns the root step of the flow chart
         */
        getRoot(): NgFlowchartStepComponent {
            return this.canvas.flow.rootStep;
        }

        /**
         * Finds a step in the flow chart by a given id
         * @param id Id of the step to find. By default, the html id of the step
         */
        getStep(id): NgFlowchartStepComponent {
            return this.canvas.flow.allSteps.find(child => child.id == id);
        }

        /**
         * Re-renders the canvas. Generally this should only be used in rare circumstances
         * @param pretty Attempt to recenter the flow in the canvas
         */
        render(pretty?: boolean) {
            this.canvas.reRender(pretty);
        }

        /**
         * Clears all flow chart, reseting the current canvas
         */
        clear() {
            if (this.canvas.flow?.rootStep) {
                this.canvas.flow.rootStep.destroy(true, false);
                this.canvas.reRender();
            }

        }

    }

    export class Options {
        /** The gap (in pixels) between flow steps*/
        stepGap?: number = 40;

        /** An inner deadzone radius (in pixels) that will not register the hover icon  */
        hoverDeadzoneRadius?: number = 20;

        /** Is the flow sequential? If true, then you will not be able to drag parallel steps */
        isSequential?: boolean = false;

        /** When true steps will not snap to 'pretty' positions and instead remain where dropped */
        rootPosition?: 'TOP_CENTER' | 'CENTER' | 'FREE' = 'TOP_CENTER';

        centerOnResize?: boolean = true;
    }

    export type DropEvent = {
        step: NgFlowchartStepComponent,
        parent?: NgFlowchartStepComponent,
        isMove: boolean
    }

    export type DropError = {
        step: PendingStep,
        parent?: NgFlowchartStepComponent,
        error: ErrorMessage
    }

    export type MoveError = {
        step: MoveStep,
        parent?: NgFlowchartStepComponent,
        error: ErrorMessage
    }

    export type ErrorMessage = {
        code?: string,
        message?: string
    }

      await this.canvas.upload(root);
    }

    export interface PendingStep extends Step {
        /**
         * An Ng-template containing the canvas content to be displayed.
         * Or a component type that extends NgFlowchartStepComponent
         */
        template: TemplateRef<any> | Type<NgFlowchartStepComponent>
    }

    export interface Step {
        /**
         * A unique string indicating the type of step this is.
         * This type will be used to register steps if you are uploading from json.
         */
        type: string,
        /**
         * Optional data to give the step. Typically configuration data that users can edit on the step.
         */
        data?: any
    }



    export type DropTarget = {
        step: NgFlowchartStepComponent,
        position: DropPosition
    }

    export type DropStatus = 'SUCCESS' | 'PENDING' | 'FAILED';
    export type DropPosition = 'RIGHT' | 'LEFT' | 'BELOW' | 'ABOVE';

    export type Callbacks = {
        
        /**
         * Called when user drops a new step from the palette or moves an existing step
         */
        onDropStep?: (drop: DropEvent) => void;

        /**
         * Called when a new step fails to drop on the canvas
         */
        onDropError?: (drop: DropError) => void;

        /**
         * Called when an existing step fails to move
         */
        onMoveError?: (drop: MoveError) => void;
    };
}
