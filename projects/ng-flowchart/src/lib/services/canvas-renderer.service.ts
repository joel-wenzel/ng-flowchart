import {
  ChangeDetectorRef,
  ComponentRef,
  Injectable,
  ViewContainerRef,
} from '@angular/core';
import { NgFlowchart } from '../model/flow.model';
import { CONSTANTS } from '../model/flowchart.constants';
import { CanvasFlow } from '../ng-flowchart-canvas.service';
import { NgFlowchartConnectorComponent } from '../ng-flowchart-connector/ng-flowchart-connector.component';
import { NgFlowchartStepComponent } from '../ng-flowchart-step/ng-flowchart-step.component';
import { OptionsService } from './options.service';

export type DropProximity = {
  step: NgFlowchartStepComponent;
  position: NgFlowchart.DropPosition;
  proximity: number;
};

export type ConnectorDropProximity = {
  step: NgFlowchartStepComponent;
  proximity: number;
};

@Injectable()
export class CanvasRendererService {
  private viewContainer: ViewContainerRef;

  private scale: number = 1;
  private scaleDebounceTimer = null;

  constructor(
    private options: OptionsService,
    private cdr: ChangeDetectorRef
  ) {}

  public init(viewContainer: ViewContainerRef) {
    this.viewContainer = viewContainer;
  }

  public renderRoot(
    step: ComponentRef<NgFlowchartStepComponent>,
    dragEvent?: DragEvent
  ) {
    this.getCanvasContentElement().appendChild(step.location.nativeElement);
    this.setRootPosition(step.instance, dragEvent);
    this.cdr.markForCheck();
  }

  public renderNonRoot(
    step: ComponentRef<NgFlowchartStepComponent>,
    dragEvent?: DragEvent
  ) {
    this.getCanvasContentElement().appendChild(step.location.nativeElement);
    this.cdr.markForCheck();
  }

  public renderConnector(
    connector: ComponentRef<NgFlowchartConnectorComponent>
  ) {
    this.getCanvasContentElement().appendChild(
      connector.location.nativeElement
    );
    this.cdr.markForCheck();
  }

  public updatePosition(step: NgFlowchartStepComponent, dragEvent: DragEvent) {
    let relativeXY = this.getRelativeXY(dragEvent);

    relativeXY = relativeXY.map(coord => coord / this.scale);
    step.zsetPosition(relativeXY, true);
  }

  private getStepGap() {
    return this.options.options.stepGap;
  }

  private renderVerticalChildTree(
    rootNode: NgFlowchartStepComponent,
    rootRect: Partial<DOMRect>,
    canvasRect: DOMRect
  ) {
    //the rootNode passed in is already rendered. just need to render its children /subtree

    if (!rootNode.hasChildren()) {
      return;
    }

    const rootBottom =
      rootRect.top - canvasRect.top + rootRect.height / this.scale;
    //top of the child row is simply the relative bottom of the root + stepGap
    const childYTop = rootBottom + this.getStepGap();

    const rootWidth = rootRect.width / this.scale;

    const rootXCenter = rootRect.left - canvasRect.left + rootWidth / 2;

    //get the width of the child trees
    let childTreeWidths = {};
    let totalTreeWidth = 0;

    rootNode.children.forEach(child => {
      let totalChildWidth = child.getNodeTreeWidth(
        this.getStepGap() * this.scale
      );
      totalChildWidth = totalChildWidth / this.scale;
      childTreeWidths[child.nativeElement.id] = totalChildWidth;

      totalTreeWidth += totalChildWidth;
    });

    //add length for stepGaps between child trees
    totalTreeWidth += (rootNode.children.length - 1) * this.getStepGap();

    //if we have more than 1 child, we want half the extent on the left and half on the right
    let leftXTree = rootXCenter - totalTreeWidth / 2;

    // dont allow it to go negative since you cant scroll that way
    leftXTree = Math.max(0, leftXTree);

    rootNode.children.forEach(child => {
      let childExtent = childTreeWidths[child.nativeElement.id];

      let childLeft =
        leftXTree + childExtent / 2 - child.nativeElement.offsetWidth / 2;

      child.zsetPosition([childLeft, childYTop]);

      const currentChildRect = child.getCurrentRect(canvasRect);

      const childWidth = currentChildRect.width / this.scale;

      child.zdrawArrow(
        [rootXCenter, rootBottom],
        [
          currentChildRect.left + childWidth / 2 - canvasRect.left,
          currentChildRect.top - canvasRect.top,
        ]
      );

      this.renderVerticalChildTree(child, currentChildRect, canvasRect);
      leftXTree += childExtent + this.getStepGap();
    });
  }

  private renderHorizontalChildTree(
    rootNode: NgFlowchartStepComponent,
    rootRect: Partial<DOMRect>,
    canvasRect: DOMRect
  ) {
    //the rootNode passed in is already rendered. just need to render its children /subtree

    if (!rootNode.hasChildren()) {
      return;
    }

    const rootRight =
      rootRect.left - canvasRect.left + rootRect.width / this.scale;
    //top of the child row is simply the relative Right of the root + stepGap
    const childXLeft = rootRight + this.getStepGap();

    const rootHeight = rootRect.height / this.scale;

    const rootYCenter = rootRect.top - canvasRect.top + rootHeight / 2;

    //get the width of the child trees
    let childTreeHeights = {};
    let totalTreeHeight = 0;

    rootNode.children.forEach(child => {
      let totalChildHeight = child.getNodeTreeHeight(
        this.getStepGap() * this.scale
      );
      totalChildHeight = totalChildHeight / this.scale;
      childTreeHeights[child.nativeElement.id] = totalChildHeight;

      totalTreeHeight += totalChildHeight;
    });

    //add length for stepGaps between child trees
    totalTreeHeight += (rootNode.children.length - 1) * this.getStepGap();

    //if we have more than 1 child, we want half the extent on the left and half on the right
    let topYTree = rootYCenter - totalTreeHeight / 2;

    // dont allow it to go negative since you cant scroll that way
    topYTree = Math.max(0, topYTree);

    rootNode.children.forEach(child => {
      let childExtent = childTreeHeights[child.nativeElement.id];

      let childTop =
        topYTree + childExtent / 2 - child.nativeElement.offsetHeight / 2;

      child.zsetPosition([childXLeft, childTop]);

      const currentChildRect = child.getCurrentRect(canvasRect);

      const childHeight = currentChildRect.height / this.scale;

      child.zdrawArrow(
        [rootRight, rootYCenter],
        [
          currentChildRect.left - canvasRect.left,
          currentChildRect.top + childHeight / 2 - canvasRect.top,
        ]
      );

      this.renderHorizontalChildTree(child, currentChildRect, canvasRect);
      topYTree += childExtent + this.getStepGap();
    });
  }

  public render(
    flow: CanvasFlow,
    pretty?: boolean,
    skipAdjustDimensions?: boolean
  ) {
    if (!flow.hasRoot()) {
      if (this.options.options.zoom.mode === 'DISABLED') {
        this.resetAdjustDimensions();
        // Trigger afterRender to allow nested canvas to redraw parent canvas.
        // Not sure if this scenario should also trigger beforeRender.
        if (this.options.callbacks?.afterRender) {
          this.options.callbacks.afterRender();
        }
      }
      return;
    }

    if (this.options.callbacks?.beforeRender) {
      this.options.callbacks.beforeRender();
    }

    const canvasRect = this.getCanvasContentElement().getBoundingClientRect();
    if (pretty) {
      //this will place the root at the top center of the canvas and render from there
      this.setRootPosition(flow.rootStep, null);
    }

    if (this.options.options.orientation === 'VERTICAL') {
      this.renderVerticalChildTree(
        flow.rootStep,
        flow.rootStep.getCurrentRect(canvasRect),
        canvasRect
      );
    } else if (this.options.options.orientation === 'HORIZONTAL') {
      this.renderHorizontalChildTree(
        flow.rootStep,
        flow.rootStep.getCurrentRect(canvasRect),
        canvasRect
      );
    }

    if (this.options.options.manualConnectors) {
      this.drawConnectorPads(flow, canvasRect);
      this.drawConnectors(flow, canvasRect);
    }

    if (
      !skipAdjustDimensions &&
      this.options.options.zoom.mode === 'DISABLED'
    ) {
      this.adjustDimensions(flow, canvasRect);
    }

    this.cdr.markForCheck();

    if (this.options.callbacks?.afterRender) {
      this.options.callbacks.afterRender();
    }
  }

  private resetAdjustDimensions(): void {
    // reset canvas auto sizing to original size if empty
    if (this.viewContainer) {
      const canvasWrapper = this.getCanvasContentElement();
      canvasWrapper.style.minWidth = null;
      canvasWrapper.style.minHeight = null;
    }
  }

  private findDropLocationForHover(
    absMouseXY: number[],
    targetStep: NgFlowchartStepComponent,
    stepToDrop: NgFlowchart.Step
  ): DropProximity | 'deadzone' | null {
    if (!targetStep.shouldEvalDropHover(absMouseXY, stepToDrop)) {
      return 'deadzone';
    }

    const stepRect = targetStep.nativeElement.getBoundingClientRect();

    const yStepCenter = stepRect.bottom - stepRect.height / 2;
    const xStepCenter = stepRect.left + stepRect.width / 2;

    const yDiff = absMouseXY[1] - yStepCenter;
    const xDiff = absMouseXY[0] - xStepCenter;

    const absYDistance = Math.abs(yDiff);
    const absXDistance = Math.abs(xDiff);

    //#math class #Pythagoras
    const distance = Math.sqrt(
      absYDistance * absYDistance + absXDistance * absXDistance
    );
    const accuracyRadius = (stepRect.height + stepRect.width) / 2;

    let result: DropProximity | 'deadzone' | null = null;

    if (distance < accuracyRadius) {
      if (distance < this.options.options.hoverDeadzoneRadius) {
        //basically we are too close to the middle to accurately predict what position they want
        result = 'deadzone';
      }

      if (this.options.options.orientation === 'VERTICAL') {
        if (absYDistance > absXDistance) {
          result = {
            step: targetStep,
            position: yDiff > 0 ? 'BELOW' : 'ABOVE',
            proximity: absYDistance,
          };
        } else if (
          !this.options.options.isSequential &&
          !targetStep.isRootElement()
        ) {
          result = {
            step: targetStep,
            position: xDiff > 0 ? 'RIGHT' : 'LEFT',
            proximity: absXDistance,
          };
        }
      } else if (this.options.options.orientation === 'HORIZONTAL') {
        if (absXDistance > absYDistance) {
          result = {
            step: targetStep,
            position: xDiff > 0 ? 'BELOW' : 'ABOVE',
            proximity: absXDistance,
          };
        } else if (
          !this.options.options.isSequential &&
          !targetStep.isRootElement()
        ) {
          result = {
            step: targetStep,
            position: yDiff > 0 ? 'RIGHT' : 'LEFT',
            proximity: absYDistance,
          };
        }
      }
    }

    if (result && result !== 'deadzone') {
      if (
        !targetStep
          .getDropPositionsForStep(stepToDrop)
          .includes(result.position)
      ) {
        //we had a valid drop but the target step doesnt allow this location
        result = null;
      }
    }

    return result;
  }

  private adjustDimensions(flow: CanvasFlow, canvasRect: DOMRect): void {
    let maxRight = 0;
    let maxBottom = 0;

    //TODO this can be better
    flow.steps.forEach(ele => {
      let rect = ele.getCurrentRect(canvasRect);
      maxRight = Math.max(rect.right, maxRight);
      maxBottom = Math.max(rect.bottom, maxBottom);
    });

    const widthBorderGap = this.getStepGap() / this.scale;
    const widthDiff =
      canvasRect.width / this.scale -
      (maxRight - canvasRect.left + widthBorderGap);
    if (widthDiff < -this.getStepGap()) {
      //grow x
      let growWidth = Math.abs(widthDiff);
      if (growWidth > this.getStepGap()) {
        this.getCanvasContentElement().style.minWidth = `${
          canvasRect.width / this.scale + growWidth + this.getStepGap()
        }px`;
        if (
          this.options.options.orientation === 'VERTICAL' &&
          this.options.options.centerOnResize
        ) {
          this.render(flow, true, true);
        }
      }
    } else if (widthDiff > this.getStepGap()) {
      //shrink x
      if (this.isNestedCanvas()) {
        const shrinkWidth =
          this.options.options.orientation === 'VERTICAL'
            ? widthDiff * 2
            : widthDiff;
        this.getCanvasContentElement().style.minWidth = `${
          canvasRect.width / this.scale - shrinkWidth
        }px`;
        if (
          this.options.options.orientation === 'VERTICAL' &&
          this.options.options.centerOnResize
        ) {
          this.render(flow, true, true);
        }
      } else if (this.getCanvasContentElement().style.minWidth) {
        // reset normal canvas width if auto width set
        this.getCanvasContentElement().style.minWidth = null;
        if (
          this.options.options.orientation === 'VERTICAL' &&
          this.options.options.centerOnResize
        ) {
          this.render(flow, true, true);
        }
      }
    }

    let heightBorderGap = this.getStepGap() / this.scale;
    const heightDiff =
      canvasRect.height / this.scale -
      (maxBottom - canvasRect.top + heightBorderGap);
    if (heightDiff < -this.getStepGap()) {
      //grow y
      let growHeight = Math.abs(heightDiff);
      if (growHeight > this.getStepGap()) {
        this.getCanvasContentElement().style.minHeight = `${
          canvasRect.height / this.scale + growHeight
        }px`;
        if (
          this.options.options.orientation === 'HORIZONTAL' &&
          this.options.options.centerOnResize
        ) {
          this.render(flow, true, true);
        }
      }
    } else if (heightDiff > this.getStepGap()) {
      //shrink y
      if (this.isNestedCanvas()) {
        const shrinkHeight =
          this.options.options.orientation === 'HORIZONTAL'
            ? heightDiff * 2
            : heightDiff;
        this.getCanvasContentElement().style.minHeight = `${
          canvasRect.height / this.scale - shrinkHeight
        }px`;
        if (
          this.options.options.orientation === 'HORIZONTAL' &&
          this.options.options.centerOnResize
        ) {
          this.render(flow, true, true);
        }
      } else if (this.getCanvasContentElement().style.minHeight) {
        // reset normal canvas height if auto height set
        this.getCanvasContentElement().style.minHeight = null;
        if (
          this.options.options.orientation === 'HORIZONTAL' &&
          this.options.options.centerOnResize
        ) {
          this.render(flow, true, true);
        }
      }
    }
  }

  private findBestMatchForSteps(
    dragStep: NgFlowchart.Step,
    event: DragEvent,
    steps: ReadonlyArray<NgFlowchartStepComponent>
  ): DropProximity | null {
    const absXY = [event.clientX, event.clientY];

    let bestMatch: DropProximity = null;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      if (step.isHidden()) {
        continue;
      }

      const position = this.findDropLocationForHover(absXY, step, dragStep);
      if (position) {
        if (position == 'deadzone') {
          bestMatch = null;
          break;
        }
        //if this step is closer than previous best match then we have a new best
        else if (
          bestMatch == null ||
          bestMatch.proximity > position.proximity
        ) {
          bestMatch = position;
        }
      }
    }

    return bestMatch;
  }

  public findAndShowClosestDrop(
    dragStep: NgFlowchart.Step,
    event: DragEvent,
    steps: ReadonlyArray<NgFlowchartStepComponent>
  ): NgFlowchart.DropTarget {
    if (!steps || steps.length == 0) {
      return;
    }

    let bestMatch: DropProximity = this.findBestMatchForSteps(
      dragStep,
      event,
      steps
    );

    // TODO make this more efficient. two loops
    steps.forEach(step => {
      if (
        bestMatch == null ||
        step.nativeElement.id !== bestMatch.step.nativeElement.id
      ) {
        step.clearHoverIcons();
      }
    });

    if (!bestMatch) {
      return;
    }

    bestMatch.step.showHoverIcon(bestMatch.position);

    return {
      step: bestMatch.step,
      position: bestMatch.position,
    };
  }

  public showSnaps(dragStep: NgFlowchart.PendingStep) {}

  public clearAllSnapIndicators(
    steps: ReadonlyArray<NgFlowchartStepComponent>
  ) {
    steps.forEach(step => step.clearHoverIcons());
  }

  private setRootPosition(
    step: NgFlowchartStepComponent,
    dragEvent?: DragEvent
  ) {
    if (!dragEvent) {
      const canvasTop = this.getCanvasTopCenterPosition(step.nativeElement);
      step.zsetPosition(canvasTop, true);
      return;
    }

    switch (this.options.options.rootPosition) {
      case 'CENTER':
        const canvasCenter = this.getCanvasCenterPosition();
        step.zsetPosition(canvasCenter, true);
        return;
      case 'TOP_CENTER':
        const canvasTop = this.getCanvasTopCenterPosition(step.nativeElement);
        step.zsetPosition(canvasTop, true);
        return;
      default:
        const relativeXY = this.getRelativeXY(dragEvent);
        step.zsetPosition(relativeXY, true);
        return;
    }
  }

  private getRelativeXY(dragEvent: DragEvent) {
    const canvasRect = this.getCanvasContentElement().getBoundingClientRect();

    return [
      dragEvent.clientX - canvasRect.left,
      dragEvent.clientY - canvasRect.top,
    ];
  }

  private getCanvasTopCenterPosition(htmlRootElement: HTMLElement) {
    const canvasRect = this.getCanvasContentElement().getBoundingClientRect();
    const edgeMargin = this.getStepGap() * this.scale;
    if (this.options.options.orientation === 'VERTICAL') {
      const rootElementTop = htmlRootElement.getBoundingClientRect().height;
      const topCoord = rootElementTop / 2 + edgeMargin;
      const scaleTopOffset = (1 - this.scale) * 100;

      return [canvasRect.width / (this.scale * 2), topCoord + scaleTopOffset];
    } else if (this.options.options.orientation === 'HORIZONTAL') {
      const rootElementRight = htmlRootElement.getBoundingClientRect().width;
      const rightCoord = rootElementRight / 2 + edgeMargin;
      const scaleRightOffset = (1 - this.scale) * 100;

      return [
        rightCoord + scaleRightOffset,
        canvasRect.height / (this.scale * 2),
      ];
    }
  }

  private getCanvasCenterPosition() {
    const canvasRect = this.getCanvasContentElement().getBoundingClientRect();
    return [canvasRect.width / 2, canvasRect.height / 2];
  }

  private getCanvasContentElement(): HTMLElement {
    const canvas = this.viewContainer.element.nativeElement as HTMLElement;
    let canvasContent = canvas
      .getElementsByClassName(CONSTANTS.CANVAS_CONTENT_CLASS)
      .item(0);
    return canvasContent as HTMLElement;
  }

  private isNestedCanvas(): boolean {
    if (this.viewContainer) {
      const canvasWrapper = (
        this.viewContainer.element.nativeElement as HTMLElement
      ).parentElement;
      if (canvasWrapper) {
        return canvasWrapper.classList.contains('ngflowchart-step-wrapper');
      }
    }
    return false;
  }

  public resetScale(flow: CanvasFlow) {
    this.setScale(flow, 1);
  }

  public scaleUp(flow: CanvasFlow, step?: number) {
    const newScale =
      this.scale + this.scale * (step || this.options.options.zoom.defaultStep);
    this.setScale(flow, newScale);
  }

  public scaleDown(flow: CanvasFlow, step?: number) {
    const newScale =
      this.scale - this.scale * (step || this.options.options.zoom.defaultStep);
    this.setScale(flow, newScale);
  }

  public setScale(flow: CanvasFlow, scaleValue: number) {
    const minDimAdjust = `${(1 / scaleValue) * 100}%`;

    const canvasContent = this.getCanvasContentElement();

    canvasContent.style.transform = `scale(${scaleValue})`;
    canvasContent.style.minHeight = minDimAdjust;
    canvasContent.style.minWidth = minDimAdjust;
    canvasContent.style.transformOrigin = 'top left';
    canvasContent.classList.add('scaling');

    this.scale = scaleValue;
    if (!this.options.options.zoom.skipRender) {
      this.render(flow, true);
    }

    if (this.options.callbacks?.afterScale) {
      this.options.callbacks.afterScale(this.scale);
    }

    this.scaleDebounceTimer && clearTimeout(this.scaleDebounceTimer);
    this.scaleDebounceTimer = setTimeout(() => {
      canvasContent.classList.remove('scaling');
    }, 300);
  }

  public setNestedScale(scaleValue: number) {
    this.scale = scaleValue;
  }

  private drawConnectors(flow: CanvasFlow, canvasRect: DOMRect): void {
    for (const conn of flow.connectors) {
      const startStep = flow.steps.find(
        s => s.id === conn.connector.startStepId
      );
      const startStepRect = startStep.getCurrentRect(canvasRect);
      let startStepPos: number[];
      if (this.options.options.orientation === 'VERTICAL') {
        startStepPos = [
          startStepRect.left -
            canvasRect.left +
            (startStepRect.width / this.scale) * (2 / 3),
          startStepRect.top -
            canvasRect.top +
            startStepRect.height / this.scale,
        ];
      } else if (this.options.options.orientation === 'HORIZONTAL') {
        startStepPos = [
          startStepRect.left -
            canvasRect.left +
            startStepRect.width / this.scale,
          startStepRect.top -
            canvasRect.top +
            (startStepRect.height / this.scale) * (1 / 5),
        ];
      }

      const endStep = flow.steps.find(s => s.id === conn.connector.endStepId);
      const endStepRect = endStep.getCurrentRect();
      const closestEndEdge = this.findClosestEndEdge(startStepPos, endStepRect);
      conn.autoPosition = { start: startStepPos, end: closestEndEdge };
    }
  }

  private drawConnectorPads(flow: CanvasFlow, canvasRect: DOMRect): void {
    for (const step of flow.steps) {
      const stepRect = step.getCurrentRect(canvasRect);
      let padX: number;
      let padY: number;
      if (this.options.options.orientation === 'VERTICAL') {
        padX =
          stepRect.left -
          canvasRect.left +
          (stepRect.width / this.scale) * (2 / 3);
        padY = stepRect.top - canvasRect.top + stepRect.height / this.scale;
      } else if (this.options.options.orientation === 'HORIZONTAL') {
        padX = stepRect.left - canvasRect.left + stepRect.width / this.scale;
        padY =
          stepRect.top -
          canvasRect.top +
          (stepRect.height / this.scale) * (1 / 5);
      }
      step.drawConnectorPad([padX, padY]);
    }
  }

  private findClosestEndEdge(
    startPos: number[],
    stepRect: Partial<DOMRect>
  ): number[] {
    let sides: number[][];
    let scaledHeight = stepRect.height / this.scale;
    let scaledWidth = stepRect.width / this.scale;
    if (this.options.options.orientation === 'VERTICAL') {
      sides = [
        [stepRect.left, stepRect.top + scaledHeight / 2], //left
        [stepRect.left + scaledWidth * (1 / 5), stepRect.top], //top
        [stepRect.left + scaledWidth * (2 / 5), stepRect.top], //top
        [stepRect.left + scaledWidth * (3 / 5), stepRect.top], //top
        [stepRect.left + scaledWidth * (4 / 5), stepRect.top], //top
        [stepRect.left + scaledWidth, stepRect.top + scaledHeight / 2], //right
      ];
    } else if (this.options.options.orientation === 'HORIZONTAL') {
      sides = [
        [stepRect.left, stepRect.top + scaledHeight * (1 / 4)], //left
        [stepRect.left, stepRect.top + scaledHeight * (3 / 4)], //left
        [stepRect.left + scaledWidth * (1 / 5), stepRect.top], //top
        [stepRect.left + scaledWidth * (2 / 5), stepRect.top], //top
        [stepRect.left + scaledWidth * (3 / 5), stepRect.top], //top
        [stepRect.left + scaledWidth * (4 / 5), stepRect.top], //top
        [stepRect.left + scaledWidth * (1 / 5), stepRect.top + scaledHeight], //bottom
        [stepRect.left + scaledWidth * (2 / 5), stepRect.top + scaledHeight], //bottom
        [stepRect.left + scaledWidth * (3 / 5), stepRect.top + scaledHeight], //bottom
        [stepRect.left + scaledWidth * (4 / 5), stepRect.top + scaledHeight], //bottom
      ];
    }

    const closest = sides.reduce(
      (closest, current) => {
        const absXDistance = Math.abs(startPos[0] - current[0]);
        const absYDistance = Math.abs(startPos[1] - current[1]);
        const distance = Math.sqrt(
          absXDistance * absXDistance + absYDistance * absYDistance
        );
        if (!closest.pos || distance < closest.distance) {
          return { pos: current, distance };
        }
        return closest;
      },
      { pos: null, distance: null }
    );

    return closest.pos;
  }

  public scaleCoordinate(pos: number[]): number[] {
    return [pos[0] / this.scale, pos[1] / this.scale];
  }
}
