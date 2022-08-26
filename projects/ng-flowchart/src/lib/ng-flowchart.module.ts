import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgFlowchartArrowComponent } from './ng-flowchart-arrow/ng-flowchart-arrow.component';
import { NgFlowchartCanvasDirective } from './ng-flowchart-canvas.directive';
import { NgFlowchartStepDirective } from './ng-flowchart-step.directive';
import { NgFlowchartStepComponent } from './ng-flowchart-step/ng-flowchart-step.component';

@NgModule({
  declarations: [NgFlowchartCanvasDirective, NgFlowchartStepDirective, NgFlowchartStepComponent, NgFlowchartArrowComponent],
  imports: [
    CommonModule
  ],
  exports: [NgFlowchartCanvasDirective, NgFlowchartStepDirective, NgFlowchartStepComponent, NgFlowchartArrowComponent]
})
export class NgFlowchartModule { }
