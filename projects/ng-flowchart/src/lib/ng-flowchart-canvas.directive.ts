import { Directive, ElementRef, HostBinding, HostListener, Input, OnInit, ViewContainerRef } from '@angular/core';
import { NgFlowchart } from './model/flow.model';
import { CONSTANTS } from './model/flowchart.constants';
import { NgFlowchartCanvasService } from './ng-flowchart-canvas.service';
import { CanvasRendererService } from './services/canvas-renderer.service';
import { OptionsService } from './services/options.service';



@Directive({
    selector: '[ngFlowchartCanvas]',
    providers: [
        NgFlowchartCanvasService,
        OptionsService,
        CanvasRendererService
    ]
})
export class NgFlowchartCanvasDirective implements OnInit {   

    @HostListener('drop', ['$event'])
    protected onDrop(event: DragEvent) {
        if (this._disabled) { return; }

        const type = event.dataTransfer.getData('type');
        if ('FROM_CANVAS' == type) {
            this.canvas.moveStep(event, event.dataTransfer.getData('id'));
        }
        else {
            this.canvas.onDrop(event);
        }

    }

    @HostListener('dragover', ['$event'])
    protected onDragOver(event: DragEvent) {
        event.preventDefault();
        if (this._disabled) { return; }
        this.canvas.onDragStart(event);
    }

    _options: NgFlowchart.Options;
    _callbacks: NgFlowchart.Callbacks;

    @HostListener('window:resize', ['$event'])
    protected onResize(event) {
        if (this._options.centerOnResize) {
            this.canvas.reRender(true);
        }

    }

    @Input('ngFlowchartCallbacks')
    set callbacks(callbacks: NgFlowchart.Callbacks) {
        this.optionService.setCallbacks(callbacks);
    }

    @Input('ngFlowchartOptions')
    set options(options: NgFlowchart.Options) {
        this.optionService.setOptions(options);
        this._options = this.optionService.options;
        this.canvas.reRender();

    }

    @Input('disabled')
    @HostBinding('attr.disabled')
    set disabled(val: boolean) {
        this._disabled = val !== false;
        if(this.canvas) {
            this.canvas._disabled = this._disabled;
        }
    }
    get disabled() {
        return this._disabled;
    }

    _disabled: boolean = false;

    constructor(
        protected canvasEle: ElementRef<HTMLElement>,
        private viewContainer: ViewContainerRef,
        private canvas: NgFlowchartCanvasService,
        private optionService: OptionsService
    ) {

        this.canvasEle.nativeElement.classList.add(CONSTANTS.CANVAS_CLASS);
        this.createCanvasContent(this.viewContainer);


    }

    ngOnInit() {
        this.canvas.init(this.viewContainer);

        if (!this._options) {
            this.options = new NgFlowchart.Options();
        }

        this.canvas._disabled = this._disabled;
    }

    private createCanvasContent(viewContainer: ViewContainerRef) {
        let canvasEle = viewContainer.element.nativeElement as HTMLElement;
        let canvasContent = document.createElement('div');
        canvasContent.id = CONSTANTS.CANVAS_CONTENT_ID;
        canvasContent.classList.add(CONSTANTS.CANVAS_CONTENT_CLASS);
        canvasEle.appendChild(canvasContent);
    }

    /**
     * Returns the Flow object representing this flow chart.
     */
    public getFlow() {
        return new NgFlowchart.Flow(this.canvas);
    }

    // /**
    //  * Sets the flow object from the given json string. Typically used to reload a saved flow.
    //  * @param flow -Json representation of the flow. See getFlowJSON()
    //  */
    // public setFlow(flow: string) {

    // }

}