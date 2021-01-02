import { Directive, ElementRef, HostListener, Input, OnInit, ViewContainerRef } from '@angular/core';
import { NgFlowchart } from './model/flow.model';
import { CONSTANTS } from './model/flowchart.constants';
import { NgFlowchartCanvasService } from './ng-flowchart-canvas.service';
import { CanvasRendererService } from './services/canvas-renderer.service';
import { CanvasDataService } from './services/canvasdata.service';
import { OptionsService } from './services/options.service';



@Directive({
    selector: '[ngFlowchartCanvas]',
    providers: [
        NgFlowchartCanvasService,
        OptionsService,
        CanvasRendererService,
        CanvasDataService
    ]
})
export class NgFlowchartCanvasDirective implements OnInit {

    @HostListener('drop', ['$event'])
    protected onDrop(event: DragEvent) {
        const type = event.dataTransfer.getData('type');
        if('FROM_CANVAS' == type) {
            this.canvas.moveStep(event, event.dataTransfer.getData('id'));
        }
        else {
            this.canvas.onDrop(event);
        }
    }

    @HostListener('dragover', ['$event'])
    protected onDragOver(event: DragEvent) {
        event.preventDefault();
        this.canvas.onDragStart(event);
    }

    _options: NgFlowchart.Options;
    _callbacks: NgFlowchart.Callbacks;

    @HostListener('window:resize', ['$event'])
    protected onResize(event) {
       // this.canvas.reRender();
    }

    @Input('ngFlowchartCallbacks')
    set callbacks(callbacks: NgFlowchart.Callbacks) {
        this._callbacks = callbacks;
        if(!!this.canvas) {
            //this.canvas.setCallbacks(this._callbacks);
        }
    }

    @Input('ngFlowchartOptions')
    set options(options: NgFlowchart.Options) {
        this._options = options;
        if(!!this.optionService) {
            this.optionService.set(this._options);
        }
    }



    constructor(
        protected canvasEle: ElementRef<HTMLElement>,
        private viewContainer: ViewContainerRef,
        private canvas: NgFlowchartCanvasService,
        private optionService: OptionsService,
        private flow: CanvasDataService
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
        canvasContent.id = CONSTANTS.CANVAS_CONTENT_ID;
        canvasContent.classList.add(CONSTANTS.CANVAS_CONTENT_CLASS);
        canvasEle.appendChild(canvasContent);
    }

    /**
     * Returns the Flow object representing this flow chart.
     */
    public getFlow() {
        return {
            name: 'Sample Flow',
            root: this.flow.root
        }
    }

    /**
     * Returns the json representing this flow chart
     */
    public getFlowJSON() {
      return JSON.stringify({
          name: 'Sample Flow',
          root: this.flow.root.toJSON()
      })
    }

    // /**
    //  * Sets the flow object from the given json string. Typically used to reload a saved flow.
    //  * @param flow -Json representation of the flow. See getFlowJSON()
    //  */
    // public setFlow(flow: string) {

    // }

}