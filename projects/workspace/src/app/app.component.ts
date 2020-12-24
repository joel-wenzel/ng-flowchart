import { Component } from '@angular/core';
import { NgFlowCanvas } from 'projects/ng-flowchart/src/lib/model/canvas.model';
import { NgFlowChart } from 'projects/ng-flowchart/src/lib/model/flow.model';

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

  

  constructor() {
    this.callbacks.canMoveStep = this.canMoveStep;
  }

  onClick(data) {
    console.log('12321321');
  }

  canMoveStep(movingElement: NgFlowCanvas.CanvasElement, target: NgFlowCanvas.CanvasElement, position: NgFlowCanvas.DropPosition): boolean {
    //TODO public elements/model that is returned here.
    //IE i dont want users calling 'addChild' etc.
    return true;
  }
}
