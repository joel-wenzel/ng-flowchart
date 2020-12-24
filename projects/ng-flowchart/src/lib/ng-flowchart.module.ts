import { NgModule } from '@angular/core';
import { NgFlowchartCanvasDirective } from './ng-flowchart-canvas.directive';
import { NgFlowchartStepDirective } from './ng-flowchart-step.directive';

@NgModule({
  declarations: [NgFlowchartCanvasDirective, NgFlowchartStepDirective],
  imports: [
  ],
  exports: [NgFlowchartCanvasDirective, NgFlowchartStepDirective]
})
export class NgFlowchartModule { }
