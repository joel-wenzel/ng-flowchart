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

  destroy(recursive: boolean = true, checkCallbacks: boolean = true): boolean {

    if (!checkCallbacks || this.canDeleteStep()) {

      let parentIndex;
      if (this.getParent()) {
        parentIndex = this.getParent().removeChild(this);
      }

      this.destroy0(parentIndex, recursive);

      this.canvas.reRender();

      return true;
    }
    return false;


  }

  ngOnInit(): void {

  }

  canDrop(dropEvent: NgFlowchart.DropTarget): boolean {
    return true;
  }

  getDropPositionsForStep(pendingStep: DragStep): NgFlowchart.DropPosition[] {
    return ['BELOW', 'LEFT', 'RIGHT', 'ABOVE'];
  }

  private destroy0(parentIndex, recursive: boolean = true) {

    this.compRef.destroy();

    // //remove from master array
    let index = this.canvas.flow.allSteps.findIndex(ele => ele.id == this.id);
    if (index >= 0) {
      this.canvas.flow.allSteps.splice(index, 1);
    }

    

    if (this.hasChildren()) {

      //this was the root node
      if (this.isRootElement() && !recursive) {

        //set first child as new root
        this.canvas.flow.rootStep = this.getChildren()[0] as NgFlowchartStepComponent;
        this.getChildren()[0].setParent(null);

        //make previous siblings children of the new root
        if (this.hasChildren(2)) {
          for (let i = 1; i < this.getChildren().length; i++) {
            let child = this.getChildren()[i];
            this.getChildren()[0].addChild0(child);
          }
        }

      }

      //update children
      let length = this.getChildren().length;
      for (let i = 0; i < length; i++) {
        let child = this.getChildren()[0];
        if (recursive) {
          (child as NgFlowchartStepComponent).destroy0(null, true);
        }
        else if (!!this.getParent()) {
          this.getParent().addChildSibling0(child, i + parentIndex);
        }
      }
      this.setChildren([]);
    }



    // this.parent = null;

  }

}
