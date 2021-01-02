import { Injectable } from '@angular/core';
import { NgFlowchart } from '../model/flow.model';
import { NgFlowchartAbstractStep } from '../ng-flowchart-step/ng-flowchart-abstract-step';

export class CanvasData {
    rootStep: NgFlowchartAbstractStep;
    allSteps: NgFlowchartAbstractStep[] = [];

    constructor() {

    }
}

@Injectable()
export class CanvasDataService {

    private data: CanvasData = new CanvasData();

    constructor() {
        window['canvas'] = this.data;
    }

    get allSteps() {
        return this.data.allSteps;
    }

    get root() {
        return this.data.rootStep;
    }

    hasRoot() {
        return !!this.data.rootStep;
    }

    setRoot(step: NgFlowchartAbstractStep, force: boolean = true) {
        if (this.hasRoot()) {
            if (!force) {
                console.warn('Already have a root and force is false');
                return;
            }

            //reparent root
            let oldRoot = this.data.rootStep;
            this.data.rootStep = step;
            step.addChild(oldRoot);
        }
        else {
            this.data.rootStep = step;
        }

        this.data.allSteps.push(step);

    }

    addStep(step: NgFlowchartAbstractStep, dropTarget: NgFlowchart.DropTarget, isMove = false): boolean {

        let added = false;

        switch (dropTarget.position) {
            case 'ABOVE':
                added = this.placeStepAbove(step, dropTarget.step);
                break;
            case 'BELOW':
                added = this.placeStepBelow(step, dropTarget.step);
                break;
            case 'LEFT':
                added = this.placeStepAdjacent(step, dropTarget.step, true);
                break;
            case 'RIGHT':
                added = this.placeStepAdjacent(step, dropTarget.step, false);
                break;
            default:
                break;
        }

        if (!isMove && added) {
            this.data.allSteps.push(step);
        }
        return added;
    }

    private placeStepBelow(newStep: NgFlowchartAbstractStep, parentStep: NgFlowchartAbstractStep): boolean {
        return parentStep.addChild(newStep, {
            sibling: false
        })
    }

    private placeStepAdjacent(newStep: NgFlowchartAbstractStep, siblingStep: NgFlowchartAbstractStep, isLeft: boolean = true) {
        if (siblingStep.getParent()) {
            //find the adjacent steps index in the parents child array
            const adjacentIndex = siblingStep.getParent().getChildren().findIndex(child => child.nativeElement.id == siblingStep.nativeElement.id);
            siblingStep.getParent().addChild(newStep, {
                sibling: true,
                index: adjacentIndex + (isLeft ? 0 : 1)
            });
        }
        else {
            console.warn('Parallel actions must have a common parent');
            return false;
        }
        return true;
    }

    private placeStepAbove(newStep: NgFlowchartAbstractStep, childStep: NgFlowchartAbstractStep) {

        let adjParent = childStep.getParent();
        if (adjParent) {
            //we want to remove child and insert our newStep at the same index
            let index = adjParent.removeChild(childStep);
            newStep.addChild(childStep);
            //adjParent.addChild(newStep, index);
        }
        else { // new root node
            this.setRoot(newStep);
            newStep.addChild(childStep);
        }
        return true;
    }

    // private stepOnlyHasSingleChildren(newStep: NgFlowCanvas.CanvasElement) {
    //     if (newStep.hasNOrMoreChildren(2)) {
    //         return false;
    //     }
    //     else if (newStep.hasChildren()) {
    //         return this.stepOnlyHasSingleChildren(newStep.children[0]);
    //     }
    //     else return true;
    // }




}