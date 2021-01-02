import { AfterViewInit, Directive, ElementRef, HostListener, Input, TemplateRef } from '@angular/core';
import { DropDataService } from './services/dropdata.service';


@Directive({
    selector: '[ngFlowchartStep]'
})
export class NgFlowchartStepDirective implements AfterViewInit {

    @HostListener('dragstart', ['$event'])
    onDragStart(event: DragEvent) {
        
        this.data.setDragStep({
            template: this.flowStepCanvasContent,
            data: this.flowStepData
        });

        //this.canvas.onDragStart(event);

        event.dataTransfer.setData('type', 'FROM_PALETTE');
    }

    @HostListener('dragend', ['$event'])
    onDragEnd(event: DragEvent) {
        
        this.data.setDragStep(null);
        //this.canvas.onDragEnd(event);
    }

    @Input('ngFlowchartStep')
    flowStepCanvasContent: TemplateRef<any> | any;

    @Input('ngFlowchartStepData')
    flowStepData: Object;

    constructor(
        protected element: ElementRef<HTMLElement>,
        private data: DropDataService
    ) {
        this.element.nativeElement.setAttribute('draggable', 'true');
    }

    ngAfterViewInit() {
    }
}