import { Injectable } from "@angular/core";
import { NgFlowchart } from '../model/flow.model';



@Injectable({
    providedIn: 'root'
})
export class DropDataService {

    dragStep: NgFlowchart.PendingStep | NgFlowchart.MoveStep;

    constructor() {
    }

    public setDragStep(ref: NgFlowchart.PendingStep) {
        this.dragStep = ref;
    }

    public getDragStep() {
        return this.dragStep;
    }
}