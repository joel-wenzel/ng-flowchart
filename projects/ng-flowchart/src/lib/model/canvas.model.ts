import { NgFlowChart } from './flow.model';

export namespace NgFlowCanvas {
    export interface Canvas {
        name?: string;
        rootElement: CanvasElement;
        allElements: CanvasElement[];
    }

    export class CanvasElement {
        children?: Array<CanvasElement>;
        parent?: CanvasElement;

        /** Some elements such as loops and if blocks have their own canvas */
        childCanvas?: Canvas;

        constructor(public html: HTMLElement, public view: NgFlowChart.StepView) {}

        addChild(child: CanvasElement, index?: number) {
            if(!this.children) {
                this.children = [];
            }
            if(!index) {
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

        setChildren(children: Array<CanvasElement>) {
            this.children = children;
            this.children.forEach(child => {
                child.setParent(this, true);
            })
        }

        setParent(newParent: CanvasElement, force: boolean = false) {
            if(this.parent && !force) {
                console.warn('This child already has a parent, use force if you know what you are doing');
                return;
            }
            this.parent = newParent;
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

