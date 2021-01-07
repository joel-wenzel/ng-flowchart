import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'lib-ng-flowchart-arrow',
  templateUrl: './ng-flowchart-arrow.component.html',
  styleUrls: ['./ng-flowchart-arrow.component.scss']
})
export class NgFlowchartArrowComponent implements OnInit, AfterViewInit {

  @ViewChild('arrow')
  arrow: ElementRef;

  @Input()
  set position(pos: { start: number[], end: number[] }) {
    this._position = pos;

    this.isLeftFlowing = pos.start[0] > pos.end[0];

    //in the case where steps are directly underneath we need some minimum width
    this.containerWidth = Math.abs(pos.start[0] - pos.end[0]) + (this.padding * 2);

    this.containerLeft = Math.min(pos.start[0], pos.end[0]) - this.padding;

    this.containerHeight = Math.abs(pos.start[1] - pos.end[1]);
    this.containerTop = pos.start[1];

    this.updatePath();
  }

  opacity = 1;
  containerWidth: number = 0;
  containerHeight: number = 0;
  containerLeft: number = 0;
  containerTop: number = 0;
  _position: { start: number[], end: number[] }


  //to be applied on left and right edges
  private padding = 10;
  private isLeftFlowing = false;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.updatePath();
  }

  hideArrow() {
    this.opacity = .2;
  }

  showArrow() {
    this.opacity = 1;
  }

  private updatePath() {
    if (!this.arrow?.nativeElement) {
      return;
    }

    if (this.isLeftFlowing) {
      this.arrow.nativeElement.setAttribute("d", `
        M${this.containerWidth - this.padding},0 
        L${this.containerWidth - this.padding},${this.containerHeight / 2}
        L${this.padding},${this.containerHeight / 2}
        L${this.padding},${this.containerHeight - 4}
      `);
    }
    else {
      this.arrow.nativeElement.setAttribute("d", `
        M${this.padding},0 
        L${this.padding},${this.containerHeight / 2}
        L${this.containerWidth - this.padding},${this.containerHeight / 2}
        L${this.containerWidth - this.padding},${this.containerHeight - 4}
      `);
    }


  }

}
