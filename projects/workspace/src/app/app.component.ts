import { Component, TemplateRef, ViewChild } from '@angular/core';
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

  @ViewChild('normalStep')
  normalStepTemplate: TemplateRef<any>;

  pluginOps = [
    {
      name: 'Do Action',
      inputs: []
    },
    {
      name: 'Router',
      condition: ''
    }
    
  ]

  wideOps = [
    {
      name: 'Wide Step',
      inputs: [
        {
          name: 'Address',
          value: null
        }
      ]
    }
  ]

  tallOps = [
    {
      name: 'Tall Step',
      inputs: []
    }
  ]

  @ViewChild(NgFlowchartCanvasDirective)
  canvasElement: NgFlowchartCanvasDirective;



  constructor() {
    this.callbacks.canMoveStep = this.canMoveStep;
    this.callbacks.canAddStep = this.canAddStep;
  }


  onDelete(id) {
    this.canvasElement.getFlow().getStep(id).delete();
   
  }

  onEdit(id) {
    let data = this.canvasElement.getFlow().getStep(id).getData();
    data.name = Date.now();
    data.inputs[0].value = Date.now();
  }

  canMoveStep(dropEvent: NgFlowchart.DropEvent): boolean {
    console.log(dropEvent);

    return true;
  }

  canAddStep(dropEvent: NgFlowchart.DropEvent): boolean {
    return true;
  }

  printFlowData() {
    console.log(this.canvasElement.getFlowJSON());    
  }

  clearData() {
    this.canvasElement.getFlow().clear();
  }

  addChild(id) {
    const options: NgFlowchart.AddChildOptions = {
      asSibling: true,
      data: {
        name: 'Do Action',
        inputs: []
      }
    }
    this.canvasElement.getFlow().getStep(id).addChild(this.normalStepTemplate, options);
  }

  addChildAtIndex(id) {
    const options: NgFlowchart.AddChildOptions = {
      asSibling: true,
      index: 0,
      data: {
        name: 'Do Action',
        inputs: []
      }
    }
    this.canvasElement.getFlow().getStep(id).addChild(this.normalStepTemplate, options);
  }
}
