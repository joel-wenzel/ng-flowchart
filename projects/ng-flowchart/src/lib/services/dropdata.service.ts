import { Injectable, TemplateRef, Type } from "@angular/core";
import { NgFlowchartStepComponent } from '../ng-flowchart-step/ng-flowchart-step.component';

export type DragStep = {
    template: TemplateRef<any> | Type<NgFlowchartStepComponent>,
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