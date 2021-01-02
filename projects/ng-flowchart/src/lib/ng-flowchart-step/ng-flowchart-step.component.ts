import { Component, Input, TemplateRef, Type, ViewEncapsulation } from '@angular/core';
import { NgFlowchart } from '../model/flow.model';
import { DragStep } from '../services/dropdata.service';
import { NgFlowchartAbstractStep } from './ng-flowchart-abstract-step';

export type AddChildOptions = {
  /** Should the child be added as a sibling to existing children, if false the existing children will be reparented to this new child.
   * Default is true.
   * */
  sibling?: boolean,
  /** The index of the child. Only used when sibling is true.
   * Defaults to the end of the child array. 
   */
  index?: number,

  /** Optional data to assign to the component */
  data?: any
}

@Component({
  selector: 'ng-flowchart-step',
  templateUrl: './ng-flowchart-step.component.html',
  styleUrls: ['./ng-flowchart-step.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NgFlowchartStepComponent extends NgFlowchartAbstractStep {
  canDeleteStep(): boolean {
    return true;
  }

  @Input()
  contentTemplate: TemplateRef<any>;


  /**
   * 
   * @param template 
   * @param options 
   */
  async addChild(template: TemplateRef<any> | Type<NgFlowchartStepComponent>, options?: AddChildOptions): Promise<NgFlowchartStepComponent | null> {

    let componentRef = await this.canvas.createStep(template, options?.data);
    this.canvas.addToCanvas(componentRef);
    if (options?.sibling) {
      this.addChildSibling0(componentRef.instance, options?.index);
    }
    else {
      this.addChild0(componentRef.instance);
    }

    this.canvas.flow.allSteps.push(componentRef.instance);

    this.canvas.reRender();

    return componentRef.instance;
  }

  ngOnInit(): void {

  }

  canDrop(dropEvent: NgFlowchart.DropTarget): boolean {
    return true;
  }

  getDropPositionsForStep(pendingStep: DragStep): NgFlowchart.DropPosition[] {
    return ['BELOW', 'LEFT', 'RIGHT', 'ABOVE'];
  }

}
