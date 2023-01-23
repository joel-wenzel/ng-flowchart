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
      this._position = [
        pos[0] - this.padRadius - this.strokeWidth / 2,
        pos[1] + this.padYOffset,
      ]; // center pad icon and y offset
    } else if (this.canvas.options.options.orientation === 'HORIZONTAL') {
      this._position = [
        pos[0] + this.padYOffset,
        pos[1] - this.padRadius - this.strokeWidth / 2,
      ]; // center pad icon and y offset
    }
    this.setPosition();
  }

  padRadius = 5;
  strokeWidth = 2;
  padYOffset = -6;

  @Input() hidden = false;

  cOffX = 0;
  cOffY = 0;
  movingPad: HTMLElement;

  @HostListener('mousedown', ['$event'])
  onDragStart(e: MouseEvent) {
    e.preventDefault();
    this.data.setDragConnector(this.flowConnector);

    this.cOffX = e.clientX - this.element.nativeElement.offsetLeft;
    this.cOffY = e.clientY - this.element.nativeElement.offsetTop;

    this.movingPad = this.element.nativeElement.cloneNode(true) as HTMLElement;
    this.movingPad.style.pointerEvents = 'none';
    this.element.nativeElement.parentElement.append(this.movingPad);

    document.addEventListener('mousemove', this.dragMove);
    document.addEventListener('mouseup', this.dragEnd);

    this.element.nativeElement.classList.add('dragging');
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
  }

  private dragEnd(e: MouseEvent) {
    e.preventDefault();

    document.removeEventListener('mousemove', this.dragMove);
    document.removeEventListener('mouseup', this.dragEnd);

    this.element.nativeElement.classList.remove('dragging');

    this.data.setDragConnector(null);
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
