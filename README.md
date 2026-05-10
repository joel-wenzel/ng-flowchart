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

- Angular 16 - 21

## Change Log

- 1.0.0-beta.32
  - Angular 19, 20, & 21 support; supported range is now Angular 16 - 21

- 1.0.0-beta.31
  - Scoped CSS styles more specifically to canvas elements

- 1.0.0-beta.30
  - Angular 17 & 18 support (see [Getting Started step 6](#getting-started) for required style configuration)

- 1.0.0-beta.28
  - Angular 16 support
  - New `skipRender` zoom option for efficient zooming on large workflows

- 1.0.0-beta.23
  - [Manual connectors](#manual-connectors) feature for drawing arrows between any two steps
  - Configurable `dragScroll` mouse button options

- 1.0.0-beta.20
  - [Horizontal orientation](#orientation) mode with runtime switching via `setOrientation()`

- 1.0.0-beta.19
  - [Drag-scroll](#dragscroll) feature for canvas panning
  - OnPush change detection support

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
- [Orientation](#orientation)
- [Drag-Scroll](#dragscroll)
- [Manual Connectors](#manual-connectors)
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

6. **Angular 17+ only:** Base step styles require one of the following due to Angular's `REMOVE_STYLES_ON_COMPONENT_DESTROY` defaulting to `true`:

   **Option A** - Disable style removal in your app module providers:
   ```
   import { REMOVE_STYLES_ON_COMPONENT_DESTROY } from '@angular/platform-browser';

   @NgModule({
     providers: [
       { provide: REMOVE_STYLES_ON_COMPONENT_DESTROY, useValue: false }
     ]
   })
   ```

   **Option B** - Import the library styles directly in your global `styles.scss`:
   ```
   @import '@joelwenzel/ng-flowchart/assets/styles.scss';
   ```

7. For more features and examples checkout the official documentation

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

    // switch between vertical and horizontal orientation at runtime
    this.canvasElement.setOrientation('HORIZONTAL')

    // for nested canvases, sync the scale with the parent canvas
    this.canvasElement.setNestedScale(0.8)
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

- #### **toJSON(indent?: number): string**

  Returns the JSON string representation of this flowchart. Optionally specify an indent factor

- #### **toObject(): object**

  Returns the plain object representation of this flowchart, including the `root` tree and `connectors` array

- #### **render(pretty?: boolean): void**

  Re-renders the flowchart. This should only be needed in rare circumstances.
  Pretty will attempt to re-center the flow in the canvas

- #### **getStep(id): NgFlowchartStepComponent**

  Returns a step in the flowchart with the given id. Steps are created with the id of the html element id.

- #### **clear(): void**

  Clears the current flow, reseting the canvas. canDeleteStep callbacks will not be called from this method.

- #### **upload(json: string | object): Promise<void>**
  Clears the existing flow and uploads a new flow from a json string or object representation. The object should contain a `root` property and an optional `connectors` array.

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

- #### **destroyConnectors(endStepId?: string)**
  Destroys manual connector(s) originating from this step. Optionally specify an `endStepId` to only destroy the connector to that specific step. If omitted, all connectors from this step are destroyed.

- #### **isConnectorPadEnabled(): boolean**
  Override this method in custom step components to control whether the connector pad is shown on this step. By default, it is disabled when `isSequential` is true and the step already has a child or outgoing connector.

- #### **isValidConnectorDropTarget(): boolean**
  Override this method in custom step components to control whether this step accepts incoming manual connectors. By default, returns true if the step's drop positions include `ABOVE`.

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

Here is sample json output for a 3 node chart with a manual connector

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
        "type": "notification",
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
  },
  "connectors": [
    {
      "startStepId": "s1608918283650",
      "endStepId": "s1608918285174"
    }
  ]
}

```

The `connectors` array is included when [manual connectors](#manual-connectors) are used. Each connector records the `startStepId` and `endStepId` of the linked steps. Connectors are separate from the parent-child tree structure.

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

  - `mode` - `'WHEEL'` | `'MANUAL'` | `'DISABLED'`. Default is `'WHEEL'`
  - `defaultStep` - The zoom increment per step. Default is `0.1` (10%)
  - `skipRender` - When `true`, zooming applies a CSS transform without re-rendering the entire flow. This is a performance optimization for large workflows with many steps. Default is `false`

- #### **dragScroll**
  Enable canvas panning by clicking and dragging. Accepts an array of mouse buttons: `('LEFT' | 'MIDDLE' | 'RIGHT')[]`. Default is `['RIGHT']`. When `'RIGHT'` is included, the context menu is automatically suppressed on the canvas.

  ```
  options: NgFlowchart.Options = {
    dragScroll: ['RIGHT', 'MIDDLE'],
  };
  ```

- #### **orientation**
  The layout direction of the flowchart. `'VERTICAL'` renders the tree top-to-bottom, `'HORIZONTAL'` renders it left-to-right. Default is `'VERTICAL'`. The drop positions (`ABOVE`, `BELOW`, `LEFT`, `RIGHT`) are rotated accordingly in horizontal mode. See [Orientation](#orientation) for more details.

- #### **manualConnectors**
  Enables the manual connector feature, which allows users to draw arrows between any two steps. When enabled, a connector pad appears on each step. Default is `false`. See [Manual Connectors](#manual-connectors) for more details.

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

- #### **onLinkConnector?**: (connector: NgFlowchart.Connector) => void
  Called after a manual connector has been linked from one step to another. The connector object contains `startStepId` and `endStepId`.

- #### **afterDeleteConnector?**: (connector: NgFlowchartConnectorComponent) => void
  Called after a manual connector has been deleted.

# Orientation

The flowchart supports both vertical (top-to-bottom) and horizontal (left-to-right) layouts. Set the `orientation` option to control the initial layout direction.

```
options: NgFlowchart.Options = {
  orientation: 'HORIZONTAL',
};
```

You can also switch orientation at runtime using the `setOrientation()` method on the canvas directive:

```
@ViewChild(NgFlowchartCanvasDirective)
canvas: NgFlowchartCanvasDirective;

toggleOrientation() {
  this.canvas.setOrientation('HORIZONTAL'); // or 'VERTICAL'
}
```

In horizontal mode, the tree flows left-to-right. The drop position names (`ABOVE`, `BELOW`, `LEFT`, `RIGHT`) are visually rotated -90 degrees but maintain their semantic meaning for the tree structure.

# DragScroll

The drag-scroll feature allows users to pan the canvas by clicking and dragging with a configurable mouse button. This is useful when the flowchart is larger than the visible canvas area.

```
options: NgFlowchart.Options = {
  dragScroll: ['RIGHT', 'MIDDLE'],
};
```

Accepted values are `'LEFT'`, `'MIDDLE'`, and `'RIGHT'`. When `'LEFT'` is used, drag-scroll only activates when clicking directly on the canvas background (not on steps). When `'RIGHT'` is included, the browser context menu is automatically suppressed on the canvas.

# Manual Connectors

Manual connectors allow users to draw arrows between any two steps, independent of the parent-child tree structure. This enables creating loops, joining branches, or linking to steps in different parts of the workflow.

## Enabling Manual Connectors

Set `manualConnectors: true` in your options:

```
options: NgFlowchart.Options = {
  manualConnectors: true,
};
```

## How It Works

When enabled, a connector pad appears on each step. Users can click and drag from the pad to draw an arrow to any valid target step.

- **Drawing**: Click and drag from the connector pad on a step to draw a line to another step
- **Selecting**: Left-click on a connector arrow to select it. A delete button appears near the cursor
- **Deleting**: Click the delete button on a selected connector to remove it
- **Hover states**: Connector arrows highlight on hover and show a distinct style when selected

## Connector Validation

By default, connectors cannot link to the same step, to a step that already has an identical connector, to direct children of the source step, or across different canvases.

You can customize connector behavior per step by overriding these methods in your custom step component:

```
export class MyCustomStep extends NgFlowchartStepComponent {

  // Control whether the connector pad is visible on this step
  isConnectorPadEnabled(): boolean {
    // Example: only show pad if this step has no children
    return !this.hasChildren();
  }

  // Control whether this step can receive incoming connectors
  isValidConnectorDropTarget(): boolean {
    // Example: only accept connectors if drop positions include ABOVE
    return this.getDropPositionsForStep(this.drop.dragConnector).includes('ABOVE');
  }
}
```

Connectors can also be destroyed programmatically via `step.destroyConnectors()` (see [Step Object Methods](#step-object-methods-and-properties)). Connector callbacks are documented in the [Callbacks](#callbacks) section. JSON serialization format is shown in [Generating Output JSON](#generating-output-json). Connector theming is covered in [Theming](#theming).

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

/** Manual connector arrow styling (when manualConnectors is enabled) */
.ngflowchart-connector svg path {
  stroke: #6c757d;
  stroke-width: 2;
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

### Nested Canvas Zoom Synchronization

When using nested flowcharts inside steps, use the `afterScale` callback to propagate zoom changes to nested canvases:

```
callbacks: NgFlowchart.Callbacks = {};

constructor() {
  this.callbacks.afterScale = this.afterScale.bind(this);
}

afterScale(scale: number): void {
  const children = this.canvas.getFlow().getRoot().children;
  children.forEach(step => {
    if (step instanceof NestedFlowComponent) {
      step.nestedCanvas.setNestedScale(scale);
    }
  });
}
```

### Undefined variables in a callback

If you are trying to access your component variables and functions inside a callback be sure that you bound the "this" object when assigning the callback.

```
this.callbacks.onDropStep = this.onDropStep.bind(this);
```
