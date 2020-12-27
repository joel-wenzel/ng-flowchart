
# NgFlowchart

[Demo](https://joelwenzel.com/projects/flowchart) | [Npm](https://www.npmjs.com/package/@joelwenzel/ng-flowchart) | [Getting started](#getting-started)

An Angular Library for building drag and drop flow charts. Chart behavior is customizable. Data can be exported or uploaded in json or yaml format.

Inspired by [Alyssa X Flowy](https://github.com/alyssaxuu/flowy)

# Contents

- [Demo](https://joelwenzel.com/projects/flowchart)
- [Features](#features)
- [Getting started](#getting-started)
- [Supported Angular versions](#supported-angular-versions)
- [FAQ](#faq)
- [Docs]()
- [Theming]()

## Supported Angular versions

- Angular 10.2.0+

## Current and Upcoming Feature List

- [Chart API](#chart-api) 
- [Generating Output](#generating-output)
- [Controlling Behavior](#controlling-behavior)
- Theming
- Custom Error Messages

- Reading from Input
- Storing step data
- Disabling the chart

## Getting started

1. Install it.

```
npm i --save @joelwenzel/ng-flowchart
```

2. Import it.  
   In your app module or module that contains your editor, import `NgFlowchartModule`.

```
import { NgFlowchartModule } from '@joelwenzel/ng-flowchart';

@NgModule({
  imports: [
    NgFlowchartModule
  ]
})
export class AppModule { }

```

**Note:** You will have to include the styles in your root styles sheet
**src/styles.scss**

```
@import "~@joelwenzel/ng-flowchart/src/assets/ng-flowchart.scss";

```

3. Add your canvas directive

```
<div class="some-container-with-large-dimensions" ngFlowchartCanvas>
</div>
```

4. Add the step directives to any elements that you want to drag into your canvas.
The only required argument (which shares the directive name) is the ng-template that holds your content (I.E the content that will be displayed on the canvas).

    **NOTE**: The steps do not need to be in the same component as the canvas.

```
<div class="palette">
    <div *ngFor="let item of items" [ngFlowchartStep]="stepContent">
        <span>{{item.name}}</span>
    </div>
</div>
<ng-template #stepContent>
    <div class="step-container">
        <div class="step-heading">
            heading
        </div>
        <div class="step-content"> 
            content
        </div>
    </div>
</ng-template>
```

5. There is an optional input to the ngFlowchartStep directive called **ngFlowchartStepData** which can accept any json or string data. This data is available in the ng-template content as **data**.

```
<div class="palette">
    <div *ngFor="let item of items" 
        [ngFlowchartStep]="stepContent" 
        [ngFlowchartStepData]="item"
    >
        <span>{{item.name}}</span>
    </div>
</div>
<ng-template #stepContent let-data="data">
    <div class="step-container">
        <div class="step-heading">
            {{data.name}}
        </div>
        <div class="step-content"> 
            {{data.description}}
        </div>
    </div>
</ng-template>
```
6. For more features and examples checkout the official documentation

## If you enjoy it give it a star

Please star the [repo](https://github.com/joel-wenzel/ng-flowchart) if you liked the library. Your support means everything to me and helps me focus on delivering new features

## Chart API
The entire chart content and functionality is available via the NgFlowchart.Flow class. 
```
//In your component.ts containing the chart

@ViewChild(NgFlowchartCanvasDirective)
canvasElement: NgFlowchartCanvasDirective;

ngOnInit() {
    let flow: NgFlowchart.Flow = this.canvasElement.getFlow();
}
```
The node structure resembles a linked tree with each node having at most 1 parent and n number of children
```
let flow: NgFlowchart.Flow = this.canvasElement.getFlow();

// returns an array of all direct children of the root
flow.getRoot().getChildren()
```
## Flow Object Methods

- #### **getRoot()**
    Returns the root node/step of this flowchart.

- #### **toJSON()**
    Returns the JSON representation of this flowchart.

- #### **render()**
    Re-renders the flowchart. This should only be needed in rare circumstances.

- #### **getStep(id)**
    Returns a step in the flowchart with the given id. Steps are created with the id of the html element id.

- #### **clear()**
    Clears the current flow, reseting the canvas. canDeleteStep callbacks will not be called from this method.

## Step Object Methods
- #### **toJSON()**
    Returns the JSON representation of this step.

- #### **getId()**
    Returns the id(html element id) of this canvas step.

- #### **getData()**
    Returns the referenced data object passed via the ngFlowchartStepData input.

- #### **getParent()**
    Returns the parent step. This can be null if this is the root node.

- #### **hasChildren()**
    Returns true if the step has at least 1 child.

- #### **isRootStep()**
    Returns true if this is the root node of the whole chart

- #### **getChildren()**
    Returns all direct children of this step. To get all descendants you can recursively keep calling getChildren().

- #### **delete(recursive = false)**
    Deletes this node from the tree. Returns true or false if delete was a success.

- #### **addChild(template, options?)**
    Adds a direct child of this step using the templateRef content and data

## Generating Output
The flowchart can be exported in json format via the Flow object or Step object.
```
//In your component.ts containing the chart

@ViewChild(NgFlowchartCanvasDirective)
canvasElement: NgFlowchartCanvasDirective;

onButtonClicked() {
    const json = this.canvasElement.getFlow().toJSON();
    console.log(json);
}

```
Here is sample json output for a very basic 3 node chart
```
{
  "name": "Sample Flowchart",
  "root": {
    "id": "s1608918280530",
    "data": {
      "name": "Do Action",
      "inputs": [
        {
          "name": "ACTION",
          "value": "TRANSLATE"
        }
      ]
    },
    "children": [
      {
        "id": "s1608918283650",
        "data": {
          "name": "Do Action",
          "inputs": [
            {
              "name": "ACTION",
              "value": null
            }
          ]
        },
        "children": []
      },
      {
        "id": "s1608918285174",
        "data": {
          "name": "Notification",
          "inputs": [
            {
              "name": "Address",
              "value": "sample.email@email.com"
            }
          ]
        },
        "children": []
      }
    ]
  }
}

```
## Controlling Behavior
In addition to the [Chart API](#chart-api) above there are also several hooks and options to make the chart behave the way you want it to.

### Options
Options are passed via the **ngFlowchartOptions** input on the **ngFlowchartCanvas** directive.
```
<div
    id="canvas"
    ngFlowchartCanvas
    [ngFlowchartOptions]="{
      stepGap: 40
    }"
></div>
```
- #### **stepGap**
    The gap (in pixels) between chart steps. Default is 40.
- #### **hoverDeadzoneRadius**
    An inner deadzone radius (in pixels) that will not register the hover icon. The default is 20.
- #### **isSequential**
    Is the flow sequential? If true, then you will not be able to drag parallel steps.

### Callbacks
Callbacks are passed via the **ngFlowchartCallbacks** input on the **ngFlowchartCanvas** directive.
```
<div
    id="canvas"
    ngFlowchartCanvas
    [ngFlowchartOptions]="{
      stepGap: 40
    }"
    [ngFlowchartCallbacks]="callbacks"
></div>
```
```
//in your component.ts

callbacks: NgFlowchart.Callbacks = {};

constructor() {
  //be sure to bind this to the callback if you want to access this classes context
   this.callbacks.canMoveStep = this.canMoveStep.bind(this);
   this.callbacks.canAddStep = this.canAddStep.bind(this); 
}

canMoveStep(dropEvent: NgFlowchart.DropEvent): boolean {
    console.log(dropEvent);

    return true;
}

canAddStep(dropEvent: NgFlowchart.DropEvent): boolean {
    console.log(dropEvent);
    return true;
}

```
- #### **canAddStep?**: (dropCandidate: DropEvent) => boolean;
- #### **canMoveStep?**: (moveCandidate: DropEvent) => boolean;
- #### **canDeleteStep?**: (step: Step) => boolean;
- #### **onDropError?**: (drop: DropEvent) => void;
- #### **onDropStep?**: (drop: DropEvent) => void;
- #### **onMoveStep?**: (drop: DropEvent) => void;
## FAQ

### My step isnt dropping in the correct spot
The most common reason your step isnt dropping correctly is that you forgot to [include the stylesheet](#getting-started) for the module.

### Undefined variables in a callback
If you are trying to access your component variables and functions inside a callback be sure that you bound the "this" object when assigning the callback.
```
this.callbacks.canMoveStep = this.canMoveStep.bind(this);
```