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
  selector: 'ng-flowchart-pad-arrow',
  templateUrl: './ng-flowchart-pad-arrow.component.html',
  styleUrls: ['./ng-flowchart-pad-arrow.component.scss'],
})
export class NgFlowchartPadArrowComponent implements OnInit, AfterViewInit {
  @ViewChild('arrow')
  arrow: ElementRef;

  @Input()
  set position(pos: { start: number[]; end: number[]; root: number[] }) {
    this._position = pos;
    this.containerWidth = Math.abs(pos.start[0] - pos.end[0]);
    this.containerLeft =
      pos.start[0] > pos.end[0]
        ? -this.containerWidth + pos.root[0]
        : pos.root[0];

    this.containerHeight = Math.abs(pos.start[1] - pos.end[1]);
    this.containerTop =
      pos.start[1] > pos.end[1]
        ? -this.containerHeight + pos.root[1]
        : pos.root[1];

    this.updatePath();
  }

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
    let start: number[];
    let end: number[];
    if (pos.start[1] > pos.end[1]) {
      if (pos.start[0] > pos.end[0]) {
        // top left
        start = [this.containerWidth, this.containerHeight];
        end = [0, 0];
      } else {
        //topright
        start = [0, this.containerHeight];
        end = [this.containerWidth, 0];
      }
    } else {
      if (pos.start[0] > pos.end[0]) {
        // bottom left
        start = [this.containerWidth, 0];
        end = [0, this.containerHeight];
      } else {
        //bottom right
        start = [0, 0];
        end = [this.containerWidth, this.containerHeight];
      }
    }
    this.arrow.nativeElement.setAttribute(
      'd',
      `
        M${start[0]} ${start[1]}
        L${end[0]} ${end[1]}
      `
    );
  }
}
