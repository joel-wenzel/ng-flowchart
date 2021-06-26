import { Component, TemplateRef, ViewChild, HostListener } from '@angular/core';
import { NgFlowchart } from 'projects/ng-flowchart/src/lib/model/flow.model';
import { NgFlowchartStepRegistry } from 'projects/ng-flowchart/src/lib/ng-flowchart-step-registry.service';
import { NgFlowchartCanvasDirective } from 'projects/ng-flowchart/src/public-api';
import { CustomStepComponent } from './custom-step/custom-step.component';
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
    rootPosition: 'TOP_CENTER'
  }

  @ViewChild('normalStep')
  normalStepTemplate: TemplateRef<any>;

  sampleJson = '{"root":{"id":"s1624206175876","type":"nested-flow","data":{"name":"Nested Flow","nested":{"root":{"id":"s1624206177187","type":"log","data":{"name":"Log","icon":{"name":"log-icon","color":"blue"},"config":{"message":null,"severity":null}},"children":[{"id":"s1624206178618","type":"log","data":{"name":"Log","icon":{"name":"log-icon","color":"blue"},"config":{"message":null,"severity":null}},"children":[]},{"id":"s1624206180286","type":"log","data":{"name":"Log","icon":{"name":"log-icon","color":"blue"},"config":{"message":null,"severity":null}},"children":[]}]}}},"children":[{"id":"s1624206181654","type":"log","data":{"name":"Log","icon":{"name":"log-icon","color":"blue"},"config":{"message":null,"severity":null}},"children":[]}]}}';

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
  ]

  @ViewChild(NgFlowchartCanvasDirective)
  canvas: NgFlowchartCanvasDirective;
  disabled = false;
  scaleVal: number = 1;

  constructor(private stepRegistry: NgFlowchartStepRegistry) {
    this.callbacks.onDropError = this.onDropError;
    this.callbacks.onMoveError = this.onMoveError;
    this.callbacks.onDropStep = this.onDropStep;
  }

  ngAfterViewInit() {
    // this.stepRegistry.registerStep('rest-get', this.normalStepTemplate);
    this.stepRegistry.registerStep('log', this.normalStepTemplate);
    this.stepRegistry.registerStep('router', CustomStepComponent);
    this.stepRegistry.registerStep('nested-flow', NestedFlowComponent);

    document
      .querySelector('.ngflowchart-canvas-content')
      .addEventListener('wheel', this.zooming);
  }

  onDropStep = (dropEvent: NgFlowchart.DropEvent) => {
    this.scale();
  };

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
    this.resetZoom();
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
    this.scale();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scale();
  }

  zooming = (event) => {
    if (JSON.parse(this.canvas.getFlow().toJSON()).root) {
      event.preventDefault();
      this.scaleVal += event.deltaY * -0.001;
      this.scaleVal = Math.min(Math.max(0.125, this.scaleVal), 4);
      const canvasContent = document.querySelector('.ngflowchart-canvas-content');
      canvasContent['style'].transform = `scale(${this.scaleVal})`;
    }
  };

  scale() {
    if (this.scaleVal != 1) {
      const tempScale = this.scaleVal;
      this.scaleVal = 1;
      const canvasContent = document.querySelector('.ngflowchart-canvas-content');
      canvasContent['style'].opacity = 0;
      canvasContent['style'].transform = `scale(${this.scaleVal})`;
      this.canvas.getFlow().upload(this.canvas.getFlow().toJSON());
      setTimeout(() => {
        canvasContent['style'].transform = `scale(${tempScale})`;
        canvasContent['style'].opacity = 1;
        this.scaleVal = tempScale;
      }, 1);
    }
  }

  pretty() {
    this.resetZoom();
    this.canvas.getFlow().render(true);
  }

  resetZoom() {
    this.scaleVal = 1;
    const canvasContent = document.querySelector('.ngflowchart-canvas-content');
    canvasContent['style'].transform = `scale(${this.scaleVal})`;
  }

}
