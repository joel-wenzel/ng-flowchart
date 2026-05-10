# CLAUDE.md - AI Assistant Guide for ng-flowchart

## Project Overview

**ng-flowchart** is a lightweight Angular library for building drag-and-drop flowcharts. It provides customizable chart behavior, step components, and JSON import/export capabilities. Published as `@joelwenzel/ng-flowchart` on NPM.

- **Angular version:** 18.0.3
- **TypeScript version:** 5.4.5
- **License:** Apache 2.0

## Repository Structure

This is a monorepo containing two Angular projects:

```
projects/
  ng-flowchart/          # The library (published to NPM)
    src/
      lib/
        model/           # Core types and Flow API (flow.model.ts)
        services/        # Core services (canvas-renderer, dropdata, options, step-manager)
        ng-flowchart-arrow/         # SVG arrow connector component
        ng-flowchart-connector/     # Manual connector component
        ng-flowchart-connector-pad/ # Connection pad component
        ng-flowchart-pad-arrow/     # Pad arrow component
        ng-flowchart-step/          # Base step component (extendable)
        ng-flowchart-canvas.directive.ts   # Main canvas directive
        ng-flowchart-canvas.service.ts     # Canvas state/rendering service
        ng-flowchart-step.directive.ts     # Step drag directive
        ng-flowchart-step-registry.service.ts # Custom step type registry
        ng-flowchart.module.ts             # NgFlowchartModule
      index.ts           # Public API surface
    assets/
      styles.scss        # Base library styles
    ng-package.json      # ng-packagr configuration
  workspace/             # Demo application
    src/app/
      custom-step/       # Example custom step component
      form-step/         # Example form step component
      nested-flow/       # Example nested flowchart component
      app.component.ts   # Main demo with all features
```

## Build Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Serve the demo application locally (`ng serve`) |
| `npm run build` | Build library for production (`ng build ng-flowchart --configuration production`) |
| `npm test` | Run unit tests with Karma/Jasmine (`ng test`) |
| `npm run lint` | Run ESLint with auto-fix (`ng lint --fix`) |
| `npm run prettier` | Format all files with Prettier (`npx prettier --write .`) |
| `npm run e2e` | Run end-to-end tests with Protractor (`ng e2e`) |

## Architecture

### Design Pattern

- **Directive-based API:** Core functionality exposed via `NgFlowchartCanvasDirective` (canvas host) and `NgFlowchartStepDirective` (draggable palette items)
- **Service-oriented internals:** Rendering, options, step lifecycle, and drag/drop state are separated into dedicated services
- **Extendable step components:** Users create custom steps by extending `NgFlowchartStepComponent`
- **Tree data structure:** The flow is represented as a linked tree with parent-child relationships

### Key Files

| File | Role |
|------|------|
| `model/flow.model.ts` | Core `NgFlowchart` namespace with `Flow` class, `Options`, `Callbacks`, step/drop types |
| `ng-flowchart-canvas.directive.ts` | Main directive handling drop/drag events, zoom, scrolling |
| `ng-flowchart-canvas.service.ts` | Manages flow state and rendering orchestration |
| `ng-flowchart-step/ng-flowchart-step.component.ts` | Base step component class (extend for custom steps) |
| `ng-flowchart-step-registry.service.ts` | Registry for resolving custom step types during JSON import |
| `services/canvas-renderer.service.ts` | Positioning, layout, and SVG rendering logic |
| `services/step-manager.service.ts` | Step lifecycle (creation, deletion, movement) |
| `services/options.service.ts` | Options management |
| `services/dropdata.service.ts` | Drag/drop transfer state |
| `index.ts` | Public API exports |

### Module Exports

`NgFlowchartModule` exports two directives:
- `NgFlowchartCanvasDirective` - Applied to a container element to create a flowchart canvas
- `NgFlowchartStepDirective` - Applied to elements to make them draggable step sources

### Major Features

- **Horizontal & Vertical Orientation:** `orientation` option (`'VERTICAL'` | `'HORIZONTAL'`) with runtime switching via `setOrientation()`
- **Drag-Scroll:** Canvas panning via configurable mouse buttons (`dragScroll` option)
- **Manual Connectors:** Draw arrows between any two steps independent of the tree structure (`manualConnectors` option). Includes connector pads, selectable/deletable arrows, per-step validation overrides (`isConnectorPadEnabled()`, `isValidConnectorDropTarget()`), and callbacks (`onLinkConnector`, `afterDeleteConnector`)
- **Zoom:** Mouse wheel or manual zoom with `skipRender` performance optimization for large workflows
- **Nested Canvases:** Steps can contain their own flowchart canvases with scale synchronization (`setNestedScale()`)
- **OnPush Change Detection:** Full support for `ChangeDetectionStrategy.OnPush`
- **JSON with Connectors:** Export/import includes both `root` tree and `connectors` array

## Code Style & Conventions

### Formatting (Prettier)

- 2-space indentation, no tabs
- Single quotes for strings
- Semicolons required
- Trailing commas in ES5 positions
- 80 character print width
- Arrow function parens avoided for single params (`avoid`)
- Brackets on same line as opening tag (`bracketSameLine: true`)

### Linting (ESLint)

- Extends: `@angular-eslint/recommended` + `prettier/recommended`
- Component selectors: **kebab-case** with `lib` prefix (e.g., `lib-my-component`)
- Directive selectors: **camelCase** with `lib` prefix (e.g., `libMyDirective`)
- Empty lifecycle methods are allowed (`@angular-eslint/no-empty-lifecycle-method: 0`)
- HTML templates use Angular template linting rules

### TypeScript

- Target: ES2022, Module: ESNext
- Strict Angular compiler options enabled (`strictInjectionParameters`, `strictInputAccessModifiers`, `strictTemplates`)
- `useDefineForClassFields: false` (required for Angular decorator compatibility)
- Path alias: `ng-flowchart` maps to `dist/ng-flowchart/`

### EditorConfig

- UTF-8 charset
- 2-space indentation
- Final newline inserted
- Trailing whitespace trimmed (except `.md` files)
- Single quotes for `.ts` files

## Testing

- **Framework:** Jasmine 5.1.2 + Karma 6.4.3
- **Browser:** Chrome
- **Test files:** Co-located with source using `.spec.ts` suffix
- **Coverage:** Istanbul reporter generating HTML, LCOV, and text-summary in `coverage/ng-flowchart/`
- **Teardown config:** `destroyAfterEach: false`
- Run tests: `npm test`

## CI/CD

GitHub Actions workflow (`.github/workflows/main.yml`):
- Triggers on push to `1.0.0-beta` branch or manual dispatch
- Runs on `ubuntu-latest` with Node 18
- Steps: `npm install` -> `npm run build` -> `npm publish --access public`
- Publishes from `dist/ng-flowchart` to NPM using `NPM_AUTH_TOKEN` secret

## Important Notes for AI Assistants

1. **Library vs Demo:** Changes to the library go in `projects/ng-flowchart/`. The `projects/workspace/` directory is the demo app for testing. Do not confuse the two.
2. **Public API:** Only items exported through `projects/ng-flowchart/src/index.ts` are part of the public API. Internal services should not be exported.
3. **Build before test with demo:** The demo app (`workspace`) imports the library from `dist/ng-flowchart` via the tsconfig path alias. Build the library first (`npm run build`) before serving the demo.
4. **ng-packagr:** The library is packaged with ng-packagr. The `ng-package.json` file controls entry points and assets. SCSS assets are bundled from the `assets/` directory.
5. **Angular version support:** The library supports Angular 16-21 via peer dependencies. Avoid using APIs exclusive to Angular 19+ to maintain backward compatibility.
6. **No standalone components:** The library uses `NgModule` declarations, not standalone components. Follow this pattern for new components.
7. **Custom steps pattern:** Users extend `NgFlowchartStepComponent` and register types via `NgFlowchartStepRegistryService` for JSON serialization/deserialization. Refer to the demo app's `custom-step/`, `form-step/`, and `nested-flow/` for examples.
