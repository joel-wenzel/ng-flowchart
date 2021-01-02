import { ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { NgFlowchart } from '../model/flow.model';
import { CONSTANTS } from '../model/flowchart.constants';
import { NgFlowchartAbstractStep } from '../ng-flowchart-step/ng-flowchart-abstract-step';
import { CanvasDataService } from './canvasdata.service';
import { DragStep } from './dropdata.service';
import { OptionsService } from './options.service';

export type DropProximity = {
    step: NgFlowchartAbstractStep,
    position: NgFlowchart.DropPosition,
    proximity: number
};

@Injectable()
export class CanvasRendererService {
    private viewContainer: ViewContainerRef;

    constructor(
        private options: OptionsService,
        private data: CanvasDataService
    ) {

    }

    public init(viewContainer: ViewContainerRef) {
        this.viewContainer = viewContainer;
    }

    public renderDrop(step: ComponentRef<NgFlowchartAbstractStep>, dragEvent: DragEvent, dropTarget: NgFlowchart.DropTarget) {
        this.getCanvasContentElement().appendChild((step.location.nativeElement));

        const relativeXY = this.getRelativeXY(dragEvent);

        if (!this.data.hasRoot()) {
            //create root node
            this.setRootPosition(step, relativeXY[0], relativeXY[1]);
            this.data.setRoot(step.instance, false);
        }
        else {
            //everything else
            this.data.addStep(step.instance, dropTarget);
            this.render();
        }
    }

    public moveStep(step: NgFlowchartAbstractStep, dropTarget: NgFlowchart.DropTarget) {
        this.data.addStep(step, dropTarget, true);
        this.render();
    }

    public moveRoot(dragEvent: DragEvent) {
        const relativeXY = this.getRelativeXY(dragEvent);

        this.data.root.setPosition(relativeXY[0], relativeXY[1], true);
        // let rect = this.data.root.nativeElement.getBoundingClientRect();

        this.render();
    }

    private renderChildTree(rootNode: NgFlowchartAbstractStep, rootRect: Partial<DOMRect>, canvasRect: DOMRect) {
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

        rootNode.getChildren().forEach(child => {
            let totalChildWidth = child.getNodeTreeWidth(this.options.options.stepGap);
            childTreeWidths[child.nativeElement.id] = totalChildWidth;

            totalTreeWidth += totalChildWidth;
        });

        //add length for stepGaps between child trees
        totalTreeWidth += (rootNode.getChildren().length - 1) * this.options.options.stepGap;

        //if we have more than 1 child, we want half the extent on the left and half on the right
        let leftXTree = rootXCenter - (totalTreeWidth / 2);

        rootNode.getChildren().forEach(child => {
            
            let childExtent = childTreeWidths[child.nativeElement.id];

            let childLeft = leftXTree + (childExtent / 2) - (child.nativeElement.offsetWidth / 2);
            child.setPosition(childLeft, childYTop);    

            this.renderChildTree(child, child.getCurrentRect(canvasRect), canvasRect);
            leftXTree += childExtent + this.options.options.stepGap;
        })

    }

    private render() {
        if (!this.data.root) {
            return;
        }
        const canvasRect = this.getCanvasContentElement().getBoundingClientRect();
        this.renderChildTree(this.data.root, this.data.root.getCurrentRect(canvasRect), canvasRect);
    }

    private findDropLocationForHover(absMouseXY: number[], targetStep: NgFlowchartAbstractStep, droppingStep: DragStep): DropProximity | 'deadzone' | null {

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

    public findAndShowClosestDrop(dragStep: DragStep, event: DragEvent, init: boolean = false): NgFlowchart.DropTarget {
        if (!this.data.hasRoot()) {
            return;
        }

        //because we arent actually dropping anything just use absolute x,y for everything
        const absXY = [event.clientX, event.clientY];

        let bestMatch: DropProximity = null;

        //since this is called every tick just get this information once for a drag event
        //SEE if this is needed
        if (init) {

        }

        for (let i = 0; i < this.data.allSteps.length; i++) {

            const step = this.data.allSteps[i];

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
        this.data.allSteps.forEach(step => {
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

    public showSnaps(dragStep: DragStep) {


    }

    public clearAllSnapIndicators() {
        this.data.allSteps.forEach(
            step => step.clearHoverIcons()
        )
    }

    private setRootPosition(step: ComponentRef<NgFlowchartAbstractStep>, x, y) {
        switch (this.options.options.rootPosition) {
            case 'CENTER':
                const canvasCenter = this.getCanvasCenterPosition();
                step.instance.setPosition(canvasCenter[0], canvasCenter[1], true);
                return;
            case 'TOP_CENTER':
                const canvasTop = this.getCanvasTopCenterPosition();
                step.instance.setPosition(canvasTop[0], canvasTop[1], true)
                return;
            default:
                step.instance.setPosition(x, y, true);
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