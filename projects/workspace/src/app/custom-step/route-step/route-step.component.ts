import { Component } from '@angular/core';
import { NgFlowchartStepComponent } from 'projects/ng-flowchart/src/lib/ng-flowchart-step/ng-flowchart-step.component';
import { DragStep } from 'projects/ng-flowchart/src/lib/services/dropdata.service';
import { NgFlowchart } from 'projects/ng-flowchart/src/public-api';

@Component({
  selector: 'app-route-step',
  templateUrl: './route-step.component.html',
  styleUrls: ['./route-step.component.scss']
})
export class RouteStepComponent extends NgFlowchartStepComponent {

  ngOnInit(): void {
  }

  getDropPositionsForStep(pendingStep: DragStep): NgFlowchart.DropPosition[] {    
    if(pendingStep?.template !== RouteStepComponent && !(pendingStep?.instance instanceof RouteStepComponent)) {
      return ['BELOW']
    }
    else {
      return ['LEFT', 'RIGHT'];
    }
    
  }

}
