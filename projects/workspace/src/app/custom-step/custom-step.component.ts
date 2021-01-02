import { Component } from '@angular/core';
import { NgFlowchartAbstractStep } from 'projects/ng-flowchart/src/lib/ng-flowchart-step/ng-flowchart-abstract-step';
import { DragStep } from 'projects/ng-flowchart/src/lib/services/dropdata.service';
import { NgFlowchart } from 'projects/ng-flowchart/src/public-api';

@Component({
  selector: 'app-custom-step',
  templateUrl: './custom-step.component.html',
  styleUrls: ['./custom-step.component.scss']
})
export class CustomStepComponent extends NgFlowchartAbstractStep {
  
 
  ngOnInit(): void {
  }

  canDrop(dropEvent: NgFlowchart.DropTarget): boolean {
    return true;
  }

  canDeleteStep(): boolean {
    return true;
  }

  getDropPositionsForStep(pendingStep: DragStep): NgFlowchart.DropPosition[] {
    return ['ABOVE', 'BELOW', 'LEFT', 'RIGHT'];
  }

}
