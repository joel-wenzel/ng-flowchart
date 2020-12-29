import { Directive, ElementRef, HostListener, Input, OnInit, ViewContainerRef } from '@angular/core';
import { NgFlowchart } from './model/flow.model';
import { CONSTANTS } from './model/flowchart.constants';
import { NgFlowchartCanvasService } from './ng-flowchart-canvas.service';


@Directive({
    selector: '[ngFlowchartCanvas]',
    providers: [
        NgFlowchartCanvasService
    ]
})
export class NgFlowchartCanvasDirective implements OnInit {

    @HostListener('drop', ['$event'])
    protected onDrop(event: DragEvent) {
        const type = event.dataTransfer.getData('type');

        document.querySelectorAll('.' + CONSTANTS.CANVAS_STEP_CLASS).forEach(
            ele => ele.removeAttribute(CONSTANTS.DROP_HOVER_ATTR)
        );

        if (type == 'FROM_PALETTE') {
            this.canvas.dropPaletteStep(event);
        }
        else if (type == 'FROM_CANVAS') {
            this.canvas.dropCanvasStep(event, event.dataTransfer.getData('id'));
        }
    }

    @HostListener('dragover', ['$event'])
    protected onDragOver(event: DragEvent) {

        event.preventDefault();
        this.canvas.onDragStep(event);

    }

    _options: NgFlowchart.Options;
    _callbacks: NgFlowchart.Callbacks;

    @HostListener('window:resize', ['$event'])
    protected onResize(event) {
        this.canvas.reRender();
    }

    @Input('ngFlowchartCallbacks')
    set callbacks(callbacks: NgFlowchart.Callbacks) {
        this._callbacks = callbacks;
        if(!!this.canvas) {
            this.canvas.setCallbacks(this._callbacks);
        }
    }

    @Input('ngFlowchartOptions')
    set options(options: NgFlowchart.Options) {
        this._options = this.sanitizeOptions(options);
        if(!!this.canvas) {
            
            this.canvas.setOptions(this._options);
            this.canvas.reRender();
        }
    }



    constructor(
        protected canvasEle: ElementRef<HTMLElement>,
        private viewContainer: ViewContainerRef,
        private canvas: NgFlowchartCanvasService
    ) {
            
        this.canvasEle.nativeElement.classList.add(CONSTANTS.CANVAS_CLASS);
        this.createCanvasContent(this.viewContainer);


    }

    ngOnInit() {
        this.canvas.init(this.viewContainer);
    }

    private createCanvasContent(viewContainer: ViewContainerRef) {
        let canvasEle = viewContainer.element.nativeElement as HTMLElement;
        let canvasContent = document.createElement('div');
        canvasContent.classList.add(CONSTANTS.CANVAS_CONTENT_CLASS);
        canvasEle.appendChild(canvasContent);
    }

    private sanitizeOptions(options: NgFlowchart.Options) {
        const defaultOpts = new NgFlowchart.Options();
        
        options = {
            ...defaultOpts,
            ...options,
            theme: {
                ...defaultOpts.theme,
                ...options.theme
            }
        };
        
        options.stepGap = Math.max(options.stepGap, 20);
        options.hoverDeadzoneRadius = Math.abs(options.hoverDeadzoneRadius);
        return options;
    }

    public getFlow(): NgFlowchart.Flow {
        return new NgFlowchart.Flow(this.canvas);
    }

    public getFlowJSON(): string {
        return new NgFlowchart.Flow(this.canvas).toJSON();
    }

}