import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgFlowchartArrowComponent } from './ng-flowchart-arrow/ng-flowchart-arrow.component';
import { NgFlowchartCanvasDirective } from './ng-flowchart-canvas.directive';
import { NgFlowchartStepDirective } from './ng-flowchart-step.directive';
import { NgFlowchartStepComponent } from './ng-flowchart-step/ng-flowchart-step.component';
import { NgFlowchartConnectorComponent } from './ng-flowchart-connector/ng-flowchart-connector.component';
import { NgFlowchartConnectorPadComponent } from './ng-flowchart-connector-pad/ng-flowchart-connector-pad.component';
import { NgFlowchartPadArrowComponent } from './ng-flowchart-pad-arrow/ng-flowchart-pad-arrow.component';

@NgModule({
  declarations: [
    NgFlowchartCanvasDirective,
    NgFlowchartStepDirective,
    NgFlowchartStepComponent,
    NgFlowchartArrowComponent,
    NgFlowchartConnectorComponent,
    NgFlowchartConnectorPadComponent,
    NgFlowchartPadArrowComponent,
  ],
  imports: [CommonModule],
  exports: [NgFlowchartCanvasDirective, NgFlowchartStepDirective],
})
export class NgFlowchartModule {}
