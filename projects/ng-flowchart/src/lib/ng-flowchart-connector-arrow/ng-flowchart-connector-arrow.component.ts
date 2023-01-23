import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { OptionsService } from '../services/options.service';

@Component({
  selector: 'ng-flowchart-connector-arrow',
  templateUrl: './ng-flowchart-connector-arrow.component.html',
  styleUrls: ['./ng-flowchart-connector-arrow.component.scss'],
})
export class NgFlowchartConnectorArrowComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('arrow')
  arrow: ElementRef;

  @Input()
  set autoPosition(pos: { start: number[]; end: number[] }) {
    this._position = pos;

    this.containerWidth = Math.abs(pos.start[0] - pos.end[0]);
    this.containerLeft = Math.min(pos.start[0], pos.end[0]);

    this.containerHeight = Math.abs(pos.start[1] - pos.end[1]);
    this.containerTop = Math.min(pos.start[1], pos.end[1]);

    this.updatePath();
  }

  // @Input()
  // set position(pos: { start: number[]; end: number[] }) {
  //   this._position = pos;
  //   this.containerWidth = Math.abs(pos.start[0] - pos.end[0]);
  //   this.containerLeft = Math.min(pos.start[0], pos.end[0]);

  //   this.containerHeight = Math.abs(pos.start[1] - pos.end[1]);
  //   this.containerTop = Math.min(pos.start[1], pos.end[1]);

  //   this.updatePath();
  // }

  opacity = 1;
  containerWidth: number = 0;
  containerHeight: number = 0;
  containerLeft: number = 0;
  containerTop: number = 0;
  _position: { start: number[]; end: number[] };

  constructor(@Inject('OptionsService') private options: OptionsService) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.updatePath();
  }

  hideArrow() {
    this.opacity = 0.2;
  }

  showArrow() {
    this.opacity = 1;
  }

  private updatePath() {
    if (!this.arrow?.nativeElement) {
      return;
    }
    const pos = this._position;
    let start = new Array(2);
    let end = new Array(2);
    if (pos.start[0] > pos.end[0]) {
      start[0] = this.containerWidth;
      end[0] = 0;
    } else {
      start[0] = 0;
      end[0] = this.containerWidth;
    }
    if (pos.start[1] > pos.end[1]) {
      start[1] = this.containerHeight;
      end[1] = 0;
    } else {
      start[1] = 0;
      end[1] = this.containerHeight;
    }
    this.arrow.nativeElement.setAttribute(
      'd',
      `
        M${start[0]},${start[1]}
        L${end[0]},${end[1]}
      `
    );
  }
}
