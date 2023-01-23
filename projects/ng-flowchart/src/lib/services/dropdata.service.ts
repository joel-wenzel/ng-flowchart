import { Injectable } from '@angular/core';
import { NgFlowchart } from '../model/flow.model';

@Injectable({
  providedIn: 'root',
})
export class DropDataService {
  dragStep: NgFlowchart.PendingStep | NgFlowchart.MoveStep;
  dragConnector: NgFlowchart.Connector;
  constructor() {}

  public setDragStep(ref: NgFlowchart.PendingStep) {
    this.dragStep = ref;
  }

  public getDragStep() {
    return this.dragStep;
  }

  public setDragConnector(ref: NgFlowchart.Connector) {
    this.dragConnector = ref;
  }

  public getDragConnector() {
    return this.dragConnector;
  }
}
