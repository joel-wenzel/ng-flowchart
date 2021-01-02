import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgFlowchartCanvasDirective } from './ng-flowchart-canvas.directive';
import { NgFlowchartStepDirective } from './ng-flowchart-step.directive';
import { NgFlowchartStepComponent } from './ng-flowchart-step/ng-flowchart-step.component';

@NgModule({
  declarations: [NgFlowchartCanvasDirective, NgFlowchartStepDirective, NgFlowchartStepComponent],
  imports: [
    CommonModule
  ],
  exports: [NgFlowchartCanvasDirective, NgFlowchartStepDirective]
})
export class NgFlowchartModule { }
