import { NgFlowchartCanvasService } from '../ng-flowchart-canvas.service';
import { NgFlowchart } from './flow.model';
import { CONSTANTS } from './flowchart.constants';

export namespace NgFlowCanvas {
    export class Canvas {
        name: string = 'Sample Flowchart';
        rootElement: CanvasElement;
        allElements: CanvasElement[] = [];

        constructor() {

        }

        findElement(id: string) {

        }
    }

    export class CanvasElement {
        view: NgFlowchart.StepView;
        html: HTMLElement;
        children?: Array<CanvasElement>;
        parent?: CanvasElement;

        private _isHoverTarget: boolean = true;

        constructor(view: NgFlowchart.StepView, private canvasRef: NgFlowchartCanvasService) {
            this.view = view;
            this.html = this.view.rootNodes[0] as HTMLElement;

            this.html.id = 's' + Date.now();
            this.html.setAttribute('draggable', 'true');
            this.html.classList.add(CONSTANTS.CANVAS_STEP_CLASS);
            view.detectChanges();

            this.html.ondragstart = this.onDragStart.bind(this);
        }

        private onDragStart(event: DragEvent) {
            this.hideTree();
            event.dataTransfer.setData('type', 'FROM_CANVAS');
            event.dataTransfer.setData('id', this.html.id);

        }

        getFlowStep(): NgFlowchart.Step {
            return new NgFlowchart.Step(this, this.canvasRef);
        }

        getStepJSON() {
            return new NgFlowchart.Step(this, this.canvasRef).toJSON();
        }

        isHoverTarget() {
            return this._isHoverTarget;
        }

        hideTree() {
            this._isHoverTarget = false;
            this.html.style.opacity = '.4';

            document.querySelectorAll(`.${this.html.id}.arrow`).forEach(
                ele => (ele as HTMLElement).style.opacity = '.2'
            )

            if (this.children) {
                this.children.forEach(child => {
                    child.hideTree();
                })
            }
        }

        showTree() {
            this._isHoverTarget = true;

            document.querySelectorAll(`.arrow.${this.html.id}`).forEach(
                ele => (ele as HTMLElement).style.opacity = '1'
            )

            this.html.style.opacity = '1';
            if (this.children) {
                this.children.forEach(child => {
                    child.showTree();
                })
            }
        }

        getNodeTreeWidth() {
            const currentNodeWidth = this.html.getBoundingClientRect().width;

            if (!this.children || this.children.length == 0) {
                return this.html.getBoundingClientRect().width;
            }

            let childWidth = this.children.reduce((childTreeWidth, child) => {
                return childTreeWidth += child.getNodeTreeWidth();
            }, 0)

            childWidth += this.canvasRef.options.stepGap * (this.children.length - 1);

            return Math.max(currentNodeWidth, childWidth);
        }

        isRootElement(): boolean {
            return !this.parent;
        }

        cancelDrag(): void {
            this.showTree();
        }

        setPosition(x, y): void {
            this.html.style.position = 'absolute';
            this.html.style.left = `${x}${Number.isFinite(x)? 'px' : ''}`;
            this.html.style.top = `${y}${Number.isFinite(y)? 'px' : ''}`;

        }

        addChild(child: CanvasElement, index?: number): void {
            if (!this.children) {
                this.children = [];
            }
            if (index == null) {
                this.children.push(child);
            }
            else {
                this.children.splice(index, 0, child);
            }

            //since we are adding a new child here, it is safe to force set the parent
            child.setParent(this, true);
        }

        removeChild(childToRemove: CanvasElement): number {
            if (!this.children) {
                return -1;
            }
            const i = this.children.findIndex(child => child.html.id == childToRemove.html.id);
            if (i > -1) {
                this.children.splice(i, 1);
            }

            return i;
        }

        setChildren(children: Array<CanvasElement>): void {
            this.children = children;
            this.children.forEach(child => {
                child.setParent(this, true);
            })
        }

        setParent(newParent: CanvasElement, force: boolean = false): void {
            if (this.parent && !force) {
                console.warn('This child already has a parent, use force if you know what you are doing');
                return;
            }
            this.parent = newParent;
        }

        hasChildren() {
            return this.children && this.children.length > 0;
        }

        hasNOrMoreChildren(numChildren) {
            return this.children && this.children.length >= numChildren;
        }

        destroy(recursive: boolean = true, checkCallbacks: boolean = true): boolean {

            if (this.canvasRef.callbacks.canDeleteStep && checkCallbacks) {
                if (!this.canvasRef.callbacks.canDeleteStep(this.getFlowStep())) {
                    //TODO show the cancel anim here
                    console.log('User override for delete');
                    return false;
                }
            }
            //remove parents child ref
            //only want to call this on the root of the delete
            let parentIndex;
            if (this.parent) {
                parentIndex = this.parent.removeChild(this);
            }

            this.destroy0(parentIndex, recursive);
            return true;
        }

        private destroy0(parentIndex, recursive: boolean = true) {

            this.view.destroy();
            //remove from master array
            let index = this.canvasRef.canvasData.allElements.findIndex(ele => ele.html.id == this.html.id);
            if (index >= 0) {
                this.canvasRef.canvasData.allElements.splice(index, 1);
            }

            if (this.hasChildren()) {

                //this was the root node
                if (!this.parent && !recursive) {

                    //set first child as new root
                    this.canvasRef.canvasData.rootElement = this.children[0];
                    this.children[0].parent = null;

                    //make previous siblings children of the new root
                    if (this.children.length > 1) {
                        for (let i = 1; i < this.children.length; i++) {
                            let child = this.children[i];
                            this.children[0].addChild(child);
                        }
                    }

                }

                //update children
                for (let i = 0; i < this.children.length; i++) {
                    let child = this.children[i];
                    if (recursive) {
                        child.destroy0(null, true);
                    }
                    else if (!!this.parent) {
                        this.parent.addChild(child, i + parentIndex);
                    }
                }
                this.children = [];
            }



            this.parent = null;
        }
    }



    export type CanvasPosition = {
        x: number,
        y: number
    }


}

