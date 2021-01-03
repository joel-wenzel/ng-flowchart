import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { NgFlowchart } from 'projects/ng-flowchart/src/lib/model/flow.model';
import { NgFlowchartCanvasDirective } from 'projects/ng-flowchart/src/public-api';
import { CustomStepComponent } from './custom-step/custom-step.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'workspace';

  callbacks: NgFlowchart.Callbacks = {};
  options: NgFlowchart.Options = {
    stepGap: 40,
    theme: {
      connectors: 'pink',
      dropIcon: 'blue'
    }
  }

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

  customOps = [
    {
      paletteName: 'Custom Step',
      component: CustomStepComponent,
      data: {
        name: 'Routing Block'
      }
    }
  ]

  

  @ViewChild(NgFlowchartCanvasDirective)
  canvasElement: NgFlowchartCanvasDirective;



  constructor(private change: ChangeDetectorRef) {
    // this.callbacks.canMoveStep = this.canMoveStep;
    // this.callbacks.canAddStep = this.canAddStep;


  }

  

  printFlowData() {
    console.log(this.canvasElement.getFlowJSON());
  }

  clearData() {
    this.canvasElement.getFlow().getRoot().addChild(CustomStepComponent, {
      sibling: false,
      data: {
        name: 'custom step'
      }
    })
 
  }

  stepGapChanged(event) {
    this.options = {
      ...this.options,
      stepGap: parseInt(event.target.value)
    };


  }

  onDelete(id) {
    this.canvasElement.getFlow().getStep(id).destroy(false);
  }
}
