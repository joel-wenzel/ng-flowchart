import { Injectable, ViewContainerRef } from '@angular/core';
import { NgFlowCanvas } from './model/canvas.model';
import { NgFlowChart } from './model/flow.model';
import { CONSTANTS } from './model/flowchart.constants';
import { NgFlowchartDataService } from './ng-flowchart-data.service';



@Injectable()
export class NgFlowchartCanvasService {

  canvasData: NgFlowCanvas.Canvas;
  viewContainer: ViewContainerRef;

  options: NgFlowChart.Options = new NgFlowChart.Options();

  dragHover: {
    adjacentElement: NgFlowCanvas.CanvasElement,
    relativePosition: NgFlowCanvas.DropPosition
  };

  constructor(private data: NgFlowchartDataService) {
    this.canvasData = {
      ...NgFlowCanvas.emptyCanvas,
      allElements: []
    }

    window['canvas'] = this.canvasData;
  }

  public init(view: ViewContainerRef) {
    console.debug('init');
    this.viewContainer = view;
  }

  public onDragStep(drag: DragEvent) {
    this.checkHoverLocation(drag);
  }

  public dropPaletteStep(drag: DragEvent, data: any): boolean {
    console.debug('Drop step ', data);

    let relativeDropLoc = this.getRelativeDropLocation(drag);
    console.debug('Drop location ', relativeDropLoc);

    document.querySelectorAll('.' + CONSTANTS.CANVAS_STEP_CLASS).forEach(
      ele => ele.removeAttribute(CONSTANTS.DROP_HOVER_ATTR)
    );

    if (relativeDropLoc) {
      //create the template
      let view = this.createCanvasElement(relativeDropLoc, data);

      const stepHeight = view.html.getBoundingClientRect().height;
      const canvasRect = this.getCanvasRect();
      const heightAdjustment = stepHeight * 2;

      view.html.setAttribute('style', `position: absolute; left: ${relativeDropLoc.x - view.html.offsetWidth / 2}px; top: ${relativeDropLoc.y - (view.html.offsetHeight / 2)}px`);

      //add space to canvas if there is not enough space to add 1 more additional step of the same height
      if (canvasRect.height - relativeDropLoc.y < heightAdjustment) {
        this.adjustCanvasHeight(heightAdjustment);
      }

      this.addCanvasElement(view);

      this.render();

      return true;
    }

    return false;

  }

  public makePretty() {
    this.render(true);
  }

  private adjustCanvasHeight(heightAdjustment: number) {
    const canvasHeight = this.getCanvasContentElement().getBoundingClientRect().height;

    console.debug('Adjusting height by ', heightAdjustment);
    this.getCanvasContentElement().setAttribute('style', `height: ${canvasHeight + heightAdjustment}px`);
  }

  private getLeafNodeExtent(element: NgFlowCanvas.CanvasElement, extent = 0, count = 0) {
    if (!element.children || element.children.length == 0) {
      return [extent + (element.html.getBoundingClientRect().width + this.options.stepGap), ++count];
    }

    element.children.forEach(child => {
      let ret = this.getLeafNodeExtent(child, extent, count);
      extent = ret[0];
      count = ret[1];
    })
    return [extent, count];
  }

  private renderChildren(element: NgFlowCanvas.CanvasElement, currentRect: DOMRect) {
    let childrenDisplay = {};
    if (element.children && element.children.length > 0) {
      const canvasRect = this.getCanvasRect();
      const rootParentCenterX = currentRect.left - canvasRect.left;
      const rootParentBottomY = currentRect.bottom - canvasRect.top;
      let totalChildExtent = 0;

      element.children.forEach(
        child => {
          const [extent, count] = this.getLeafNodeExtent(child);
          totalChildExtent += extent;
          childrenDisplay[child.html.id] = {
            extent: extent,
            count: count
          }
        }
      )

      //regardless of the number of children we always want half the content on the left and half on the right
      let childXPos = rootParentCenterX - (totalChildExtent / 2);
      const childYPos = rootParentBottomY + this.options.stepGap;

      for (let i = 0; i < element.children.length; i++) {
        let child = element.children[i];
        let childrect = child.html.getBoundingClientRect();
        let childExtent = childrenDisplay[child.html.id].extent;
        let childLeft = childXPos + childExtent / 2;

        child.html.setAttribute('style', `position: absolute; left: ${childLeft}px; top: ${childYPos}px`);

        childXPos += childExtent;

        //since the element hasnt actually updated position yet, we need to create a fake DOMRect and pass it
        //otherwise we could just refetch the bounding rect
        this.renderChildren(child, {
          bottom: childYPos + childrect.height + canvasRect.top,
          left: childLeft + canvasRect.left,
          width: childrect.width
        } as DOMRect);
      }

    }
  }

  /**
   * Rerenders steps with arrows and alignment where needed
   * @param center - Optionally center the flow along the cross axis
   */
  private render(center: boolean = false) {

    let root = this.canvasData.rootElement;
    const rootRect = root.html.getBoundingClientRect();

    this.renderChildren(root, rootRect);

    //   //add arrow class if necessary
    //   if (this.canvasData.elements.length > (i + 1)) {
    //     ele.html.classList.add('arrow');

    //   }
    //   else {
    //     //ele.html.getElementsByClassName('arrow')
    //     ele.html.classList.remove('arrow');
    //   }
    // }
  }

  private findDropLocationForHover(mouseLocation: NgFlowCanvas.CanvasPosition, targetStep: NgFlowCanvas.CanvasElement, canvasRect: DOMRect): [NgFlowCanvas.DropPosition, number] | 'deadzone' | null {

    const stepRect = targetStep.html.getBoundingClientRect();

    const yStepCenter = stepRect.bottom - stepRect.height / 2;
    const xStepCenter = stepRect.left + stepRect.width / 2;

    const yDiff = mouseLocation.y - yStepCenter;
    const xDiff = mouseLocation.x - xStepCenter;

    const absY = Math.abs(yDiff);
    const absX = Math.abs(xDiff);

    if (absY < (stepRect.height * 1.5) && absX < (stepRect.width * 1.5)) {

      if (Math.sqrt(absY * absY + absX * absX) < this.options.hoverDeadzoneRadius) {
        return 'deadzone';
      }

      if (absY > absX) {
        return [yDiff > 0 ? 'BELOW' : 'ABOVE', absY];
      }
      else if (!this.options.isSequential) {
        return [xDiff > 0 ? 'RIGHT' : 'LEFT', absX];
      }
    }

    return null;
  }

  private checkHoverLocation(event: DragEvent) {

    if (!this.canvasData.rootElement) {
      return;
    }

    const mouseLocation: NgFlowCanvas.CanvasPosition = {
      x: event.clientX,
      y: event.clientY
    }

    this.dragHover = null;
    const canvasRect = this.getCanvasRect();
    let bestMatch: [NgFlowCanvas.DropPosition, number] = null;
    let bestStep: NgFlowCanvas.CanvasElement = null;

    for (let i = 0; i < this.canvasData.allElements.length; i++) {
      const step = this.canvasData.allElements[i];

      const position = this.findDropLocationForHover(mouseLocation, step, canvasRect);

      if (position) {
        if (position == 'deadzone') {
          bestMatch = null;
          bestStep = null;
          break;
        }
        else if (bestMatch == null || bestMatch[1] > position[1]) {
          bestMatch = position;
          bestStep = step;
        }
      }
    }

    //TODO make this more efficient. two loops
    this.canvasData.allElements.forEach(step => {
      if (bestStep == null || step.html.id !== bestStep.html.id) {
        step.html.removeAttribute(CONSTANTS.DROP_HOVER_ATTR);
      }
    })

    if (!bestMatch) {
      return;
    }

    bestStep.html.setAttribute(CONSTANTS.DROP_HOVER_ATTR, bestMatch[0].toLowerCase());
    this.dragHover = {
      adjacentElement: bestStep,
      relativePosition: bestMatch[0]
    };

  }

  private getRelativeDropLocation(event: DragEvent): NgFlowCanvas.CanvasPosition {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    console.debug('Mouse Location', mouseX, mouseY);
    console.debug(this.canvasData);
    const canvasRect = this.getCanvasRect();

    //TODO they can drop wherever on first drop, but maybe change this.
    if (this.canvasData.allElements.length == 0) {
      return {
        x: mouseX - canvasRect.left,
        y: mouseY - canvasRect.top
      }
    }

    //TODO i think this can be removed
    else if (this.dragHover) {
      const priorRect = this.dragHover.adjacentElement.html.getBoundingClientRect();
      return {
        x: (priorRect.x) + canvasRect.left,
        y: (priorRect.bottom) - canvasRect.top
      }
    }

    else {
      //TODO scan above drop location to see if something is there
      //add if it is, otherwise return null
    }

    return null;
  }

  private getCanvasRect(): DOMRect {
    return this.getCanvasContentElement().getBoundingClientRect();
  }

  private getCanvasContentElement(): HTMLElement {
    const canvas = this.viewContainer.element.nativeElement as HTMLElement;
    let canvasContent = canvas.getElementsByClassName(CONSTANTS.CANVAS_CONTENT_CLASS).item(0);
    return canvasContent as HTMLElement;
  }

  private createCanvasElement(location: { x: number, y: number }, data: any): NgFlowCanvas.CanvasElement {
    const view: NgFlowChart.StepView = this.viewContainer.createEmbeddedView(this.data.getTemplateRef(), {
      data: data
    });

    view.data = data;

    //TODO move some of this to canvas object
    let canvasCard = (view.rootNodes[0] as HTMLElement);

    this.getCanvasContentElement().appendChild(canvasCard);

    canvasCard.id = Date.now() + '';
    canvasCard.setAttribute('draggable', 'true');
    canvasCard.classList.add(CONSTANTS.CANVAS_STEP_CLASS);

    let element = (view.rootNodes[0] as HTMLElement);

    view.detectChanges();

    canvasCard.setAttribute('style', `position: absolute; left: ${location.x - (element.offsetWidth / 2)}px; top: ${location.y - (element.offsetHeight / 2)}px`);

    return new NgFlowCanvas.CanvasElement((view.rootNodes[0] as HTMLElement), view);
  }

  private addCanvasElement(element: NgFlowCanvas.CanvasElement) {

    if (this.dragHover) {

      let adjacent = this.canvasData.allElements.find(ele => ele.html.id === this.dragHover.adjacentElement.html.id);
      this.canvasData.allElements.push(element);

      //sibling of the dragHover
      switch (this.dragHover.relativePosition) {
        case 'ABOVE':
          this.placeStepAbove(element, adjacent);
          break;
        case 'BELOW':
          this.placeStepBelow(element, adjacent);
          break;
        case 'LEFT':
          this.placeStepAdjacent(element, adjacent);
          break;
        case 'RIGHT':
          this.placeStepAdjacent(element, adjacent, false);
          break;
        default:
          console.error('invalid position', this.dragHover.relativePosition);
      }


    }
    else if (this.canvasData.allElements.length == 0) { //root most element 
      this.canvasData.allElements.push(element);
      this.canvasData.rootElement = element;
    }
  }

  private placeStepAdjacent(newStep: NgFlowCanvas.CanvasElement, adjacentStep: NgFlowCanvas.CanvasElement, isLeft: boolean = true) {
    if (adjacentStep.parent) {
      //find the adjacent steps index in the parents child array
      const adjacentIndex = adjacentStep.parent.children.findIndex(child => child.html.id == adjacentStep.html.id);
      adjacentStep.parent.addChild(newStep, adjacentIndex + (isLeft ? 0 : 1));
    }
    else {
      console.warn('Parallel actions must have a common parent');
    }
  }

  private placeStepAbove(newStep: NgFlowCanvas.CanvasElement, adjacentStep: NgFlowCanvas.CanvasElement) {

    let adjParent = adjacentStep.parent;
    if (adjParent) {
      //we want to remove child and insert our newStep at the same index
      let index = adjParent.removeChild(adjacentStep);
      newStep.addChild(adjacentStep);
      adjParent.addChild(newStep, index);
    }
    else { // new root node
      this.canvasData.rootElement = newStep;
      newStep.addChild(adjacentStep);
    }
  
  }

  private placeStepBelow(newStep: NgFlowCanvas.CanvasElement, adjacentStep: NgFlowCanvas.CanvasElement) {

    if (adjacentStep.children) {
      //move adjacent's children to newStep
      newStep.setChildren(adjacentStep.children.slice());
    }

    //new adjacent child pointer
    adjacentStep.setChildren([newStep]);

  }
}
