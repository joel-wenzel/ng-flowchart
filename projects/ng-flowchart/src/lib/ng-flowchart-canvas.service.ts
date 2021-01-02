import { ComponentRef, Injectable, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { NgFlowchart } from './model/flow.model';
import { NgFlowchartStepComponent } from './ng-flowchart-step/ng-flowchart-step.component';
import { CanvasRendererService } from './services/canvas-renderer.service';
import { DropDataService as DragService } from './services/dropdata.service';
import { OptionsService } from './services/options.service';
import { StepManagerService } from './services/step-manager.service';

export class CanvasFlow {
  rootStep: NgFlowchartStepComponent;
  allSteps: NgFlowchartStepComponent[] = [];

  hasRoot() {
    return !!this.rootStep;
  }

  constructor() {

  }
}

@Injectable()
export class NgFlowchartCanvasService {

  viewContainer: ViewContainerRef;
  isDragging: boolean = false;

  currentDropTarget: NgFlowchart.DropTarget;

  flow: CanvasFlow = new CanvasFlow();

  constructor(
    private drag: DragService,
    private options: OptionsService,
    private renderer: CanvasRendererService,
    private stepmanager: StepManagerService
  ) {
    window['flow'] = this.flow;

  }

  public init(view: ViewContainerRef) {
    this.viewContainer = view;
    this.renderer.init(view);
    this.stepmanager.init(view);

    //hack to load the css
    let ref = this.stepmanager.createStepFromComponent(NgFlowchartStepComponent, {}, this);
    const i = this.viewContainer.indexOf(ref.hostView)
    this.viewContainer.remove(i);
  }

  public moveStep(drag: DragEvent, id: any) {
    this.renderer.clearAllSnapIndicators(this.flow.allSteps);

    let step = this.flow.allSteps.find(step => step.nativeElement.id === id);
    if (step.isRootElement()) {
      this.renderer.updatePosition(step, drag);
      this.renderer.render(step);
    }
    else if (this.currentDropTarget) {
      this.addStepToFlow(step, this.currentDropTarget, true);
      this.renderer.render(this.flow.rootStep);
    }
  }

  public async onDrop(drag: DragEvent) {
    this.renderer.clearAllSnapIndicators(this.flow.allSteps);


    if (this.flow.hasRoot() && !this.currentDropTarget) {
      return;
    }

    let componentRef = await this.createStep(this.drag.dragStep.template, this.drag.dragStep.data);

    const dropTarget = this.currentDropTarget || null;

    if (componentRef.instance.canDrop(dropTarget)) {
      if (!this.flow.hasRoot()) {
        this.renderer.renderRoot(componentRef, drag);
        this.setRoot(componentRef.instance);
      }
      else {
        this.addChildStep(componentRef, dropTarget);
      }
    }
    else {
      const i = this.viewContainer.indexOf(componentRef.hostView)
      this.viewContainer.remove(i);
    }
  }

  public onDragStart(drag: DragEvent) {

    this.isDragging = true;

    this.currentDropTarget = this.renderer.findAndShowClosestDrop(this.drag.dragStep, drag, this.flow.allSteps);
  }


  public createStep(template: TemplateRef<any> | Type<NgFlowchartStepComponent>, data: any): Promise<ComponentRef<NgFlowchartStepComponent>> {
    let componentRef: ComponentRef<NgFlowchartStepComponent>;
    if (template instanceof TemplateRef) {
      componentRef = this.stepmanager.createStepFromTemplate(template, data, this);
    }
    else {
      componentRef = this.stepmanager.createStepFromComponent(template, data, this);
    }
    return new Promise((resolve) => {
      let sub = componentRef.instance.viewInit.subscribe(() => {
        sub.unsubscribe();
        resolve(componentRef);
      })
    })
  }

  addChildStep(componentRef: ComponentRef<NgFlowchartStepComponent>, dropTarget: NgFlowchart.DropTarget) {
    this.addToCanvas(componentRef);
    this.addStepToFlow(componentRef.instance, dropTarget);
    this.renderer.render(this.flow.rootStep);
  }

  addToCanvas(componentRef: ComponentRef<NgFlowchartStepComponent>) {
    this.renderer.renderNonRoot(componentRef);
  }

  reRender() {
    this.renderer.render(this.flow.rootStep);
  }

  setRoot(step: NgFlowchartStepComponent, force: boolean = true) {
    if (this.flow.hasRoot()) {
      if (!force) {
        console.warn('Already have a root and force is false');
        return;
      }

      //reparent root
      let oldRoot = this.flow.rootStep;
      this.flow.rootStep = step;
      step.addChild0(oldRoot);
    }
    else {
      this.flow.rootStep = step;
    }

    this.flow.allSteps.push(step);

  }

  addStepToFlow(step: NgFlowchartStepComponent, dropTarget: NgFlowchart.DropTarget, isMove = false): boolean {

    let added = false;

    switch (dropTarget.position) {
      case 'ABOVE':
        added = this.placeStepAbove(step, dropTarget.step);
        break;
      case 'BELOW':
        added = this.placeStepBelow(step, dropTarget.step);
        break;
      case 'LEFT':
        added = this.placeStepAdjacent(step, dropTarget.step, true);
        break;
      case 'RIGHT':
        added = this.placeStepAdjacent(step, dropTarget.step, false);
        break;
      default:
        break;
    }

    if (!isMove && added) {
      this.flow.allSteps.push(step);
    }
    return added;
  }

  private placeStepBelow(newStep: NgFlowchartStepComponent, parentStep: NgFlowchartStepComponent): boolean {
    return parentStep.addChild0(newStep)
  }

  private placeStepAdjacent(newStep: NgFlowchartStepComponent, siblingStep: NgFlowchartStepComponent, isLeft: boolean = true) {
    if (siblingStep.getParent()) {
      //find the adjacent steps index in the parents child array
      const adjacentIndex = siblingStep.getParent().getChildren().findIndex(child => child.nativeElement.id == siblingStep.nativeElement.id);
      siblingStep.getParent().addChildSibling0(newStep, adjacentIndex + (isLeft ? 0 : 1));
    }
    else {
      console.warn('Parallel actions must have a common parent');
      return false;
    }
    return true;
  }

  private placeStepAbove(newStep: NgFlowchartStepComponent, childStep: NgFlowchartStepComponent) {

    let adjParent = childStep.getParent();
    if (adjParent) {
      //we want to remove child and insert our newStep at the same index
      let index = adjParent.removeChild(childStep);
      newStep.addChild0(childStep);
      //adjParent.addChild(newStep, index);
    }
    else { // new root node
      this.setRoot(newStep);
      newStep.addChild0(childStep);
    }
    return true;
  }


}
