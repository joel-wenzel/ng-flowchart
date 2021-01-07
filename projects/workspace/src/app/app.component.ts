import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NgFlowchart } from 'projects/ng-flowchart/src/lib/model/flow.model';
import { NgFlowchartStepRegistry } from 'projects/ng-flowchart/src/lib/ng-flowchart-step-registry.service';
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

  sampleJson = '{"root":{"id":"s1609806130549","type":"rest-get","data":{"name":"REST Get","type":"rest-get","inputs":[]},"children":[{"id":"s1609806132473","type":"filter","data":{"name":"Filter","type":"filter","condition":""},"children":[]},{"id":"s1609899756883","type":"filter","data":{"name":"Filter","type":"filter","condition":""},"children":[{"id":"s1609899758149","type":"filter","data":{"name":"Filter","type":"filter","condition":""},"children":[{"id":"s1609899796612","type":"router","data":{"name":"Routing Block"},"children":[]}]},{"id":"s1609899760490","type":"filter","data":{"name":"Filter","type":"filter","condition":""},"children":[{"id":"s1609899794381","type":"rest-get","data":{"name":"REST Get","type":"rest-get","inputs":[]},"children":[]}]}]}]}}';

  pluginOps = [
    {
      name: 'REST Get',
      type: 'rest-get',
      inputs: []
    },
    {
      name: 'Filter',
      type: 'filter',
      condition: ''
    }

  ]

  customOps = [
    {
      paletteName: 'Router',
      step: {
        template: CustomStepComponent,
        type: 'router',
        data: {
          name: 'Routing Block'
        }
      }

    }
  ]



  @ViewChild(NgFlowchartCanvasDirective)
  canvas: NgFlowchartCanvasDirective;



  constructor(private stepRegistry: NgFlowchartStepRegistry) {

    this.callbacks.onDropError = this.onDropError;
    this.callbacks.onMoveError = this.onMoveError;
  }

  ngAfterViewInit() {
    this.stepRegistry.registerStep('rest-get', this.normalStepTemplate);
    this.stepRegistry.registerStep('filter', this.normalStepTemplate);
    this.stepRegistry.registerStep('router', CustomStepComponent);
  }

  onDropError(error: NgFlowchart.DropError) {
    console.log(error);
  }

  onMoveError(error: NgFlowchart.MoveError) {
    console.log(error);
  }

  showUpload() {
    this.canvas.getFlow().upload(this.sampleJson);
  }

  showFlowData() {

    let json = this.canvas.getFlow().toJSON(4);

    var x = window.open();
    x.document.open();
    x.document.write('<html><head><title>Flowchart Json</title></head><body><pre>' + json + '</pre></body></html>');
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
