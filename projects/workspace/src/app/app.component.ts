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
    stepGap: 40
  }

  @ViewChild('normalStep')
  normalStepTemplate: TemplateRef<any>;

  sampleJson = '{"root":{"id":"s1609804611155","data":{"name":"Do Action","inputs":[]},"children":[{"id":"s1609804612230","data":{"name":"Do Action","inputs":[]},"children":[]}]}}';

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
  canvas: NgFlowchartCanvasDirective;



  constructor(private change: ChangeDetectorRef) {
    // this.callbacks.canMoveStep = this.canMoveStep;
    // this.callbacks.canAddStep = this.canAddStep;


  }

  showUpload() {
    this.canvas.getFlow().upload(this.sampleJson);
  }

  showFlowData() {

    let json = this.canvas.getFlow().toJSON(4);
    
    var x = window.open();
    x.document.open();
    x.document.write('<html><body><pre>' + json + '</pre></body></html>');
    x.document.close();

  }

  clearData() {
    this.canvas.getFlow().clear();

  }

  onGapChanged(event) {

    this.options = {
      ...this.options,
      stepGap: parseInt(event.target.value)
    };
  }

  onSequentialChange(event) {
    this.options = {
      ...this.options,
      isSequential: event.target.checked
    }
  }

  onDelete(id) {
    this.canvas.getFlow().getStep(id).destroy(true);
  }
}
