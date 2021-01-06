
# NgFlowchart

[Demo](https://joelwenzel.com/projects/flowchart?palette=standard) | [Npm](https://www.npmjs.com/package/@joelwenzel/ng-flowchart) | [Getting started](#getting-started)

A lightweight Angular Library for building drag and drop flow charts. Chart behavior and steps are customizable. Data can be exported or uploaded in json format.

Inspired by [Alyssa X Flowy](https://github.com/alyssaxuu/flowy)

# Contents

- [Demo](https://joelwenzel.com/projects/flowchart?palette=standard)
- [Features](#features)
- [Getting started](#getting-started)
- [Supported Angular versions](#supported-angular-versions)
- [FAQ](#faq)
- [Docs]()

## Supported Angular versions

- Angular 10.2.0+

## Current and Upcoming Feature List

- [Chart API](#chart-api) 
- [Generating Output](#generating-output)
- [Controlling Behavior](#controlling-behavior)
- [Custom Steps](#custom-steps)
- [Uploading from JSON](#uploading-json)
- [Theming](#theming)
- Custom Error Messages

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

3. Add your canvas directive

```
<div class="some-container-with-large-dimensions" ngFlowchartCanvas>
</div>
```

4. Add the step directives to any elements that you want to drag into your canvas.
The directive requires an input, an object containing the templateRef, stepType and optional data. See the [wiki](#) for more information.

    **NOTE**: The steps do not need to be in the same component as the canvas.

```
<div class="palette">
    <div *ngFor="let item of items" [ngFlowchartStep]="{
      template: stepContent,  //templateRef or Type<NgFlowchartStepComponent>
      type: item.type,  //any unique string. used to classify the step in json
      data: item.data  //optional config data
    }">
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
5. The **template field** on the ngFlowchartStep directive can contain a **TemplateRef**, as seen above, **or a component type** extending from NgFlowchartStepComponent. 

    **For more complex steps** that may need to have specific rules or add their own children, you should create a [custom step component](#). 

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
flow.getRoot().children

// the following two lines return the same node
flow.getRoot()
flow.getRoot().children[0].parent
```
## Flow Object Methods

- #### **getRoot(): NgFlowchartStepComponent**
    Returns the root node/step of this flowchart.

- #### **toJSON(indent?: number): void**
    Returns the JSON representation of this flowchart. Optionally specify an indent factor

- #### **render(pretty?: boolean): void**
    Re-renders the flowchart. This should only be needed in rare circumstances.
    Pretty will attempt to re-center the flow in the canvas

- #### **getStep(id): NgFlowchartStepComponent**
    Returns a step in the flowchart with the given id. Steps are created with the id of the html element id.

- #### **clear(): void**
    Clears the current flow, reseting the canvas. canDeleteStep callbacks will not be called from this method.

- #### **upload(json: string): Promise<void>**
    Clears the existing flow and uploads a new flow from the json string representation.


## Step Object Methods and Properties
See the [wiki](#) for the full list and descriptions

- #### **data: any**
    The optional config data for the step, passed in the ngFlowchartStep directive
- #### **children: Array\<NgFlowchartStepComponent>**
    The array of direct children of this step
- #### **parent: NgFlowchartStepComponent**
    The parent step of this step
- #### **type: string**
    The step type as passed in the ngFlowchartStep directive

- #### **addChild(pending: NgFlowchart.PendingStep, options?: AddChildOptions)**
    Creates and adds a child to this step

- #### **destroy(recursive = true, checkcallbacks = true)**
    Destroys this step component and updates all necessary child and parent relationships

- #### **removeChild(child: NgFlowchartStepComponent)**
    Remove a child from this step. Returns the index at which the child was found or -1 if not found.

## Generating Output
The flowchart can be exported in json format via the Flow object or Step object.
```
//In your component.ts containing the chart

@ViewChild(NgFlowchartCanvasDirective)
canvasElement: NgFlowchartCanvasDirective;

onButtonClicked() {
    const json = this.canvasElement.getFlow().toJSON(2);
    console.log(json);
}

```
Here is sample json output for a very basic 3 node chart
```
{
  "root": {
    "id": "s1608918280530",
    "type": "sample-step",
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
        "type": "do-action",
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
          "type": "notification",
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
- #### **rootPosition**
    Set the default root position of the chart.
    - TOP_CENTER - Centered on the X and near the top of the Y axis
    - CENTER - Centered on both the x and y axis
    - FREE - Leave the root node wherever dropped

- #### **centerOnResize**
    When a canvas resize is detected, should the flow be re-centered? Default is true

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
   this.callbacks.onDropError = this.onDropError.bind(this);
   this.callbacks.onDropStep = this.onDropStep.bind(this); 
}

onDropError(dropEvent: NgFlowchart.DropEvent) {
    console.log(dropEvent);
    //show some popup
}

onDropStep(dropEvent: NgFlowchart.DropEvent) {
    console.log(dropEvent);
}

```
- #### **onDropError?**: (drop: DropEvent) => void;
- #### **onDropStep?**: (drop: DropEvent) => void;
# Theming
For the most part, the theme is left to the user given they have complete control over the canvas content via the step templates. However, connectors and drop icons can be styled by overriding a few css classes. 
**These styles should be placed in your root styles.scss or prefix with ::ng-deep**
```
/** The drop icon outer circle */
.ngflowchart-step-wrapper[ngflowchart-drop-hover]::after {
  background: #a3e798 !important;
}

/** The drop icon inner circle */
.ngflowchart-step-wrapper[ngflowchart-drop-hover]::before {
  background: #4cd137 !important;
}

/** The arrow paths and arrow head */
.ngflowchart-arrow {
  & #arrowhead {
    fill: darkgrey;
  }

  & #arrowpath {
    stroke: darkgrey;
  }
}

```


## FAQ

### Undefined variables in a callback
If you are trying to access your component variables and functions inside a callback be sure that you bound the "this" object when assigning the callback.
```
this.callbacks.canMoveStep = this.canMoveStep.bind(this);
```