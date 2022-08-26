import { Component } from '@angular/core';
import { NgFlowchartStepComponent } from 'projects/ng-flowchart/src/lib/ng-flowchart-step/ng-flowchart-step.component';
import { NgFlowchart } from 'projects/ng-flowchart/src/public-api';

@Component({
  selector: 'app-route-step',
  templateUrl: './route-step.component.html',
  styleUrls: ['./route-step.component.scss']
})
export class RouteStepComponent extends NgFlowchartStepComponent {

  ngOnInit(): void {
  }

  getDropPositionsForStep(step: NgFlowchart.Step): NgFlowchart.DropPosition[] {    
    if(step.type !== 'route-step') {
      return ['BELOW']
    }
    else {
      return ['LEFT', 'RIGHT'];
    }
    
  }

}
