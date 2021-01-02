import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgFlowchart } from '../model/flow.model';
import { CONSTANTS } from '../model/flowchart.constants';
import { NgFlowchartCanvasService } from '../ng-flowchart-canvas.service';
import { DragStep } from '../services/dropdata.service';

@Component({
  template: ''
})
export abstract class NgFlowchartAbstractStep implements OnInit, AfterViewInit {

  @HostListener('dragstart', ['$event'])
  protected onMoveStart(event: DragEvent) {
    this.hideTree();
    event.dataTransfer.setData('type', 'FROM_CANVAS');
    event.dataTransfer.setData('id', this.nativeElement.id);

  }

  @HostListener('dragend', ['$event'])
  protected onMoveEnd(event: DragEvent) {
    this.showTree();
  }

  //could potentially try to make this abstract
  @ViewChild('canvasContent')
  view: ElementRef;

  @Input()
  data: any;

  @Input()
  canvas: NgFlowchartCanvasService;

  @Output()
  viewInit = new EventEmitter();

  private _id: any;
  private _currentPosition = [0, 0];

  //only used if something tries to set the position before view has been initialized
  private _initPosition;
  private _isHidden = false;
  private parent: NgFlowchartAbstractStep;
  private children: Array<NgFlowchartAbstractStep>;

  constructor() {
    this.children = [];
  }

  abstract getDropPositionsForStep(pendingStep: DragStep): NgFlowchart.DropPosition[] | null;

  abstract canDrop(dropEvent: NgFlowchart.DropTarget): boolean;

  abstract canDeleteStep(): boolean;

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if(!this.nativeElement) {
      throw 'Missing canvasContent ViewChild. Be sure to add #canvasContent to your root html element.'
    }

    this.nativeElement.classList.add('ngflowchart-step-wrapper');
    this.nativeElement.setAttribute('draggable', 'true');
    
    if (this._initPosition) {
      this.setPosition(this._initPosition[0], this._initPosition[1]);
    }
    this.nativeElement.id = 's' + Date.now();
    this._id = this.nativeElement.id;
    this.viewInit.emit();
  }

  get id() {
    return this._id;
  }

  get currentPosition() {
    return this._currentPosition;
  }

  setPosition(x: number, y: number, offsetCenter: boolean = false) {
    if (!this.view) {
      console.warn('Trying to set position before view init');
      //save pos and set in after view init
      this._initPosition = [x, y];
      return;
    }

    let adjustedX = x - (offsetCenter ? this.nativeElement.offsetWidth / 2 : 0);
    let adjustedY = y - (offsetCenter ? this.nativeElement.offsetHeight / 2 : 0);

    this.nativeElement.style.left = `${adjustedX}px`;
    this.nativeElement.style.top = `${adjustedY}px`;

    this._currentPosition = [adjustedX, adjustedY];
  }

  addChildSibling0(child: NgFlowchartAbstractStep, index?: number): void {
    if (child.getParent()) {
      child.getParent().removeChild(child);
    }

    if (!this.children) {
      this.children = [];
    }
    if (index == null) {
      this.children.push(child);
    }
    else {
      this.children.splice(index, 0, child);
    }

    //since we are adding a new child here, it is safe to force set the parent
    child.setParent(this, true);
  }

  addChild0(newChild: NgFlowchartAbstractStep): boolean {

    if (newChild.getParent()) {
      newChild.getParent().removeChild(newChild);
    }

    if (this.hasChildren()) {
      if (newChild.hasChildren()) {
        //if we have children and the child has children we need to confirm the child doesnt have multiple children at any point
        let newChildLastChild = newChild.findLastSingleChild();
        if (!newChildLastChild) {
          console.error('Invalid move. A node cannot have multiple parents');
          return false;
        }
        //move the this nodes children to last child of the step arg
        newChildLastChild.setChildren(this.getChildren().slice());
      }
      else {
        //move adjacent's children to newStep
        newChild.setChildren(this.getChildren().slice());
      }

    }
    //finally reset this nodes to children to the single new child
    this.setChildren([newChild]);
    return true;
  }


  removeChild(childToRemove: NgFlowchartAbstractStep): number {
    if (!this.children) {
      return -1;
    }
    const i = this.children.findIndex(child => child.id == childToRemove.id);
    if (i > -1) {
      this.children.splice(i, 1);
    }

    return i;
  }

  setParent(newParent: NgFlowchartAbstractStep, force: boolean = false): void {
    if (this.parent && !force) {
      console.warn('This child already has a parent, use force if you know what you are doing');
      return;
    }
    this.parent = newParent;
  }

  destroy(recursive: boolean = true, checkCallbacks: boolean = true): boolean {

    if (this.canDeleteStep()) {
      //remove parents child ref
      //only want to call this on the root of the delete
      let parentIndex;
      if (this.parent) {
        parentIndex = this.parent.removeChild(this);
      }

      this.destroy0(parentIndex, recursive);
      return true;
    }

    return false;
  }

  clearHoverIcons() {
    this.nativeElement.removeAttribute(CONSTANTS.DROP_HOVER_ATTR);
  }

  showHoverIcon(position: NgFlowchart.DropPosition) {
    this.nativeElement.setAttribute(CONSTANTS.DROP_HOVER_ATTR, position.toLowerCase());
  }

  isRootElement() {
    return !this.parent;
  }

  hasChildren(count: number = 1) {
    return this.children && this.children.length >= count;
  }

  getChildren() {
    return this.children;
  }

  getParent() {
    return this.parent;
  }

  getNodeTreeWidth(stepGap: number) {
    const currentNodeWidth = this.nativeElement.getBoundingClientRect().width;

    if (!this.hasChildren()) {
      return this.nativeElement.getBoundingClientRect().width;
    }

    let childWidth = this.getChildren().reduce((childTreeWidth, child) => {
      return childTreeWidth += child.getNodeTreeWidth(stepGap);
    }, 0)

    childWidth += stepGap * (this.getChildren().length - 1);

    return Math.max(currentNodeWidth, childWidth);
  }

  isHidden() {
    return this._isHidden;
  }

  /**
   * Return current rect of this step. The position can be animated so getBoundingClientRect cannot 
   * be reliable for positions
   * @param canvasRect Optional canvasRect to provide to offset the values
   */
  getCurrentRect(canvasRect?: DOMRect): Partial<DOMRect> {
    let clientRect = this.nativeElement.getBoundingClientRect();

    return {
      bottom: this._currentPosition[1] + clientRect.height + (canvasRect?.top || 0),
      left: this._currentPosition[0] + (canvasRect?.left || 0),
      height: clientRect.height,
      width: clientRect.width,
      right: this._currentPosition[0] + clientRect.width + (canvasRect?.left || 0),
      top: this._currentPosition[1] + (canvasRect?.top || 0)
    }
  }

  toJSON() {
    return {
      id: this.id,
      data: this.data,
      children: this.hasChildren() ? this.getChildren().map(child => {
        return child.toJSON()
      }) : []
    }
  }

  get nativeElement(): HTMLElement {
    return this.view?.nativeElement;
  }

  protected setId(id) {
    this._id = id;
  }



  private hideTree() {
    this._isHidden = true;
    this.nativeElement.style.opacity = '.4';

    document.querySelectorAll(`.${this.nativeElement.id}.arrow`).forEach(
      ele => (ele as HTMLElement).style.opacity = '.2'
    )

    if (this.hasChildren()) {
      this.getChildren().forEach(child => {
        child.hideTree();
      })
    }
  }

  private showTree() {
    this._isHidden = false;

    document.querySelectorAll(`.arrow.${this.nativeElement.id}`).forEach(
      ele => (ele as HTMLElement).style.opacity = '1'
    )

    this.nativeElement.style.opacity = '1';
    if (this.hasChildren()) {
      this.getChildren().forEach(child => {
        child.showTree();
      })
    }
  }



  private findLastSingleChild() {
    //two or more children means we have no single child
    if (this.hasChildren(2)) {
      return null;
    }
    //if one child.. keep going down the tree until we find no children or 2 or more
    else if (this.hasChildren()) {
      return (this.getChildren()[0] as NgFlowchartAbstractStep).findLastSingleChild();
    }
    //if no children then this is the last single child
    else return this;
  }




  private setChildren(children: Array<NgFlowchartAbstractStep>): void {
    this.children = children;
    this.children.forEach(child => {
      child.setParent(this, true);
    })
  }

  private destroy0(parentIndex, recursive: boolean = true) {

    // this.view.destroy();
    // //remove from master array
    // let index = this.canvasRef.canvasData.allElements.findIndex(ele => ele.html.id == this.html.id);
    // if (index >= 0) {
    //   this.canvasRef.canvasData.allElements.splice(index, 1);
    // }

    // if (this.hasChildren()) {

    //   //this was the root node
    //   if (!this.parent && !recursive) {

    //     //set first child as new root
    //     this.canvasRef.canvasData.rootElement = this.children[0];
    //     this.children[0].parent = null;

    //     //make previous siblings children of the new root
    //     if (this.children.length > 1) {
    //       for (let i = 1; i < this.children.length; i++) {
    //         let child = this.children[i];
    //         this.children[0].addChild(child);
    //       }
    //     }

    //   }

    //   //update children
    //   for (let i = 0; i < this.children.length; i++) {
    //     let child = this.children[i];
    //     if (recursive) {
    //       child.destroy0(null, true);
    //     }
    //     else if (!!this.parent) {
    //       this.parent.addChild(child, i + parentIndex);
    //     }
    //   }
    //   this.children = [];
    // }



    // this.parent = null;
  }


}
