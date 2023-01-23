import {
  Component,
  ComponentRef,
  ElementRef,
  Injector,
  Input,
  ViewContainerRef,
} from '@angular/core';
import { NgFlowchart } from '../model/flow.model';
import { NgFlowchartCanvasService } from '../ng-flowchart-canvas.service';
import { NgFlowchartConnectorArrowComponent } from '../ng-flowchart-connector-arrow/ng-flowchart-connector-arrow.component';

@Component({
  selector: 'ng-flowchart-connector',
  templateUrl: './ng-flowchart-connector.component.html',
  styleUrls: ['./ng-flowchart-connector.component.scss'],
})
export class NgFlowchartConnectorComponent {
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
  private arrow: ComponentRef<NgFlowchartConnectorArrowComponent>;

  constructor(
    protected element: ElementRef<HTMLElement>,
    private viewContainer: ViewContainerRef
  ) {}

  drawArrow(start: number[], end: number[]) {
    if (!this.arrow) {
      this.createArrow();
    }
    this.arrow.instance.autoPosition = {
      start: start,
      end: end,
    };
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
      NgFlowchartConnectorArrowComponent,
      { injector: injector }
    );
    this.element.nativeElement.appendChild(this.arrow.location.nativeElement);
  }

  toJSON() {
    return {
      startStepId: this._connector.startStepId,
      endStepId: this._connector.endStepId,
    };
  }

  destroy(): void {
    this.compRef.destroy();
    this.canvas.flow.removeConnector(this);
  }
}
