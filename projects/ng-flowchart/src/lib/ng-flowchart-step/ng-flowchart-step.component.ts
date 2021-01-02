import { Component, Input, TemplateRef } from '@angular/core';
import { NgFlowchart } from '../model/flow.model';
import { DragStep } from '../services/dropdata.service';
import { NgFlowchartAbstractStep } from './ng-flowchart-abstract-step';

@Component({
  selector: 'ng-flowchart-step',
  templateUrl: './ng-flowchart-step.component.html',
  styleUrls: ['./ng-flowchart-step.component.scss']
})
export class NgFlowchartStepComponent extends NgFlowchartAbstractStep {
  canDeleteStep(): boolean {
    return true;
  }

  @Input()
  contentTemplate: TemplateRef<any>;

  
  ngOnInit(): void {
    
  }

  canDrop(dropEvent: NgFlowchart.DropTarget): boolean {
    return true;
  }

  getDropPositionsForStep(pendingStep: DragStep): NgFlowchart.DropPosition[] {
    return ['BELOW', 'LEFT', 'RIGHT', 'ABOVE'];
  }

}
