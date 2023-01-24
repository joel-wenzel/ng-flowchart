import {
  AfterViewInit,
  Component,
  ComponentRef,
  ElementRef,
  HostListener,
  Injector,
  Input,
  ViewContainerRef,
} from '@angular/core';
import { NgFlowchart } from '../model/flow.model';
import { NgFlowchartCanvasService } from '../ng-flowchart-canvas.service';
import { NgFlowchartPadArrowComponent } from '../ng-flowchart-pad-arrow/ng-flowchart-pad-arrow.component';
import { DropDataService } from '../services/dropdata.service';

@Component({
  selector: 'ng-flowchart-connector-pad',
  templateUrl: './ng-flowchart-connector-pad.component.html',
  styleUrls: ['./ng-flowchart-connector-pad.component.scss'],
})
export class NgFlowchartConnectorPadComponent implements AfterViewInit {
  @Input()
  canvas: NgFlowchartCanvasService;
  @Input()
  flowConnector: NgFlowchart.Connector;
  private _position: number[];
  @Input()
  set position(pos: number[]) {
    if (this.canvas.options.options.orientation === 'VERTICAL') {
      this._position = [pos[0] - this.padRadius - this.strokeWidth / 2, pos[1]]; // center pad icon and y offset
    } else if (this.canvas.options.options.orientation === 'HORIZONTAL') {
      this._position = [pos[0], pos[1] - this.padRadius - this.strokeWidth / 2]; // center pad icon and y offset
    }
    this.setPosition();
  }

  padRadius = 5;
  strokeWidth = 2;

  @Input() hidden = false;

  cOffX = 0;
  cOffY = 0;
  movingPad: HTMLElement;

  @HostListener('mousedown', ['$event'])
  onDragStart(e: MouseEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    this.data.setDragConnector(this.flowConnector);

    this.cOffX = e.clientX - this.element.nativeElement.offsetLeft;
    this.cOffY = e.clientY - this.element.nativeElement.offsetTop;

    this.element.nativeElement.classList.add('dragging');

    this.movingPad = this.element.nativeElement.cloneNode(true) as HTMLElement;
    this.movingPad.style.pointerEvents = 'none';
    this.element.nativeElement.parentElement.append(this.movingPad);

    document.addEventListener('mousemove', this.dragMove);
    document.addEventListener('mouseup', this.dragEnd);
  }

  private arrow: ComponentRef<NgFlowchartPadArrowComponent>;

  constructor(
    protected element: ElementRef<HTMLElement>,
    private viewContainer: ViewContainerRef,
    private data: DropDataService
  ) {
    this.dragMove = this.dragMove.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
  }

  ngAfterViewInit() {
    this.setPosition();
  }

  setPosition() {
    this.element.nativeElement.style.left = `${this._position[0]}px`;
    this.element.nativeElement.style.top = `${this._position[1]}px`;
  }

  drawArrow(start: number[], end: number[]) {
    if (!this.arrow) {
      this.createArrow();
    }
    this.arrow.instance.position = {
      start: start,
      end: end,
    };
    this.arrow.changeDetectorRef.markForCheck();
  }
  private createArrow() {
    const injector = Injector.create({
      providers: [
        {
          provide: 'OptionsService',
          useValue: this.canvas.options,
        },
      ],
    });
    this.arrow = this.viewContainer.createComponent(
      NgFlowchartPadArrowComponent,
      { injector: injector }
    );
    this.element.nativeElement.appendChild(this.arrow.location.nativeElement);
  }

  private dragMove(e: MouseEvent) {
    e.preventDefault();

    this.movingPad.style.top = e.clientY - this.cOffY + 'px';
    this.movingPad.style.left = e.clientX - this.cOffX + 'px';

    this.drawArrow(this._position, [
      e.clientX - this.cOffY,
      e.clientY - this.cOffX,
    ]);
    this.edgePan(e);
  }

  private dragEnd(e: MouseEvent) {
    if (e.button !== 0) return;
    e.preventDefault();

    document.removeEventListener('mousemove', this.dragMove);
    document.removeEventListener('mouseup', this.dragEnd);

    this.element.nativeElement.classList.remove('dragging');

    this.data.setDragConnector(null);
    clearTimeout(this.panTimer);

    if (this.arrow) {
      this.arrow.destroy();
      this.arrow = null;
    }
    if (this.movingPad) {
      this.movingPad.remove();
      this.movingPad = null;
    }
  }

  private panEdgeSize = 25;
  private panTimer = null;
  private edgePan(event: MouseEvent): void {
    // Get the viewport-relative coordinates of the mousemove event.
    var viewportX = event.clientX;
    var viewportY = event.clientY;

    // Get the viewport dimensions.
    var canvasEle = this.canvas.viewContainer.element.nativeElement;
    var viewportWidth = canvasEle.clientWidth;
    var viewportHeight = canvasEle.clientHeight;

    // calculate the boundaries of the edge
    var edgeTop = canvasEle.offsetTop + this.panEdgeSize;
    var edgeLeft = canvasEle.offsetLeft + this.panEdgeSize;
    var edgeBottom = viewportHeight + canvasEle.offsetTop - this.panEdgeSize;
    var edgeRight = viewportWidth + canvasEle.offsetLeft - this.panEdgeSize;

    var isInLeftEdge = viewportX < edgeLeft;
    var isInRightEdge = viewportX > edgeRight;
    var isInTopEdge = viewportY < edgeTop;
    var isInBottomEdge = viewportY > edgeBottom;

    if (!(isInLeftEdge || isInRightEdge || isInTopEdge || isInBottomEdge)) {
      clearTimeout(this.panTimer);
      return;
    }

    // Get the canvas dimensions.
    var canvasWidth = Math.max(
      canvasEle.scrollWidth,
      canvasEle.offsetWidth,
      canvasEle.clientWidth
    );
    var canvasHeight = Math.max(
      canvasEle.scrollHeight,
      canvasEle.offsetHeight,
      canvasEle.clientHeight
    );

    // Calculate the maximum scroll offset in each direction.
    var maxScrollX = canvasWidth - viewportWidth;
    var maxScrollY = canvasHeight - viewportHeight;

    const scope = this;
    (function checkForCanvasScroll() {
      clearTimeout(scope.panTimer);

      if (adjustCanvasScroll()) {
        scope.panTimer = setTimeout(checkForCanvasScroll, 30);
      }
    })();

    // Adjust the canvas scroll based on the user's mouse position. Returns True
    // or False depending on whether or not the canvas scroll was changed.
    function adjustCanvasScroll() {
      // Get the current scroll position of the canvas.
      var currentScrollX = canvasEle.scrollLeft;
      var currentScrollY = canvasEle.scrollTop;

      // Determine if the canvas can be scrolled in any particular direction.
      var canScrollUp = currentScrollY > 0;
      var canScrollDown = currentScrollY < maxScrollY;
      var canScrollLeft = currentScrollX > 0;
      var canScrollRight = currentScrollX < maxScrollX;

      var nextScrollX = currentScrollX;
      var nextScrollY = currentScrollY;

      // control intensity of scroll
      var maxStep = 25;

      // Should we scroll left?
      if (isInLeftEdge && canScrollLeft) {
        var intensity = (edgeLeft - viewportX) / scope.panEdgeSize;

        nextScrollX = nextScrollX - maxStep * intensity;

        // Should we scroll right?
      } else if (isInRightEdge && canScrollRight) {
        var intensity = (viewportX - edgeRight) / scope.panEdgeSize;

        nextScrollX = nextScrollX + maxStep * intensity;
      }

      // Should we scroll up?
      if (isInTopEdge && canScrollUp) {
        var intensity = (edgeTop - viewportY) / scope.panEdgeSize;

        nextScrollY = nextScrollY - maxStep * intensity;

        // Should we scroll down?
      } else if (isInBottomEdge && canScrollDown) {
        var intensity = (viewportY - edgeBottom) / scope.panEdgeSize;

        nextScrollY = nextScrollY + maxStep * intensity;
      }

      // Sanitize invalid maximums.
      nextScrollX = Math.max(0, Math.min(maxScrollX, nextScrollX));
      nextScrollY = Math.max(0, Math.min(maxScrollY, nextScrollY));

      if (nextScrollX !== currentScrollX || nextScrollY !== currentScrollY) {
        canvasEle.scrollTo(nextScrollX, nextScrollY);
        return true;
      } else {
        return false;
      }
    }
  }
}
