import { AfterViewInit, Directive, ElementRef, HostListener, Input, TemplateRef } from '@angular/core';
import { NgFlowchartDataService } from './ng-flowchart-data.service';


@Directive({
    selector: '[ngFlowchartStep]'
})
export class NgFlowchartStepDirective implements AfterViewInit {

    @HostListener('dragstart', ['$event'])
    onDragStart(event: DragEvent) {
        
        this.data.setActiveTemplate(this.flowStepCanvasContent);

        console.log(this.flowStepCanvasContent.elementRef);

        event.dataTransfer.setData('data', JSON.stringify(this.flowStepData));
        event.dataTransfer.setData('type', 'FROM_PALETTE');
    }

    @Input('ngFlowchartStep')
    flowStepCanvasContent: TemplateRef<any>;

    @Input('ngFlowchartStepData')
    flowStepData: Object;

    constructor(
        protected element: ElementRef<HTMLElement>,
        private data: NgFlowchartDataService
    ) {
        this.element.nativeElement.setAttribute('draggable', 'true');
    }

    ngAfterViewInit() {        
    }
}