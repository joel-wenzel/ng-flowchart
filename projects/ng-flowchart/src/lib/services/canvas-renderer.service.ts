import { ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { NgFlowchart } from '../model/flow.model';
import { CONSTANTS } from '../model/flowchart.constants';
import { CanvasFlow } from '../ng-flowchart-canvas.service';
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

    private scale: number = 1;
    private scaleDebounceTimer = null

    constructor(
        private options: OptionsService
    ) {

    }

    public init(viewContainer: ViewContainerRef) {
        this.viewContainer = viewContainer;
    }

    public renderRoot(step: ComponentRef<NgFlowchartStepComponent>, dragEvent?: DragEvent) {
        this.getCanvasContentElement().appendChild((step.location.nativeElement));
        this.setRootPosition(step.instance, dragEvent);
    }

    public renderNonRoot(step: ComponentRef<NgFlowchartStepComponent>, dragEvent?: DragEvent) {
        this.getCanvasContentElement().appendChild((step.location.nativeElement));
    }

    public updatePosition(step: NgFlowchartStepComponent, dragEvent: DragEvent) {
        let relativeXY = this.getRelativeXY(dragEvent);

        relativeXY = relativeXY.map(coord => coord / this.scale)
        step.zsetPosition(relativeXY, true);
    }

    private getStepGap() {
        return this.options.options.stepGap;
    }

    private renderChildTree(rootNode: NgFlowchartStepComponent, rootRect: Partial<DOMRect>, canvasRect: DOMRect) {
        //the rootNode passed in is already rendered. just need to render its children /subtree

        if (!rootNode.hasChildren()) {
            return;
        }

        //top of the child row is simply the relative bottom of the root + stepGap
        const childYTop = (rootRect.bottom - canvasRect.top * this.scale) + this.getStepGap();
  
        const rootWidth = rootRect.width / this.scale

        const rootXCenter = (rootRect.left - canvasRect.left) + (rootWidth / 2);


        //get the width of the child trees
        let childTreeWidths = {};
        let totalTreeWidth = 0;

        rootNode.children.forEach(child => {
            let totalChildWidth = child.getNodeTreeWidth(this.getStepGap());
            totalChildWidth = totalChildWidth / this.scale
            childTreeWidths[child.nativeElement.id] = totalChildWidth;

            totalTreeWidth += totalChildWidth;
        });

        //add length for stepGaps between child trees
        totalTreeWidth += (rootNode.children.length - 1) * this.getStepGap();

        //if we have more than 1 child, we want half the extent on the left and half on the right
        let leftXTree = rootXCenter - (totalTreeWidth / 2);

        rootNode.children.forEach(child => {

            let childExtent = childTreeWidths[child.nativeElement.id];

            let childLeft = leftXTree + (childExtent / 2) - (child.nativeElement.offsetWidth / 2);


            child.zsetPosition([childLeft, childYTop]);

            const currentChildRect = child.getCurrentRect(canvasRect);

            const childWidth = currentChildRect.width / this.scale
           
            child.zdrawArrow(
                [rootXCenter, (rootRect.bottom - canvasRect.top * this.scale)],
                [currentChildRect.left + childWidth / 2 - canvasRect.left, currentChildRect.top - canvasRect.top]
            );

            this.renderChildTree(child, currentChildRect, canvasRect);
            leftXTree += childExtent + this.getStepGap();
        })

    }


    public render(flow: CanvasFlow, pretty?: boolean) {
        if (!flow.hasRoot()) {
            return;
        }

        if (this.options.callbacks?.beforeRender) {
            this.options.callbacks.beforeRender()
        }

        const canvasRect = this.getCanvasContentElement().getBoundingClientRect();
        if (pretty) {
            //this will place the root at the top center of the canvas and render from there
            this.setRootPosition(flow.rootStep, null);
        }
        this.renderChildTree(flow.rootStep, flow.rootStep.getCurrentRect(canvasRect), canvasRect);

        this.adjustDimensions(flow, canvasRect);

        if (this.options.callbacks?.afterRender) {
            this.options.callbacks.afterRender()
        }
    }

    private adjustDimensions(flow: CanvasFlow, canvasRect: DOMRect) {

        // let maxRight = 0;
        // let maxBottom = 0;

        // //TODO this can be better
        // flow.steps.forEach(
        //     ele => {
        //         let rect = ele.getCurrentRect(canvasRect);
        //         maxRight = Math.max(rect.right, maxRight);
        //         maxBottom = Math.max(rect.bottom, maxBottom);
        //     }
        // );



        // const widthDiff = canvasRect.width - (maxRight - canvasRect.left);
        // if (widthDiff < 100) {
        //     this.getCanvasContentElement().style.minWidth = `${canvasRect.width + 200}px`;
        //     if (this.options.options.centerOnResize) {
        //         //if we add width, rerender canvas in the middle
        //         this.render(flow, true);
        //     }

        // }

        // const heightDiff = canvasRect.height - (maxBottom - canvasRect.top);
        // if (heightDiff < 100) {
        //     this.getCanvasContentElement().style.minHeight = `${canvasRect.height + 200}px`;
        // }

    }

    private findDropLocationForHover(absMouseXY: number[], targetStep: NgFlowchartStepComponent, stepToDrop: NgFlowchart.Step): DropProximity | 'deadzone' | null {

        if (!targetStep.shouldEvalDropHover(absMouseXY, stepToDrop)) {
            return 'deadzone'
        }

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
            if (!targetStep.getDropPositionsForStep(stepToDrop).includes(result.position)) {
                //we had a valid drop but the target step doesnt allow this location
                result = null;
            }
        }

        return result;
    }

    private findBestMatchForSteps(dragStep: NgFlowchart.Step, event: DragEvent, steps: ReadonlyArray<NgFlowchartStepComponent>): DropProximity | null {
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

        return bestMatch
    }

    public findAndShowClosestDrop(dragStep: NgFlowchart.Step, event: DragEvent, steps: ReadonlyArray<NgFlowchartStepComponent>): NgFlowchart.DropTarget {
        if (!steps || steps.length == 0) {
            return;
        }

        let bestMatch: DropProximity = this.findBestMatchForSteps(dragStep, event, steps);

        // TODO make this more efficient. two loops
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

    public clearAllSnapIndicators(steps: ReadonlyArray<NgFlowchartStepComponent>) {
        steps.forEach(
            step => step.clearHoverIcons()
        )
    }

    private setRootPosition(step: NgFlowchartStepComponent, dragEvent?: DragEvent) {

        if (!dragEvent) {
            const canvasTop = this.getCanvasTopCenterPosition(step.nativeElement);
            step.zsetPosition(canvasTop, true)
            return;
        }

        switch (this.options.options.rootPosition) {
            case 'CENTER':
                const canvasCenter = this.getCanvasCenterPosition();
                step.zsetPosition(canvasCenter, true);
                return;
            case 'TOP_CENTER':
                const canvasTop = this.getCanvasTopCenterPosition(step.nativeElement);
                step.zsetPosition(canvasTop, true)
                return;
            default:
                const relativeXY = this.getRelativeXY(dragEvent);
                step.zsetPosition(relativeXY, true);
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

    private getCanvasTopCenterPosition(htmlRootElement: HTMLElement) {
        const canvasRect = this.getCanvasContentElement().getBoundingClientRect();
        const rootElementHeight = htmlRootElement.getBoundingClientRect().height
        const yCoord = rootElementHeight / 2 + this.options.options.stepGap
        const scaleYOffset = (1 - this.scale) * 100
            
        return [
            canvasRect.width / (this.scale * 2),
            yCoord + scaleYOffset
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

    public resetScale(flow: CanvasFlow) {
        this.setScale(flow, 1)
    }

    public scaleUp(flow: CanvasFlow, step? : number) {
        const newScale = this.scale + (this.scale * step || this.options.options.zoom.defaultStep)
        this.setScale(flow, newScale)
       
    }

    public scaleDown(flow: CanvasFlow, step? : number) {
        const newScale = this.scale - (this.scale * step || this.options.options.zoom.defaultStep)
        this.setScale(flow, newScale)
    }

    public setScale(flow: CanvasFlow, scaleValue: number) {
        const minDimAdjust = `${1/scaleValue * 100}%`

        const canvasContent = this.getCanvasContentElement()

        canvasContent.style.transform = `scale(${scaleValue})`;
        canvasContent.style.minHeight = minDimAdjust
        canvasContent.style.minWidth = minDimAdjust
        canvasContent.style.transformOrigin = 'top left'
        canvasContent.classList.add('scaling')

        this.scale = scaleValue
        this.render(flow, true)

        if(this.options.callbacks?.afterScale) {
            this.options.callbacks.afterScale(this.scale)
        }
        
        this.scaleDebounceTimer && clearTimeout(this.scaleDebounceTimer)
        this.scaleDebounceTimer = setTimeout(() => {
            canvasContent.classList.remove('scaling')
        }, 300)

    }


}