import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NgFlowchart } from 'projects/ng-flowchart/src/lib/model/flow.model';
import { NgFlowchartStepRegistry } from 'projects/ng-flowchart/src/lib/ng-flowchart-step-registry.service';
import { NgFlowchartCanvasDirective } from 'projects/ng-flowchart/src/public-api';
import { JsonDel } from './app.model';
import { CustomStepComponent } from './custom-step/custom-step.component';
import { RouteStepComponent } from './custom-step/route-step/route-step.component';
import { FormStepComponent, MyForm } from './form-step/form-step.component';
import { NestedFlowComponent } from './nested-flow/nested-flow.component';

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
    rootPosition: 'TOP_START',
    zoom: { mode: 'WHEEL', defaultStep: .1 }
  };

  @ViewChild('normalStep')
  normalStepTemplate: TemplateRef<any>;

  sampleJson = JsonDel;

  items = [
    {
      name: 'Logger',
      type: 'log',
      data: {
        name: 'Log',
        icon: { name: 'log-icon', color: 'blue' },
        config: {
          message: null,
          severity: null
        }
      }
    }
  ];

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
    },
    {
      paletteName: 'Form Step',
      step: {
        template: FormStepComponent,
        type: 'form-step',
        data: '123'
      }
    },
    {
      paletteName: 'Nested Flow',
      step: {
        template: NestedFlowComponent,
        type: 'nested-flow',
        data: {
          name: 'Nested Flow'
        }
      }

    }
  ];



  @ViewChild(NgFlowchartCanvasDirective)
  canvas: NgFlowchartCanvasDirective;

  disabled = false;


  constructor(private stepRegistry: NgFlowchartStepRegistry) {

    this.callbacks.onDropError = this.onDropError;
    this.callbacks.onMoveError = this.onMoveError;
  }

  ngAfterViewInit() {
    // this.stepRegistry.registerStep('rest-get', this.normalStepTemplate);
    this.stepRegistry.registerStep('log', this.normalStepTemplate);
    this.stepRegistry.registerStep('router', CustomStepComponent);
    this.stepRegistry.registerStep('route-step', RouteStepComponent);
    this.stepRegistry.registerStep('nested-flow', NestedFlowComponent);
    this.stepRegistry.registerStep('form-step', FormStepComponent);

  }

  onDropError(error: NgFlowchart.DropError) {
  }

  onMoveError(error: NgFlowchart.MoveError) {
  }

  showUpload() {
    this.canvas.getFlow().upload(this.sampleJson);

  }

  showFlowData() {

    const json = this.canvas.getFlow().toJSON(4);

    const x = window.open();
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
    };
  }

  onDelete(id) {
    this.canvas.getFlow().getStep(id).destroy(true);
  }
}
