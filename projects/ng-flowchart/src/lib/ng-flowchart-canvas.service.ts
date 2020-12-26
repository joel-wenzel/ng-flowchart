import { Injectable, ViewContainerRef } from '@angular/core';
import { NgFlowCanvas } from './model/canvas.model';
import { NgFlowchart } from './model/flow.model';
import { CONSTANTS } from './model/flowchart.constants';
import { NgFlowchartDataService } from './ng-flowchart-data.service';



@Injectable()
export class NgFlowchartCanvasService {

  canvasData: NgFlowCanvas.Canvas;
  viewContainer: ViewContainerRef;

  options: NgFlowchart.Options;
  callbacks: NgFlowchart.Callbacks;

  dragHover: {
    adjacentElement: NgFlowCanvas.CanvasElement,
    relativePosition: NgFlowchart.DropPosition
  };

  constructor(private data: NgFlowchartDataService) {
    this.canvasData = new NgFlowCanvas.Canvas();

    window['canvas'] = this.canvasData;
  }

  public init(view: ViewContainerRef, callbacks?: NgFlowchart.Callbacks, options?: NgFlowchart.Options) {
    this.viewContainer = view;
    this.options = options || new NgFlowchart.Options();
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

  public dropPaletteStep(drag: DragEvent) {

    let relativeDropLoc = this.getRelativeDropLocation(drag, this.canvasData.allElements.length == 0);

    if (relativeDropLoc) {
      //create the template
      let view = this.createCanvasElement(relativeDropLoc);
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

  private renderChildTree(rootNode: NgFlowCanvas.CanvasElement, rootRect: DOMRect) {
    //the rootNode passed in is already rendered. just need to render its children /subtree

    if (!rootNode.hasChildren()) {
      return;
    }
    const canvasRect = this.getCanvasRect();

    //top of the child row is simply the relative bottom of the root + stepGap
    const childYTop = (rootRect.bottom - canvasRect.top) + this.options.stepGap;
    const rootXCenter = (rootRect.left - canvasRect.left) + (rootRect.width / 2);


    //get the width of the child trees
    let childTreeWidths = {};
    let totalTreeWidth = 0;

    rootNode.children.forEach(child => {
      let totalChildWidth = child.getNodeTreeWidth();
      childTreeWidths[child.html.id] = totalChildWidth;
      child.html.innerText = totalChildWidth + "";
      totalTreeWidth += totalChildWidth;
    });

    //add length for stepGaps between child trees
    totalTreeWidth += (rootNode.children.length - 1) * this.options.stepGap;


    //if we have more than 1 child, we want half the extent on the left and half on the right
    let leftXTree = rootXCenter - (totalTreeWidth / 2);

    rootNode.children.forEach(child => {
      let rect = child.html.getBoundingClientRect();
      let childExtent = childTreeWidths[child.html.id];

      let childLeft = leftXTree + (childExtent / 2) - (rect.width / 2);
      child.setPosition(childLeft, childYTop);

      //need to offset the rects from the canvas since the beginning will offset them
      let childRect = {
        bottom: childYTop + rect.height + canvasRect.top,
        left: childLeft + canvasRect.left,
        width: rect.width
      } as DOMRect

      this.addArrow(rootNode.html.id, rootRect, childRect, canvasRect);

      this.renderChildTree(child, childRect);
      leftXTree += childExtent + this.options.stepGap;
    })

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

    this.renderChildTree(root, rootRect);
    root.showTree();

    this.adjustDimensions();

  }

  private adjustDimensions() {
    const canvasRect = this.getCanvasRect();
   
    let maxRight = 0;
    let maxBottom = 0;
  
    //TODO this can be better
    this.canvasData.allElements.forEach(
      ele => {
        let rect = ele.html.getBoundingClientRect()
        maxRight = Math.max(rect.right, maxRight);
        maxBottom = Math.max(rect.bottom, maxBottom);
      }
    );
    
    const widthDiff = canvasRect.width - (maxRight - canvasRect.left);
    if(widthDiff < 100) {
      this.getCanvasContentElement().style.width = `${canvasRect.width + 200}px`;
    }

    const heightDiff = canvasRect.height - (maxBottom - canvasRect.top);
    if(heightDiff < 100) {
      this.getCanvasContentElement().style.height = `${canvasRect.height + 200}px`;
    }
    
  }

  private findDropLocationForHover(mouseLocation: NgFlowCanvas.CanvasPosition, targetStep: NgFlowCanvas.CanvasElement, canvasRect: DOMRect): [NgFlowchart.DropPosition, number] | 'deadzone' | null {

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
    let bestMatch: [NgFlowchart.DropPosition, number] = null;
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


  private createCanvasElement(location: { x: number, y: number }): NgFlowCanvas.CanvasElement {

    const view: NgFlowchart.StepView = this.viewContainer.createEmbeddedView(this.data.getTemplateRef().template, {
      data: this.data.getTemplateRef().data
    });

    view.data = this.data.getTemplateRef().data;

    this.getCanvasContentElement().appendChild((view.rootNodes[0] as HTMLElement));

    let canvasEle = new NgFlowCanvas.CanvasElement(view, this);
    canvasEle.setPosition(location.x, location.y);

    return canvasEle;
  }

  private canDropElement(element: NgFlowCanvas.CanvasElement, adjacent: NgFlowCanvas.CanvasElement) {
    if (this.callbacks.canAddStep) {
      return this.callbacks.canAddStep(this.getChartDrop(element, 'PENDING'));
    }
    return true;
  }

  private canMoveElement(element: NgFlowCanvas.CanvasElement, adjacent: NgFlowCanvas.CanvasElement) {
    if (
      this.callbacks.canMoveStep &&
      !this.callbacks.canMoveStep(this.getChartDrop(element, 'PENDING'))
    ) {
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

    //TODO better reasons
    if (this.callbacks.onDropError) {
      this.callbacks.onDropError(this.getChartDrop(element, 'FAILED', 'TODO'))
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

  private getChartDrop(element: NgFlowCanvas.CanvasElement, status: NgFlowchart.DropStatus, error?: string): NgFlowchart.DropEvent {
    return {
      step: new NgFlowchart.Step(element, this),
      position: this.dragHover?.relativePosition || null,
      adjacent: this.dragHover ? new NgFlowchart.Step(this.dragHover.adjacentElement, this) : null,
      status: status,
      error: error
    }
  }
}
