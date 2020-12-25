import { Component, ViewChild } from '@angular/core';
import { NgFlowCanvas } from 'projects/ng-flowchart/src/lib/model/canvas.model';
import { NgFlowChart } from 'projects/ng-flowchart/src/lib/model/flow.model';
import { NgFlowchartCanvasDirective } from 'projects/ng-flowchart/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'workspace';

  callbacks: NgFlowChart.Callbacks = {};

  pluginOps = [
    'abc',
    '123'
  ]

  @ViewChild(NgFlowchartCanvasDirective)
  canvasElement: NgFlowchartCanvasDirective ;

  

  constructor() {
    this.callbacks.canMoveStep = this.canMoveStep;
    this.callbacks.canAddStep = this.canAddStep;
  }
  

  onClick(id) {
    this.canvasElement.deleteStep(id, false);
  }

  canMoveStep(movingElement: NgFlowCanvas.CanvasElement, target: NgFlowCanvas.CanvasElement, position: NgFlowCanvas.DropPosition): boolean {
    //TODO public elements/model that is returned here.
    //IE i dont want users calling 'addChild' etc.
    return true;
  }

  canAddStep(movingElement: NgFlowCanvas.CanvasElement, target: NgFlowCanvas.CanvasElement, position: NgFlowCanvas.DropPosition): boolean {
    return true;
  }
}
