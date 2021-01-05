import { Component } from '@angular/core';
import { NgFlowchartStepComponent } from 'projects/ng-flowchart/src/lib/ng-flowchart-step/ng-flowchart-step.component';
import { NgFlowchart } from 'projects/ng-flowchart/src/public-api';
import { RouteStepComponent } from './route-step/route-step.component';

@Component({
  selector: 'app-custom-step',
  templateUrl: './custom-step.component.html',
  styleUrls: ['./custom-step.component.scss']
})
export class CustomStepComponent extends NgFlowchartStepComponent {
  
  routes = [];

  ngOnInit(): void {
  }

  canDrop(dropEvent: NgFlowchart.DropTarget): boolean {
    return true;
  }

  canDeleteStep(): boolean {
    return true;
  }

  getDropPositionsForStep(pendingStep: NgFlowchart.PendingStep): NgFlowchart.DropPosition[] {
    if(pendingStep.template !== RouteStepComponent) {
      return ['ABOVE', 'LEFT', 'RIGHT'];
    }
    else {
      return ['BELOW'];
    }
  }

  onAddRoute() {
    let route = {
      name: 'New Route',
      condition: '',
      sequence: null
    }
    this.routes.push(route);
    this.addChild({
      template: RouteStepComponent,
      type: 'route-step',
      data: route
    }, {
      sibling: true
    });
  }

  delete() {
    this.destroy(true);
  }

}
