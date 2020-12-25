import { Component, ViewChild } from '@angular/core';
import { NgFlowchart } from 'projects/ng-flowchart/src/lib/model/flow.model';
import { NgFlowchartCanvasDirective } from 'projects/ng-flowchart/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'workspace';

  callbacks: NgFlowchart.Callbacks = {};

  pluginOps = [
    {
      name: 'Do Action',
      inputs: []
    },
    {
      name: 'Router',
      condition: ''
    },
    {
      name: 'Notification',
      inputs: [
        {
          name: 'Address',
          value: null
        }
      ]
    }
  ]

  @ViewChild(NgFlowchartCanvasDirective)
  canvasElement: NgFlowchartCanvasDirective;



  constructor() {
    this.callbacks.canMoveStep = this.canMoveStep;
    this.callbacks.canAddStep = this.canAddStep;
  }


  onClick(id) {
    this.canvasElement.getFlow().getStep(id).delete();
   
  }

  canMoveStep(dropEvent: NgFlowchart.DropEvent): boolean {
    console.log(dropEvent);

    return true;
  }

  canAddStep(dropEvent: NgFlowchart.DropEvent): boolean {
    console.log(dropEvent);
    return true;
  }

  printFlowData() {
    console.log(this.canvasElement.getFlowJSON());    
  }
}
