import {
  AfterViewInit,
  Component,
  ComponentRef,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { NgFlowchart } from '../model/flow.model';
import { NgFlowchartCanvasService } from '../ng-flowchart-canvas.service';

@Component({
  selector: 'ng-flowchart-connector',
  templateUrl: './ng-flowchart-connector.component.html',
  styleUrls: ['./ng-flowchart-connector.component.scss'],
})
export class NgFlowchartConnectorComponent implements AfterViewInit {
  @Input() canvas: NgFlowchartCanvasService;
  @Input()
  compRef: ComponentRef<NgFlowchartConnectorComponent>;

  private _connector: NgFlowchart.Connector;
  @Input() set connector(connector: NgFlowchart.Connector) {
    this._connector = connector;
  }
  get connector(): NgFlowchart.Connector {
    return this._connector;
  }

  @ViewChild('arrow')
  arrow: ElementRef;
  @ViewChild('arrowPadding')
  arrowPadding: ElementRef;

  @Input()
  set autoPosition(pos: { start: number[]; end: number[] }) {
    this._position = pos;
    this.setConnectorPosition();

    this.containerWidth = Math.abs(pos.start[0] - pos.end[0]);
    this.containerHeight = Math.abs(pos.start[1] - pos.end[1]);

    this.updatePath();
  }

  selected = false;
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    const path = this.arrow.nativeElement as SVGPathElement;
    if (event.target === this.arrowPadding.nativeElement && !this.selected) {
      path.parentElement.setAttribute(
        'marker-end',
        'url(#connectorArrowheadSelected)'
      );

      let bounds = path.getBoundingClientRect();
      const mouseX = event.clientX - bounds.left;
      const mouseY = event.clientY - bounds.top;
      const coord = this.canvas.scaleCoordinate([mouseX + 15, mouseY - 5]);
      this.deleteButtonPosition = {
        x: coord[0],
        y: coord[1],
      };
      this.selected = true;
    }
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const path = this.arrow.nativeElement as SVGPathElement;
    const insideMenuClicked = (event.target as HTMLElement).matches(
      '.ngflowchart-connector-menu *'
    );
    if (
      event.target !== this.arrowPadding.nativeElement &&
      !insideMenuClicked
    ) {
      path.parentElement.setAttribute('marker-end', 'url(#connectorArrowhead)');
      this.selected = false;
    }
  }

  @HostListener('mouseover', ['$event.target'])
  onMouseOver(target: any) {
    if (!this.selected && target === this.arrowPadding.nativeElement) {
      const path = this.arrow.nativeElement as SVGPathElement;
      path.parentElement.setAttribute(
        'marker-end',
        'url(#connectorArrowheadHover)'
      );
    }
  }
  @HostListener('mouseout', ['$event.target'])
  onMouseOut(target: any) {
    if (!this.selected && target === this.arrowPadding.nativeElement) {
      const path = this.arrow.nativeElement as SVGPathElement;
      path.parentElement.setAttribute('marker-end', 'url(#connectorArrowhead)');
    }
  }

  opacity = 1;
  containerWidth: number = 0;
  containerHeight: number = 0;
  deleteButtonPosition: { x: number; y: number };
  private _position: { start: number[]; end: number[] };
  get yOffset(): number {
    return this.canvas.options.options.orientation === 'VERTICAL' ? 6 : 0;
  }
  get xOffset(): number {
    return this.canvas.options.options.orientation === 'HORIZONTAL' ? 6 : 0;
  }
  constructor(protected element: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.updatePath();
  }

  toJSON() {
    return {
      startStepId: this._connector.startStepId,
      endStepId: this._connector.endStepId,
    };
  }

  deleteConnector(event: MouseEvent): void {
    this.destroy0();
    this.canvas.reRender(true);

    this.canvas.options.callbacks.afterDeleteConnector &&
      this.canvas.options.callbacks.afterDeleteConnector(this);
  }

  destroy0(): void {
    this.compRef.destroy();
    this.canvas.flow.removeConnector(this);
  }

  private setConnectorPosition() {
    const left = Math.min(this._position.start[0], this._position.end[0]);
    const top = Math.min(this._position.start[1], this._position.end[1]);
    this.element.nativeElement.style.left = `${left}px`;
    this.element.nativeElement.style.top = `${top}px`;
  }

  private updatePath() {
    if (!this.arrow?.nativeElement) {
      return;
    }
    const pos = this._position;
    let start = new Array(2);
    let end = new Array(2);
    if (pos.start[1] > pos.end[1]) {
      start[1] = this.containerHeight + this.yOffset;
      end[1] = 0;
      if (pos.start[0] > pos.end[0]) {
        // top left
        start[0] = this.containerWidth + this.xOffset;
        end[0] = 0;
      } else {
        //topright
        start[0] = this.xOffset;
        end[0] = this.containerWidth;
      }
    } else {
      start[1] = this.yOffset;
      end[1] = this.containerHeight;
      if (pos.start[0] > pos.end[0]) {
        // bottom left
        start[0] = this.containerWidth + this.xOffset;
        end[0] = 0;
      } else {
        //bottom right
        start[0] = this.xOffset;
        end[0] = this.containerWidth;
      }
    }
    const arrow = `
      M${start[0]} ${start[1]}
      L${end[0]} ${end[1]}
    `;
    this.arrow.nativeElement.setAttribute('d', arrow);
    this.arrowPadding.nativeElement.setAttribute('d', arrow);
  }
}
