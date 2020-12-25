import { Injectable, ViewContainerRef } from '@angular/core';
import { NgFlowCanvas } from './model/canvas.model';
import { NgFlowChart } from './model/flow.model';
import { CONSTANTS } from './model/flowchart.constants';
import { NgFlowchartDataService } from './ng-flowchart-data.service';



@Injectable()
export class NgFlowchartCanvasService {

  canvasData: NgFlowCanvas.Canvas;
  viewContainer: ViewContainerRef;

  options: NgFlowChart.Options;
  callbacks: NgFlowChart.Callbacks;

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

  public init(view: ViewContainerRef, callbacks?: NgFlowChart.Callbacks, options?: NgFlowChart.Options) {
    console.debug('init');
    this.viewContainer = view;
    this.options = options || new NgFlowChart.Options();
    this.callbacks = callbacks || {};
  }

  public onDragStep(drag: DragEvent) {
    this.checkHoverLocation(drag);
  }

  public dropCanvasStep(event: DragEvent, id: any) {
    let step = this.findCanvasElementById(id);

    if (step.isRootElement()) {

      let relativeDropLoc = this.getRelativeDropLocation(event, true);

      if (relativeDropLoc) {
        step.setPosition(relativeDropLoc.x - step.html.offsetWidth / 2, relativeDropLoc.y - (step.html.offsetHeight / 2));
      }

      this.render();




    }
    else if (this.dragHover) {
      this.moveCanvasElement(step);
      this.render();
    }
    else {
      step.cancelDrag();
    }

  }

  public dropPaletteStep(drag: DragEvent, data: any) {
    console.debug('Drop step ', data);

    let relativeDropLoc = this.getRelativeDropLocation(drag, this.canvasData.allElements.length == 0);
    console.debug('Drop location ', relativeDropLoc);

    if (relativeDropLoc) {
      //create the template
      let view = this.createCanvasElement(relativeDropLoc, data);
      view.setPosition(relativeDropLoc.x - view.html.offsetWidth / 2, relativeDropLoc.y - (view.html.offsetHeight / 2));

      if (!this.canDropElement(view, this.dragHover?.adjacentElement)) {
        this.cancelDrop(view, this.dragHover?.adjacentElement);
        this.destroyStep(view);
        return;
      }

      this.addCanvasElement(view);

      this.render();
    }
  }

  public destroyStepFromId(id: any, recursive: boolean) {
    let view = this.canvasData.allElements.find(ele => ele.html.id == id);
    if (view) {
      view.destroy(recursive);
      this.render();
    }
  }

  private destroyStep(view: NgFlowCanvas.CanvasElement) {
    view.destroy();
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
    if (element.hasChildren()) {
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

        child.setPosition(childLeft, childYPos);

        //check for canvas height/width adjustments
        //TODO possibly resize to smaller if elements are removed
        if (childYPos + childrect.height > (canvasRect.height - childrect.height)) {
          this.getCanvasContentElement().style.height = `${canvasRect.height + childrect.height * 2}px`;
        }

        if (childLeft + childrect.width + this.options.stepGap > canvasRect.width - childrect.width / 2) {
          this.getCanvasContentElement().style.width = `${canvasRect.width + childrect.width}px`;
        }

        childXPos += childExtent;

        const mockRect = {
          bottom: childYPos + childrect.height + canvasRect.top,
          left: childLeft + canvasRect.left,
          width: childrect.width
        } as DOMRect;

        this.addArrow(element.html.id, currentRect, mockRect, canvasRect);



        //since the element hasnt actually updated position yet, we need to create a fake DOMRect and pass it
        //otherwise we could just refetch the bounding rect
        this.renderChildren(child, mockRect);
      }

    }
  }

  addArrow(parentId, parentRect: DOMRect, childRect: DOMRect, canvasRect: DOMRect) {
    let div = document.createElement('div') as HTMLElement;

    div.style.position = 'absolute';
    div.classList.add('arrow');
    div.classList.add(parentId);
    div.style.height = `${this.options.stepGap}px`;

    div.style.top = `${parentRect.bottom - canvasRect.top}px`;

    const parentCenterX = (parentRect.left - canvasRect.left) + parentRect.width / 2;
    const childCenterX = (childRect.left - canvasRect.left) + childRect.width / 2;

    let top = document.createElement('div');
    top.classList.add('arrow-section');
    top.setAttribute('style', `width: 100%; height: 50%;`);
    let bottom = document.createElement('div');
    bottom.classList.add('arrow-section');
    bottom.setAttribute('style', `width: 100%; height: 50%;`);

    const border = '2px solid #b4b4b4';

    //child is to the right
    if (parentRect.left < childRect.left) {
      div.style.left = `${parentCenterX}px`;
      div.style.width = `${childCenterX - parentCenterX}px`;

      top.style.borderLeft = border;
      top.style.borderBottom = border;
      bottom.style.borderRight = border;
    }
    //child is to the left
    else if (parentRect.left > childRect.left) {
      div.style.left = `${childCenterX}px`;
      div.style.width = `${parentCenterX - childCenterX}px`;

      top.style.borderRight = border;
      top.style.borderBottom = border;
      bottom.style.borderLeft = border;
    }
    //right beneath
    else {
      div.style.width = '2px';
      div.style.left = `${(parentRect.left - canvasRect.left) + parentRect.width / 2}px`;
      div.style.background = '#b4b4b4';

    }

    div.appendChild(top);
    div.appendChild(bottom);

    this.getCanvasContentElement().appendChild(div);
  }

  public reRender() {
    this.render();
  }

  /**
   * Rerenders steps with arrows and alignment where needed
   * @param center - Optionally center the flow along the cross axis
   */
  private render(center: boolean = false) {

    document.querySelectorAll('.arrow').forEach(
      ele => ele.remove()
    )

    let root = this.canvasData.rootElement;

    if (!root) {
      return;
    }

    const rootRect = root.html.getBoundingClientRect();

    this.renderChildren(root, rootRect);

    root.showTree();
  }

  private findDropLocationForHover(mouseLocation: NgFlowCanvas.CanvasPosition, targetStep: NgFlowCanvas.CanvasElement, canvasRect: DOMRect): [NgFlowCanvas.DropPosition, number] | 'deadzone' | null {

    const stepRect = targetStep.html.getBoundingClientRect();

    const yStepCenter = stepRect.bottom - stepRect.height / 2;
    const xStepCenter = stepRect.left + stepRect.width / 2;

    const yDiff = mouseLocation.y - yStepCenter;
    const xDiff = mouseLocation.x - xStepCenter;

    const absY = Math.abs(yDiff);
    const absX = Math.abs(xDiff);

    const distance = Math.sqrt(absY * absY + absX * absX);
    const accuracyRadius = (stepRect.height + stepRect.width) / 2;

    if (distance < accuracyRadius) {
      if (distance < this.options.hoverDeadzoneRadius) {
        //basically we are too close to the middle to accurately predict what position they want
        return 'deadzone';
      }

      if (absY > absX) {
        return [yDiff > 0 ? 'BELOW' : 'ABOVE', absY];
      }
      else if (!this.options.isSequential && !targetStep.isRootElement()) {
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
      if (!step.isHoverTarget()) {
        continue;
      }

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

  private getRelativeDropLocation(event: DragEvent, isRoot: boolean): NgFlowCanvas.CanvasPosition {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    console.debug('Mouse Location', mouseX, mouseY);
    console.debug(this.canvasData);
    const canvasRect = this.getCanvasRect();

    if (!this.dragHover && !isRoot) {
      return null;
    }
    return {
      x: mouseX - canvasRect.left,
      y: mouseY - canvasRect.top
    }
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

    this.getCanvasContentElement().appendChild((view.rootNodes[0] as HTMLElement));

    let canvasEle = new NgFlowCanvas.CanvasElement(view, this);
    canvasEle.setPosition(location.x, location.y);

    return canvasEle;
  }

  private canDropElement(element: NgFlowCanvas.CanvasElement, adjacent: NgFlowCanvas.CanvasElement) {
    if (this.callbacks.canAddStep) {
      return this.callbacks.canAddStep(element, adjacent, this.dragHover?.relativePosition);
    }
    return true;
  }

  private canMoveElement(element: NgFlowCanvas.CanvasElement, adjacent: NgFlowCanvas.CanvasElement) {
    if (this.callbacks.canMoveStep && !this.callbacks.canMoveStep(element, adjacent, this.dragHover.relativePosition)) {
      console.log('user said we cant move');
      return false;
    }


    if (this.dragHover.relativePosition == 'BELOW') {
      if (adjacent.hasChildren() && !this.stepOnlyHasSingleChildren(element)) {
        console.error('cannot move a node with multiple children to a node with children');
        return false;
      }

    }

    return true;
  }

  private cancelDrop(element: NgFlowCanvas.CanvasElement, adjacent: NgFlowCanvas.CanvasElement) {
    element.cancelDrag();
    if (adjacent) {
      adjacent.html.style.animation = "wiggle .2s linear 4";

      setTimeout(() => {
        adjacent.html.style.animation = null;
      }, 300)
    }

  }

  private moveCanvasElement(element: NgFlowCanvas.CanvasElement) {
    //TODO callback to consumer/user on error

    if (!this.dragHover) {
      return;
    }
    let adjacent = this.dragHover.adjacentElement;

    if (!this.canMoveElement(element, adjacent)) {
      this.cancelDrop(element, adjacent);
      return;
    }

    //remove elements parents' child ref
    element.parent.removeChild(element);

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

  private addCanvasElement(element: NgFlowCanvas.CanvasElement) {

    if (this.dragHover) {

      let adjacent = this.dragHover.adjacentElement;

      this.canvasData.allElements.push(element);
      element.html.classList.add('placed');

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

  private stepOnlyHasSingleChildren(newStep: NgFlowCanvas.CanvasElement) {
    if (newStep.hasNOrMoreChildren(2)) {
      return false;
    }
    else if (newStep.hasChildren()) {
      return this.stepOnlyHasSingleChildren(newStep.children[0]);
    }
    else return true;
  }

  private findLastSingleChild(step: NgFlowCanvas.CanvasElement) {
    if (step.hasNOrMoreChildren(2)) {
      return null;
    }
    else if (step.hasChildren()) {
      return this.findLastSingleChild(step.children[0]);
    }
    else return step;
  }

  private placeStepBelow(newStep: NgFlowCanvas.CanvasElement, adjacentStep: NgFlowCanvas.CanvasElement) {
    //if the newStep

    if (adjacentStep.hasChildren()) {
      if (newStep.hasChildren()) {
        let lastChild = this.findLastSingleChild(newStep);
        console.log(lastChild);
        if (!lastChild) {
          console.error('Invalid move');
          return;
        }
        //move adjacent's children to last child of new step
        lastChild.setChildren(adjacentStep.children.slice());
      }
      else {
        //move adjacent's children to newStep
        newStep.setChildren(adjacentStep.children.slice());
      }

    }

    //new adjacent child pointer
    adjacentStep.setChildren([newStep]);

  }

  private findCanvasElementById(id) {
    return this.canvasData.allElements.find(ele => ele.html.id === id);
  }
}
