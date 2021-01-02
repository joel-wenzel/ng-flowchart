import { Injectable, TemplateRef, ViewContainerRef } from '@angular/core';
import { NgFlowchart } from './model/flow.model';
import { NgFlowchartStepComponent } from './ng-flowchart-step/ng-flowchart-step.component';
import { CanvasRendererService } from './services/canvas-renderer.service';
import { CanvasDataService } from './services/canvasdata.service';
import { DropDataService as DragService } from './services/dropdata.service';
import { OptionsService } from './services/options.service';
import { StepManagerService } from './services/step-manager.service';



@Injectable()
export class NgFlowchartCanvasService {

  viewContainer: ViewContainerRef;
  isDragging: boolean = false;

  currentDropTarget: NgFlowchart.DropTarget;

  constructor(
    private drag: DragService,
    private options: OptionsService,
    private data: CanvasDataService,
    private renderer: CanvasRendererService,
    private stepmanager: StepManagerService
  ) {


  }

  public init(view: ViewContainerRef) {
    this.viewContainer = view;
    this.renderer.init(view);
    this.stepmanager.init(view);
  }

  public moveStep(drag: DragEvent, id: any) {
    this.renderer.clearAllSnapIndicators();
    
    let step = this.data.allSteps.find(step => step.nativeElement.id === id);
    if (step.isRootElement()) {
      this.renderer.moveRoot(drag);
    }
    else if (this.currentDropTarget) {
      this.renderer.moveStep(step, this.currentDropTarget);
    }
  }

  public onDrop(drag: DragEvent) {
    this.renderer.clearAllSnapIndicators();


    if (this.data.hasRoot() && !this.currentDropTarget) {
      return;
    }
    let componentRef;
    if(this.drag.dragStep.template instanceof TemplateRef) {
      componentRef = this.stepmanager.createStepFromTemplate(this.drag.dragStep.template, this.drag.dragStep.data, NgFlowchartStepComponent);
    }
    else {
      componentRef = this.stepmanager.createStepFromComponent(this.drag.dragStep.template, this.drag.dragStep.data);
    }

    let sub = componentRef.instance.viewInit.subscribe(
      () => {
        const dropTarget = this.currentDropTarget || null;

        if (componentRef.instance.canDrop(dropTarget)) {
          this.renderer.renderDrop(componentRef, drag, dropTarget);
        }
        else {
          const i = this.viewContainer.indexOf(componentRef.hostView)
          this.viewContainer.remove(i);
        }

        sub.unsubscribe();
      }
    )
  }

  public onDragStart(drag: DragEvent) {

    this.isDragging = true;

    this.currentDropTarget = this.renderer.findAndShowClosestDrop(this.drag.dragStep, drag);
  }

  public onDragEnd(drag: DragEvent) {



  }


}
