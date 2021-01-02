import { ComponentFactoryResolver, ComponentRef, Injectable, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { NgFlowchartCanvasService } from '../ng-flowchart-canvas.service';
import { NgFlowchartStepComponent } from '../ng-flowchart-step/ng-flowchart-step.component';

/**
 * This service handles adding new steps to the canvas
 */
@Injectable({
  providedIn: 'root'
})
export class StepManagerService {

    private viewContainer: ViewContainerRef;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {

    }

    public init(viewContainer: ViewContainerRef) {
      this.viewContainer = viewContainer;
    }

    public createStepFromTemplate(template: TemplateRef<NgFlowchartStepComponent>, data: any, canvas: NgFlowchartCanvasService): ComponentRef<NgFlowchartStepComponent> {
      let componentRef;
  
      const factory = this.componentFactoryResolver.resolveComponentFactory(NgFlowchartStepComponent);
      componentRef = this.viewContainer.createComponent<NgFlowchartStepComponent>(factory);
      componentRef.instance.data = data;
      componentRef.instance.contentTemplate = template;
      componentRef.instance.canvas = canvas;
  
      return componentRef;
    }
  
    public createStepFromComponent(component: Type<NgFlowchartStepComponent>, data: any, canvas: NgFlowchartCanvasService): ComponentRef<NgFlowchartStepComponent> {
      let componentRef;
      const factory = this.componentFactoryResolver.resolveComponentFactory(component);
      componentRef = this.viewContainer.createComponent<any>(factory);
      componentRef.instance.data = data;
      componentRef.instance.canvas = canvas;
  
      return componentRef;
    }
    
}