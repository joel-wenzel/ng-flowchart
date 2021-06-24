import { ComponentFactoryResolver, ComponentRef, Injectable, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { NgFlowchart } from '../model/flow.model';
import { NgFlowchartCanvasService } from '../ng-flowchart-canvas.service';
import { NgFlowchartStepRegistry } from '../ng-flowchart-step-registry.service';
import { NgFlowchartStepComponent } from '../ng-flowchart-step/ng-flowchart-step.component';
import { DropDataService } from './dropdata.service';

/**
 * This service handles adding new steps to the canvas
 */
@Injectable()
export class StepManagerService {

  private viewContainer: ViewContainerRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private registry: NgFlowchartStepRegistry) {

  }

  public init(viewContainer: ViewContainerRef) {
    this.viewContainer = viewContainer;
  }

  public createFromRegistry(id: string, type: string, data: any, canvas: NgFlowchartCanvasService): ComponentRef<NgFlowchartStepComponent> {
    let templateComp = this.registry.getStepImpl(type);
    let compRef: ComponentRef<NgFlowchartStepComponent>;
    if (templateComp instanceof TemplateRef || templateComp instanceof Type) {
      compRef = this.create({
        template: templateComp,
        type: type,
        data: data
      }, canvas);
    }
    else {
      throw 'Invalid registry implementation found for type ' + type;
    }

    compRef.instance.setId(id);
    return compRef;
  }

  public create(pendingStep: NgFlowchart.PendingStep, canvas: NgFlowchartCanvasService): ComponentRef<NgFlowchartStepComponent> {
    let componentRef: ComponentRef<NgFlowchartStepComponent>;

    if (pendingStep.template instanceof TemplateRef) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(NgFlowchartStepComponent);
      componentRef = this.viewContainer.createComponent<NgFlowchartStepComponent>(factory);
      componentRef.instance.contentTemplate = pendingStep.template;
      
    }
    else {
      const factory = this.componentFactoryResolver.resolveComponentFactory(pendingStep.template);
      componentRef = this.viewContainer.createComponent<any>(factory);
    }
    
    componentRef.instance.data = JSON.parse(JSON.stringify(pendingStep.data));
    componentRef.instance.type = pendingStep.type;
    componentRef.instance.canvas = canvas;
    componentRef.instance.compRef = componentRef;
    componentRef.instance.init(
      componentRef.injector.get(DropDataService),
      componentRef.injector.get(ViewContainerRef),
      componentRef.injector.get(ComponentFactoryResolver)
    )
    

    return componentRef;
  }
}
