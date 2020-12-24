import { Directive, ElementRef, HostListener, ViewContainerRef } from '@angular/core';
import { CONSTANTS } from './model/flowchart.constants';
import { NgFlowchartCanvasService } from './ng-flowchart-canvas.service';


@Directive({
    selector: '[ngFlowchartCanvas]',
    providers: [
        NgFlowchartCanvasService
    ]
})
export class NgFlowchartCanvasDirective {

    @HostListener('drop', ['$event'])
    onDrop(event: DragEvent) {
        const type = event.dataTransfer.getData('type');
        if(type == 'FROM_PALETTE') {
            let data = JSON.parse(event.dataTransfer.getData('data')) || null;
            this.canvas.dropPaletteStep(event, data);
        }
        else if(type == 'FROM_CANVAS') {
            console.log('dropped from canvas');
        }
    }

    @HostListener('dragover', ['$event'])
    onDragOver(event: DragEvent) {
        event.preventDefault();
        this.canvas.onDragStep(event);

    }

    flow: HTMLElement[] = [];

    constructor(
        protected canvasEle: ElementRef<HTMLElement>, 
        private viewContainer: ViewContainerRef,
        private canvas: NgFlowchartCanvasService) 
    {
        this.canvasEle.nativeElement.classList.add(CONSTANTS.CANVAS_CLASS);
        this.canvas.init(this.viewContainer);

        this.createCanvasContent(this.viewContainer);
    }

    private createCanvasContent(viewContainer: ViewContainerRef) {
        let canvas = viewContainer.element.nativeElement as HTMLElement;
        let canvasContent = document.createElement('div');
        canvasContent.classList.add(CONSTANTS.CANVAS_CONTENT_CLASS);
        canvas.appendChild(canvasContent);
    }

}