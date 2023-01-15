# NgFlowchart

[Demo](https://joelwenzel.com/projects/flowchart?palette=standard) | [Npm](https://www.npmjs.com/package/@joelwenzel/ng-flowchart) | [Getting started](#getting-started) | [Wiki](https://github.com/joel-wenzel/ng-flowchart/wiki/NgFlowchart)

A lightweight Angular Library for building drag and drop flow charts. Chart behavior and steps are customizable. Data can be exported or uploaded in json format.

Inspired by [Alyssa X Flowy](https://github.com/alyssaxuu/flowy)

# Contents

- [Demo](https://joelwenzel.com/projects/flowchart?palette=standard)
- [Supported Angular versions](#supported-angular-versions)
- [Features](#features)
- [Getting started](#getting-started)
- [Contributers](#contributers)
- [FAQ](#faq)
- [Docs](https://github.com/joel-wenzel/ng-flowchart/wiki/NgFlowchart)

## Supported Angular versions

- Angular 10.2.0+

## Change Log

- 1.0.2-beta

  - Support for canvas zoom/scale via mouse scroll or manual

- 1.0.0-beta
  - Support for nested charts/canvases allowing multiple steps to converge back into one. [View StackBlitz](https://stackblitz.com/edit/ng-flowchart-nested?file=src/app/nested-flow/nested-flow.component.ts)
  - Additional Callbacks and hooks for the following events
    - Step method: shouldEvalDropHover
    - Canvas Callback: beforeRender
    - Canvas Callback: afterRender

## Current and Upcoming Feature List

- [Chart API](#chart-api)
- [Getting Output JSON](#generating-output-json)
- [Uploading from JSON](#uploading-json)
- [Controlling Behavior](#controlling-behavior)
- [Custom Steps](#custom-steps)
- [Theming](#theming)
- [Storing step data](#storing-step-data)
- [Disabling the chart](#disabling-the-chart)

# Getting started

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

4.  Add the step directives to any elements that you want to drag into your canvas.
    The directive requires an input, an object containing the templateRef, stepType and optional data. See the [wiki](https://github.com/joel-wenzel/ng-flowchart/wiki/Creating-Steps) for more information.

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

   **For more complex steps** that may need to have specific rules or add their own children, you should create a [custom step component](#custom-steps).

6. For more features and examples checkout the official documentation

## If you enjoy it give it a star

Please star the [repo](https://github.com/joel-wenzel/ng-flowchart) if you liked the library. Your support means everything to me and helps me focus on delivering new features

# Chart API

The entire chart content and functionality is available via the NgFlowchart.Flow class.

```
//In your component.ts containing the chart

@ViewChild(NgFlowchartCanvasDirective)
canvasElement: NgFlowchartCanvasDirective;

ngOnInit() {
    let flow: NgFlowchart.Flow = this.canvasElement.getFlow();

    // manual canvas zoom methods reside on the canvas directive directly
    this.canvasElement.scaleDown()
    this.canvasElement.scaleUp()
    this.canvasElement.setScale(1) //resets back to default scale
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

See the [wiki](https://github.com/joel-wenzel/ng-flowchart/wiki/Creating-Steps) for the full list and descriptions

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

# Generating Output JSON

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

# Uploading JSON

The chart flow can be initialized from the same json represenation seen in the [Generating Output JSON](#generating-output-json) section.

However, due to the customizable nature of the steps, step types must be registered with the **NgFlowchartStepRegistry** service so they can be created correctly.

```
constructor(private stepRegistry: NgFlowchartStepRegistry) {

}

ngAfterViewInit() {
  //created from standared ng-template refs
  this.stepRegistry.registerStep('rest-get', this.normalStepTemplate);
  this.stepRegistry.registerStep('filter', this.normalStepTemplate);

  //created from custom component
  this.stepRegistry.registerStep('router', CustomRouterStepComponent);
}
```

After registering it is as simple as calling the public method on the flow object with your json.

```
@ViewChild(NgFlowchartCanvasDirective)
canvas: NgFlowchartCanvasDirective;

showUpload(json: string) {
  this.canvas.getFlow().upload(json);
}

```

# Controlling Behavior

In addition to the [Chart API](#chart-api) above there are also several hooks and options to make the chart behave the way you want it to.

## Options

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

- #### **zoom**
  Canvas zoom options. Defaults to mouse WHEEL zoom with a step of .1 (10%)

## Callbacks

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
   this.callbacks.onDropError = this.onDropError;
   this.callbacks.onDropStep = this.onDropStep.bind(this);
   this.callbacks.onMoveError = this.onMoveError;
}

onDropError(error: NgFlowchart.DropError) {
    console.log(error);
    //show some popup
}

onMoveError(error: NgFlowchart.MoveError) {
    console.log(error);
    //show some popup
}

onDropStep(dropEvent: NgFlowchart.DropEvent) {
    this.actions.push(dropEvent);
}

```

- #### **onDropError?**: (drop: DropError) => void;

  Called whenever a new step fails to drop on the canvas

- #### **onMoveError?**: (drop: MoveError) => void;

  Called whenever an existing canvas step fails to move

- #### **beforeDeleteStep?**: (step: NgFlowchartStepComponent) => void;

  Called when the delete method has been called on the step

- #### **afterDeleteStep?**: (step: NgFlowchartStepComponent) => void;

  Called after the delete method has run on the step. If you need to access
  step children or parents, use beforeDeleteStep

- #### **onDropStep?**: (drop: DropEvent) => void;

  Called whenever a new step or existing step is successfully dropped on the canvas

- #### **beforeRender?**: () => void;

  Called before the canvas is about to re-render

- #### **afterRender?**: (drop: DropEvent) => void;

  Called after the canvas completes a re-render

- #### **afterScale?**: (newScale: number) => void
  Called after the canvas has been scaled

# Custom Steps

Custom steps can be created if you need any kind of complex logic for specific steps. The example below is a custom step for a router which can be seen elsewhere on this page.

```
@Component({
  selector: 'app-custom-router-step',
  template: `
  <div class="router-step" #canvasContent>
    <span>{{ data.name }}</span>
    <button class="btn" (click)="onAddRoute()">Add Route</button>
  </div>
  `,
  styleUrls: ['./custom-router-step.component.scss']
})
export class CustomRouterStepComponent extends NgFlowchartStepComponent {

  routes = [];

  canDrop(dropEvent: NgFlowchart.DropTarget): boolean {
    return true;
  }

  getDropPositionsForStep(pendingStep: NgFlowchart.PendingStep): NgFlowchart.DropPosition[] {
    if (pendingStep.template !== RouteStepComponent) {
      return ['ABOVE', 'LEFT', 'RIGHT'];
    }
    else {
      return ['BELOW'];
    }
  }

  onAddRoute() {
    let route = {
      name: 'New Route',
      condition: '',
      sequence: null
    }
    let index = this.routes.push(route);
    route.sequence = index;

    this.addChild({
      template: RouteStepComponent, //another custom step
      type: 'route-step',
      data: route
    }, {
      sibling: true
    });
  }
}
```

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

# Storing Step Data

When creating a new step, a data object can be passed to the step. This data object is completely optional but allows you to store/edit configuration data for the step. See [Getting Started](#getting-started) for passing the data.

This can even be a [nested chart](https://stackblitz.com/edit/ng-flowchart-nested?file=src/app/nested-flow/nested-flow.component.ts)

```
export class AppComponent {
  title = 'workspace';

  @ViewChild(NgFlowchartCanvasDirective)
  canvas: NgFlowchartCanvasDirective;

  async onStepEdit(id: string) {
    let step = this.canvas.getFlow().getStep(id);

    //if data is an object then step.data will return a reference
    //returning and setting an updated version of the data may not be needed
    let updated = await this.showConfigPopup(step.data);
    step.data = updated;
  }
}
```

Depending on the type of data and complexity, it may be beneficial to create a component for it.

```
@Component({
  selector: 'app-editable-step',
  template: `
  <div class="editable-step" #canvasContent>
    <span>{{ data.name }}</span>
    <button class="btn" (click)="edit()">Edit</button>
  </div>
  `,
  styleUrls: ['./editable-step.component.scss']
})
export class EditableStepComponent extends NgFlowchartStepComponent {

  edit() {
    let updated = await this.showConfigPopup(this.data);
    this.data = updated;
  }
}

```

# Disabling the Chart

The canvas directive binds directly to the html **disabled** attribute.

```
//component.ts
disabled = false;

//component.html
<main>
  <div
    id="canvas"
    ngFlowchartCanvas
    [ngFlowchartOptions]="options"
    [disabled]="disabled"

  ></div>
</main>
```

When the chart is disabled no styling is applied but easily can be by override the following styles:

```
/** Your base selector may be different */
div#canvas[disabled="true"] {
    opacity: .7;
}

/** Ng deep is only needed if not in the root styles sheet*/
div#canvas[disabled="true"] ::ng-deep.ngflowchart-step-wrapper {
    opacity: .7;
}
```

# Contributers

- [michaelmarcuccio](https://github.com/michaelmarcuccio)

# FAQ

### Undefined variables in a callback

If you are trying to access your component variables and functions inside a callback be sure that you bound the "this" object when assigning the callback.

```
this.callbacks.onDropStep = this.onDropStep.bind(this);
```
