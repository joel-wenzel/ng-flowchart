import { ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { NgFlowchart } from '../model/flow.model';
import { CONSTANTS } from '../model/flowchart.constants';
import { NgFlowchartStepComponent } from '../ng-flowchart-step/ng-flowchart-step.component';
import { OptionsService } from './options.service';

export type DropProximity = {
    step: NgFlowchartStepComponent,
    position: NgFlowchart.DropPosition,
    proximity: number
};

@Injectable()
export class CanvasRendererService {
    private viewContainer: ViewContainerRef;

    constructor(
        private options: OptionsService
    ) {

    }

    public init(viewContainer: ViewContainerRef) {
        this.viewContainer = viewContainer;
    }

    public renderRoot(step: ComponentRef<NgFlowchartStepComponent>, dragEvent: DragEvent) {
        this.getCanvasContentElement().appendChild((step.location.nativeElement));
        const relativeXY = this.getRelativeXY(dragEvent);
        this.setRootPosition(step, relativeXY[0], relativeXY[1]);
    }

    public renderNonRoot(step: ComponentRef<NgFlowchartStepComponent>, dragEvent?: DragEvent) {
        this.getCanvasContentElement().appendChild((step.location.nativeElement));
    }

    public updatePosition(step: NgFlowchartStepComponent, dragEvent: DragEvent) {
        const relativeXY = this.getRelativeXY(dragEvent);
        step.zsetPosition(relativeXY, true);
    }

    private renderChildTree(rootNode: NgFlowchartStepComponent, rootRect: Partial<DOMRect>, canvasRect: DOMRect) {
        //the rootNode passed in is already rendered. just need to render its children /subtree

        if (!rootNode.hasChildren()) {
            return;
        }

        //top of the child row is simply the relative bottom of the root + stepGap
        const childYTop = (rootRect.bottom - canvasRect.top) + this.options.options.stepGap;
        const rootXCenter = (rootRect.left - canvasRect.left) + (rootRect.width / 2);

        //get the width of the child trees
        let childTreeWidths = {};
        let totalTreeWidth = 0;

        rootNode.children.forEach(child => {
            let totalChildWidth = child.getNodeTreeWidth(this.options.options.stepGap);
            childTreeWidths[child.nativeElement.id] = totalChildWidth;

            totalTreeWidth += totalChildWidth;
        });

        //add length for stepGaps between child trees
        totalTreeWidth += (rootNode.children.length - 1) * this.options.options.stepGap;

        //if we have more than 1 child, we want half the extent on the left and half on the right
        let leftXTree = rootXCenter - (totalTreeWidth / 2);

        rootNode.children.forEach(child => {

            let childExtent = childTreeWidths[child.nativeElement.id];

            let childLeft = leftXTree + (childExtent / 2) - (child.nativeElement.offsetWidth / 2);
            child.zsetPosition([childLeft, childYTop]);

            const currentChildRect = child.getCurrentRect(canvasRect);

            child.zdrawArrow(
                [rootXCenter, (rootRect.bottom - canvasRect.top)], 
                [currentChildRect.left + currentChildRect.width / 2, currentChildRect.top]
                );
                
            this.renderChildTree(child, currentChildRect, canvasRect);
            leftXTree += childExtent + this.options.options.stepGap;
        })

    }



    public render(root: NgFlowchartStepComponent) {
        if (!root) {
            return;
        }
        const canvasRect = this.getCanvasContentElement().getBoundingClientRect();
        this.renderChildTree(root, root.getCurrentRect(canvasRect), canvasRect);
    }

    private findDropLocationForHover(absMouseXY: number[], targetStep: NgFlowchartStepComponent, droppingStep: NgFlowchart.Step): DropProximity | 'deadzone' | null {

        const stepRect = targetStep.nativeElement.getBoundingClientRect();

        const yStepCenter = stepRect.bottom - stepRect.height / 2;
        const xStepCenter = stepRect.left + stepRect.width / 2;

        const yDiff = absMouseXY[1] - yStepCenter;
        const xDiff = absMouseXY[0] - xStepCenter;

        const absYDistance = Math.abs(yDiff);
        const absXDistance = Math.abs(xDiff);

        //#math class #Pythagoras
        const distance = Math.sqrt(absYDistance * absYDistance + absXDistance * absXDistance);
        const accuracyRadius = (stepRect.height + stepRect.width) / 2;

        let result: DropProximity | 'deadzone' | null = null;

        if (distance < accuracyRadius) {
            if (distance < this.options.options.hoverDeadzoneRadius) {
                //basically we are too close to the middle to accurately predict what position they want
                result = 'deadzone';
            }

            if (absYDistance > absXDistance) {
                result = {
                    step: targetStep,
                    position: yDiff > 0 ? 'BELOW' : 'ABOVE',
                    proximity: absYDistance
                };
            }
            else if (!this.options.options.isSequential && !targetStep.isRootElement()) {
                result = {
                    step: targetStep,
                    position: xDiff > 0 ? 'RIGHT' : 'LEFT',
                    proximity: absXDistance
                };
            }
        }

        if (result && result !== 'deadzone') {
            if (!targetStep.getDropPositionsForStep(droppingStep).includes(result.position)) {
                //we had a valid drop but the target step doesnt allow this location
                result = null;
            }
        }

        return result;
    }

    public findAndShowClosestDrop(dragStep: NgFlowchart.Step, event: DragEvent, steps: Array<NgFlowchartStepComponent>): NgFlowchart.DropTarget {
        if (!steps || steps.length == 0) {
            return;
        }

        //because we arent actually dropping anything just use absolute x,y for everything
        const absXY = [event.clientX, event.clientY];

        let bestMatch: DropProximity = null;

        for (let i = 0; i < steps.length; i++) {

            const step = steps[i];

            if (step.isHidden()) {
                continue;
            }

            const position = this.findDropLocationForHover(absXY, step, dragStep);
            if (position) {
                if (position == 'deadzone') {
                    bestMatch = null;
                    break;
                }
                //if this step is closer than previous best match then we have a new best
                else if (bestMatch == null || bestMatch.proximity > position.proximity) {
                    bestMatch = position;
                }
            }
        }

        //TODO make this more efficient. two loops
        steps.forEach(step => {
            if (bestMatch == null || step.nativeElement.id !== bestMatch.step.nativeElement.id) {

                step.clearHoverIcons();
            }
        })

        if (!bestMatch) {
            return;
        }

        bestMatch.step.showHoverIcon(bestMatch.position);

        return {
            step: bestMatch.step,
            position: bestMatch.position
        };
    }

    public showSnaps(dragStep: NgFlowchart.PendingStep) {


    }

    public clearAllSnapIndicators(steps: Array<NgFlowchartStepComponent>) {
        steps.forEach(
            step => step.clearHoverIcons()
        )
    }

    private setRootPosition(step: ComponentRef<NgFlowchartStepComponent>, x, y) {
        switch (this.options.options.rootPosition) {
            case 'CENTER':
                const canvasCenter = this.getCanvasCenterPosition();
                step.instance.zsetPosition(canvasCenter, true);
                return;
            case 'TOP_CENTER':
                const canvasTop = this.getCanvasTopCenterPosition();
                step.instance.zsetPosition(canvasTop, true)
                return;
            default:
                step.instance.zsetPosition([x, y], true);
                return;
        }
    }

    private getRelativeXY(dragEvent: DragEvent) {
        const canvasRect = this.getCanvasContentElement().getBoundingClientRect();

        return [
            dragEvent.clientX - canvasRect.left,
            dragEvent.clientY - canvasRect.top
        ]
    }

    private getCanvasTopCenterPosition() {
        const canvasRect = this.getCanvasContentElement().getBoundingClientRect();
        return [
            canvasRect.width / 2,
            100 //100 is a magic number somewhat. Should be getting from dropped element height instead
        ]
    }

    private getCanvasCenterPosition() {
        const canvasRect = this.getCanvasContentElement().getBoundingClientRect();
        return [
            canvasRect.width / 2,
            canvasRect.height / 2
        ]
    }

    private getCanvasContentElement(): HTMLElement {
        const canvas = this.viewContainer.element.nativeElement as HTMLElement;
        let canvasContent = canvas.getElementsByClassName(CONSTANTS.CANVAS_CONTENT_CLASS).item(0);
        return canvasContent as HTMLElement;
    }
}