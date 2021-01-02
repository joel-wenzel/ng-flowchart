import { ComponentFactoryResolver, ComponentRef, Injectable, TemplateRef, Type, ViewContainerRef } from '@angular/core';

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

    public createStepFromTemplate(template: TemplateRef<any>, data: any, componentType: Type<any>): ComponentRef<any> {
      let componentRef;
  
      const factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
      componentRef = this.viewContainer.createComponent<any>(factory);
      componentRef.instance.data = data;
      componentRef.instance.contentTemplate = template;
  
      return componentRef;
    }
  
    public createStepFromComponent(component: Type<any>, data: any): ComponentRef<any> {
      let componentRef;
      const factory = this.componentFactoryResolver.resolveComponentFactory(component);
      componentRef = this.viewContainer.createComponent<any>(factory);
      componentRef.instance.data = data;
  
      return componentRef;
    }
    
}