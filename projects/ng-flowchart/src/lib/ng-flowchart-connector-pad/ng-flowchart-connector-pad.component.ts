import {
  AfterViewInit,
  Component,
  ComponentRef,
  ElementRef,
  HostListener,
  Injector,
  Input,
  ViewChild,
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

  @ViewChild('connectorPad') connectorPad: ElementRef;

  padRadius = 5;
  strokeWidth = 2;

  @Input() hidden = false;

  movingPad: HTMLElement;

  @HostListener('mousedown', ['$event'])
  onDragStart(e: MouseEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    this.data.setDragConnector(this.flowConnector);

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

  drawArrow(start: number[], end: number[], root: number[]) {
    if (!this.arrow) {
      this.createArrow();
    }
    this.arrow.instance.position = {
      start: start,
      end: end,
      root: root,
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

  private dragMove(e: MouseEvent, skipPan?: boolean) {
    e.preventDefault();
    const canvasEle = this.canvas.viewContainer.element.nativeElement;
    const canvasBounds: DOMRect = canvasEle.getBoundingClientRect();

    const padBounds = this.connectorPad.nativeElement.getBoundingClientRect();
    var startPos = this.canvas.scaleCoordinate([
      padBounds.left - canvasBounds.left,
      padBounds.top - canvasBounds.top,
    ]);

    const padOffset = this.padRadius + this.strokeWidth / 2;
    const left = e.clientX - canvasBounds.left;
    const top = e.clientY - canvasBounds.top;
    var endPos = this.canvas.scaleCoordinate([left, top]);
    endPos[0] -= padOffset;
    endPos[1] -= padOffset;

    const scrollOffset = this.canvas.scaleCoordinate([
      canvasEle.scrollLeft,
      canvasEle.scrollTop,
    ]);
    this.movingPad.style.left = endPos[0] + scrollOffset[0] + 'px';
    this.movingPad.style.top = endPos[1] + scrollOffset[1] + 'px';

    this.drawArrow(startPos, endPos, [padOffset, padOffset]);
    if (!skipPan) {
      this.edgePan(e, canvasBounds);
    }
  }

  private dragEnd(e: MouseEvent) {
    e.preventDefault();
    if (e.button === 0) {
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
  }

  private panEdgeSize = 50;
  private panTimer = null;
  private edgePan(event: MouseEvent, canvasBounds: DOMRect): void {
    // Get the viewport-relative coordinates of the mousemove event.
    var viewportX = event.clientX;
    var viewportY = event.clientY;

    // Get the viewport dimensions.
    var viewportWidth = canvasBounds.width;
    var viewportHeight = canvasBounds.height;

    // calculate the boundaries of the edge
    var edgeTop = canvasBounds.top + this.panEdgeSize;
    var edgeLeft = canvasBounds.left + this.panEdgeSize;
    var edgeBottom = canvasBounds.height - this.panEdgeSize;
    var edgeRight = canvasBounds.right - this.panEdgeSize;

    var isInLeftEdge = viewportX < edgeLeft;
    var isInRightEdge = viewportX > edgeRight;
    var isInTopEdge = viewportY < edgeTop;
    var isInBottomEdge = viewportY > edgeBottom;

    if (!(isInLeftEdge || isInRightEdge || isInTopEdge || isInBottomEdge)) {
      clearTimeout(this.panTimer);
      return;
    }

    var canvasEle = this.canvas.viewContainer.element.nativeElement;

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
        scope.dragMove(event, true);
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
      var maxStep = 30;

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
