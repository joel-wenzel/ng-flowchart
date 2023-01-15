import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { debounceTime, fromEvent, Subscription } from 'rxjs';
import { NgFlowchart } from './model/flow.model';
import { CONSTANTS } from './model/flowchart.constants';
import { NgFlowchartCanvasService } from './ng-flowchart-canvas.service';
import { CanvasRendererService } from './services/canvas-renderer.service';
import { OptionsService } from './services/options.service';
import { StepManagerService } from './services/step-manager.service';

@Directive({
  selector: '[ngFlowchartCanvas]',
  providers: [
    NgFlowchartCanvasService,
    StepManagerService,
    OptionsService,
    CanvasRendererService,
  ],
})
export class NgFlowchartCanvasDirective
  implements OnInit, OnDestroy, AfterViewInit
{
  @HostListener('drop', ['$event'])
  protected onDrop(event: DragEvent) {
    if (this._disabled) {
      return;
    }

    // its possible multiple canvases exist so make sure we only move/drop on the closest one
    const closestCanvasId = (event.target as HTMLElement).closest(
      '.ngflowchart-canvas-content'
    )?.id;
    if (this._id !== closestCanvasId) {
      return;
    }

    const type = event.dataTransfer.getData('type');
    if ('FROM_CANVAS' == type) {
      this.canvas.moveStep(event, event.dataTransfer.getData('id'));
    } else {
      this.canvas.onDrop(event);
    }
  }

  @HostListener('dragover', ['$event'])
  protected onDragOver(event: DragEvent) {
    event.preventDefault();
    if (this._disabled) {
      return;
    }
    this.canvas.onDragStart(event);
  }

  _options: NgFlowchart.Options;
  _callbacks: NgFlowchart.Callbacks;

  @HostListener('wheel', ['$event'])
  protected onZoom(event) {
    if (this._options.zoom.mode === 'WHEEL') {
      this.adjustWheelScale(event);
    }
  }

  pos = { top: 0, left: 0, x: 0, y: 0 };
  @HostListener('mousedown', ['$event'])
  protected onMouseDown(e) {
    if (this.options.dragScroll && e.target == this.canvasContent) {
      this.pos = {
        // The current scroll
        left: this.canvasEle.nativeElement.scrollLeft,
        top: this.canvasEle.nativeElement.scrollTop,
        // Get the current mouse position
        x: e.clientX,
        y: e.clientY,
      };

      this.canvasEle.nativeElement.style.cursor = 'all-scroll';
      document.addEventListener('mousemove', this.mouseMoveHandler);
      document.addEventListener('mouseup', this.mouseUpHandler);
    }
  }

  @Input()
  set ngFlowchartCallbacks(callbacks: NgFlowchart.Callbacks) {
    this.optionService.setCallbacks(callbacks);
  }

  @Input()
  set ngFlowchartOptions(options: NgFlowchart.Options) {
    this.optionService.setOptions(options);
    this._options = this.optionService.options;
    this.canvas.reRender();
  }

  get options() {
    return this._options;
  }

  @Input()
  @HostBinding('attr.disabled')
  set disabled(val: boolean) {
    this._disabled = val !== false;
    if (this.canvas) {
      this.canvas._disabled = this._disabled;
    }
  }

  get disabled() {
    return this._disabled;
  }

  private _disabled: boolean = false;
  private _id: string = null;
  private canvasContent: HTMLElement;
  private windowResizeSubscription: Subscription;

  constructor(
    protected canvasEle: ElementRef<HTMLElement>,
    private viewContainer: ViewContainerRef,
    private canvas: NgFlowchartCanvasService,
    private optionService: OptionsService
  ) {
    this.canvasEle.nativeElement.classList.add(CONSTANTS.CANVAS_CLASS);
    this.canvasContent = this.createCanvasContent(this.viewContainer);
    this._id = this.canvasContent.id;
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
  }

  ngOnInit() {
    this.canvas.init(this.viewContainer);
    if (!this._options) {
      this.ngFlowchartOptions = new NgFlowchart.Options();
    }

    this.canvas._disabled = this._disabled;

    this.handleWindowResize();
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    for (let i = 0; i < this.viewContainer.length; i++) {
      this.viewContainer.remove(i);
    }
    this.canvasEle.nativeElement.remove();
    this.viewContainer.element.nativeElement.remove();
    this.viewContainer = undefined;

    this.windowResizeSubscription.unsubscribe();
  }

  private handleWindowResize(): void {
    this.windowResizeSubscription = fromEvent(window, 'resize')
      .pipe(
        debounceTime(100) // emits once, then ignores subsequent emissions for 300ms, repeat...
      )
      .subscribe(() => {
        if (this._options.centerOnResize) {
          this.canvas.reRender(true);
        }
      });
  }

  private createCanvasContent(viewContainer: ViewContainerRef): HTMLElement {
    const canvasId = 'c' + Date.now();

    let canvasEle = viewContainer.element.nativeElement as HTMLElement;
    let canvasContent = document.createElement('div');
    canvasContent.id = canvasId;
    canvasContent.classList.add(CONSTANTS.CANVAS_CONTENT_CLASS);
    canvasEle.appendChild(canvasContent);
    return canvasContent;
  }

  /**
   * Returns the Flow object representing this flow chart.
   */
  public getFlow() {
    return new NgFlowchart.Flow(this.canvas);
  }

  public scaleDown() {
    this.canvas.scaleDown();
  }

  public scaleUp() {
    this.canvas.scaleUp();
  }

  public setScale(scaleValue: number) {
    const scaleVal = Math.max(0, scaleValue);
    this.canvas.setScale(scaleVal);
  }

  private adjustWheelScale(event) {
    if (this.canvas.flow.hasRoot()) {
      event.preventDefault();
      // scale down / zoom out
      if (event.deltaY > 0) {
        this.scaleDown();
      }
      // scale up / zoom in
      else if (event.deltaY < 0) {
        this.scaleUp();
      }
    }
  }

  private mouseMoveHandler(e) {
    // How far the mouse has been moved
    const dx = e.clientX - this.pos.x;
    const dy = e.clientY - this.pos.y;

    // Scroll the element
    this.canvasEle.nativeElement.scrollTop = this.pos.top - dy;
    this.canvasEle.nativeElement.scrollLeft = this.pos.left - dx;
  }

  private mouseUpHandler() {
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('mouseup', this.mouseUpHandler);

    this.canvasEle.nativeElement.style.cursor = 'auto';
  }
}
