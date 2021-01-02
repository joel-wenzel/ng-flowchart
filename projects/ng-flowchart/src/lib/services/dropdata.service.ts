import { Injectable, TemplateRef, Type } from "@angular/core";
import { NgFlowchartAbstractStep } from '../ng-flowchart-step/ng-flowchart-abstract-step';

export type DragStep = {
    template: TemplateRef<any> | Type<NgFlowchartAbstractStep>,
    data: any
}

@Injectable({
    providedIn: 'root'
})
export class DropDataService {

    dragStep: DragStep;

    constructor() {

    }

    public setDragStep(ref: DragStep) {
        this.dragStep = ref;
    }

    public getDragStep() {
        return this.dragStep;
    }
}