import { EmbeddedViewRef, TemplateRef } from '@angular/core';
import { NgFlowchartCanvasService } from '../ng-flowchart-canvas.service';
import { NgFlowCanvas } from './canvas.model';

export namespace NgFlowchart {
    export class Flow {
        constructor(private canvas: NgFlowchartCanvasService) {

        }

        toJSON(): string {
            return JSON.stringify({
                name: this.canvas.canvasData.name,
                root: this.canvas.canvasData.rootElement?.getStepJSON()
            });
        }

        /**
         * Returns the root step of the flow chart
         */
        getRoot(): Step {
            return this.canvas.canvasData.rootElement?.getFlowStep();
        }

        /**
         * Finds a step in the flow chart by a given id
         * @param id 
         */
        getStep(id): Step {
            let ele = this.canvas.canvasData.allElements.find(child => child.html.id == id);
            if (ele) {
                return new Step(ele, this.canvas);
            }
            else return null;
        }

        /**
         * Re-renders the canvas. Generally this should only be used in rare circumstances
         */
        render() {
            this.canvas.reRender();
        }

        /**
         * Clears all flow chart, reseting the current canvas
         */
        clear() {
            if (this.canvas.canvasData?.rootElement) {
                this.canvas.canvasData.rootElement.destroy(true, false);
                this.canvas.reRender();
            }

        }

    }

    export class Step {
        private id: string;

        constructor(private canvasElement: NgFlowCanvas.CanvasElement, private canvas: NgFlowchartCanvasService) {
            this.id = canvasElement.html.id;
        }

        toJSON() {
            return {
                id: this.id,
                data: this.getData(),
                children: this.hasChildren() ? this.getChildren().map(child => {
                    return child.toJSON()
                }) : []
            }
        }

        /**
         * Returns the id of this step. This is the same as the html id of the element.
         * To make modifications to the view you can getElementById
         */
        getId() {
            return this.id;
        }

        /**
         * Returns the referenced data object passed via the ngFlowchartStepData input
         */
        getData() {
            return this.canvasElement.view.data;
        }

        /**
         * Returns the parent step. This can be null if this is the root node.
         */
        getParent(): Step | null {
            return this.canvasElement.parent?.getFlowStep();
        }

        hasChildren(): boolean {
            return this.canvasElement.children && this.canvasElement.children.length > 0;
        }

        isRootStep() {
            return !this.getParent();
        }

        /**
         * Returns all direct children of this step. 
         * To get all descendants you can recursively keep calling getChildren
         */
        getChildren(): Array<Step> {
            return this.canvasElement.children ? this.canvasElement.children.map(child => {
                return child.getFlowStep()
            }) : []
        }

        /**
         * Deletes this node from the tree. Returns true or false if delete was a success
         * @param recursive Should its children also be deleted? (default is false)
         */
        delete(recursive: boolean = false): boolean {
            let result = this.canvasElement.destroy(recursive);
            if (result) {
                this.canvas.reRender();
            }
            return result;
        }

        /**
         * Adds a direct child to this step
         * @param template Ng Template Ref containing the content to display
         * @param options Child options when adding
         */
        addChild(template: TemplateRef<any>, options?: AddChildOptions) {
            if (options && options.asSibling && this.canvasElement.hasChildren()) {
                let child;
                if (options.index > -1) {
                    child = this.canvasElement.children[options.index];
                    this.canvas.addStep(template, options.data, child, 'LEFT', null);
                }
                else {
                    child = this.canvasElement.children[this.canvasElement.children.length - 1];
                    this.canvas.addStep(template, options.data, child, 'RIGHT', null);
                }
            }
            else {
                this.canvas.addStep(template, options.data, this.canvasElement, 'BELOW', null);
            }

            this.canvas.reRender();
        }
    }

    export type AddChildOptions = {
        /** Optional data to pass to the step */
        data?: any,
        /** Should this child be added as a sibling of any existing children?  If false then existing children will be re-parented to this new child*/
        asSibling?: boolean,
        /** Optional index at which to create the child. By default the child will be pushed to the end */
        index?: number
    }

    export interface StepView extends EmbeddedViewRef<any> {
        data?: any
    }

    export class Options {
        /** The gap (in pixels) between flow steps*/
        stepGap?: number = 40;

        /** An inner deadzone radius (in pixels) that will not register the hover icon  */
        hoverDeadzoneRadius?: number = 20;

        /** Is the flow sequential? If true, then you will not be able to drag parallel steps */
        isSequential?: boolean = false;

        /** Should all children of a step be deleted along with the step. If false, the nodes will be reparented */
        recursiveDelete?: boolean = true;
    }

    export type DropEvent = {
        step: Step,
        adjacent?: Step,
        position?: DropPosition,
        status: DropStatus,
        error?: string
    }

    export type DropStatus = 'SUCCESS' | 'PENDING' | 'FAILED';
    export type DropPosition = 'RIGHT' | 'LEFT' | 'BELOW' | 'ABOVE';

    export type Callbacks = {
        canAddStep?: (dropCandidate: DropEvent) => boolean;
        canMoveStep?: (moveCandidate: DropEvent) => boolean;
        canDeleteStep?: (step: Step) => boolean;
        onDropError?: (drop: DropEvent) => void;

        //TODO
        onDropStep?: (drop: DropEvent) => void;
        onMoveStep?: (drop: DropEvent) => void;
    };
}




