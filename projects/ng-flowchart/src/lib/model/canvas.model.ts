import { NgFlowchartCanvasService } from '../ng-flowchart-canvas.service';
import { NgFlowChart } from './flow.model';
import { CONSTANTS } from './flowchart.constants';

export namespace NgFlowCanvas {
    export interface Canvas {
        name?: string;
        rootElement: CanvasElement;
        allElements: CanvasElement[];
    }

    export class CanvasElement {
        html: HTMLElement;
        children?: Array<CanvasElement>;
        parent?: CanvasElement;

        private _isHoverTarget: boolean = true;

        /** Some elements such as loops and if blocks have their own canvas */
        childCanvas?: Canvas;

        constructor(public view: NgFlowChart.StepView, private canvasRef: NgFlowchartCanvasService) {
            this.html = this.view.rootNodes[0] as HTMLElement;

            this.html.id = Date.now() + '';
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

        isHoverTarget() {
            return this._isHoverTarget;
        }

        hideTree() {
            this._isHoverTarget = false; 
            this.html.style.opacity = '.4';
            if(this.children) {
                this.children.forEach(child => {
                    child.hideTree();
                })
            }
        }

        showTree() {
            this._isHoverTarget = true;
            this.html.style.opacity = '1';
            if(this.children) {
                this.children.forEach(child => {
                    child.showTree();
                })
            }
        }

        isRootElement(): boolean {
            return !this.parent;
        }

        cancelDrag(): void {
            this.showTree();
        }

        setPosition(x, y): void {
            this.html.style.position = 'absolute';
            this.html.style.left = `${x}px`;
            this.html.style.top = `${y}px`;
            
        }

        addChild(child: CanvasElement, index?: number): void {
            if(!this.children) {
                this.children = [];
            }
            if(index == null) {
                this.children.push(child);
            }
            else {
                this.children.splice(index, 0, child);
            }

            //since we are adding a new child here, it is safe to force set the parent
            child.setParent(this, true);
        }

        removeChild(childToRemove: CanvasElement): number {
            if(!this.children) {
                return -1;
            }
            const i = this.children.findIndex(child => child.html.id == childToRemove.html.id);
            if(i > -1) {
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
            if(this.parent && !force) {
                console.warn('This child already has a parent, use force if you know what you are doing');
                return;
            }
            this.parent = newParent;
        }

        hasChildren() {
            return this.children && this.children.length > 0;
        }
    }

    export type DropPosition = 'RIGHT' | 'LEFT' | 'BELOW' | 'ABOVE';

    export type CanvasPosition = {
        x: number,
        y: number
    }

    export const emptyCanvas: Canvas = {
        name: 'New Canvas',
        rootElement: null,
        allElements: []
    }
}

