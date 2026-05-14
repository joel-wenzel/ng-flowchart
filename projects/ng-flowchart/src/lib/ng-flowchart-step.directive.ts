import {
  AfterViewChecked,
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
} from '@angular/core';
import { NgFlowchart } from './model/flow.model';
import { DropDataService } from './services/dropdata.service';

@Directive({
  standalone: false,
  selector: '[ngFlowchartStep]',
})
export class NgFlowchartStepDirective implements AfterViewInit, AfterViewChecked {
  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent) {
    this.data.setDragStep(this.flowStep);
    event.dataTransfer.setData('type', NgFlowchart.DropType.Step);
    event.dataTransfer.setData('source', NgFlowchart.DropSource.Palette);
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent) {
    this.data.setDragStep(null);
  }

  @Input('ngFlowchartStep')
  flowStep: NgFlowchart.PendingStep | null;

  constructor(
    protected element: ElementRef<HTMLElement>,
    private data: DropDataService
  ) {
  }

  ngAfterViewInit() {}

  ngAfterViewChecked() {
    this.element.nativeElement.setAttribute('draggable', this.flowStep ? 'true' : 'false');
  }
}
