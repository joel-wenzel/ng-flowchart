import { Injectable } from '@angular/core';
import { NgFlowchart } from '../model/flow.model';

@Injectable()
export class OptionsService {
  private _options: NgFlowchart.Options;
  private _callbacks: NgFlowchart.Callbacks = {};

  constructor() {
    this._options = new NgFlowchart.Options();
  }

  setOptions(options) {
    this._options = this.sanitizeOptions(options);
  }

  setCallbacks(callbacks) {
    this._callbacks = callbacks;
  }

  get options() {
    return this._options;
  }

  get callbacks() {
    return this._callbacks;
  }

  private sanitizeOptions(options: NgFlowchart.Options): NgFlowchart.Options {
    const defaultOpts = new NgFlowchart.Options();

    options = {
      ...defaultOpts,
      ...options,
    };

    options.stepGap = Math.max(options.stepGap, 20) || 40;
    options.hoverDeadzoneRadius =
      Math.max(options.hoverDeadzoneRadius, 0) || 20;
    if (options.zoom && options.zoom.mode !== 'DISABLED') {
      options.zoom.defaultStep = options.zoom.defaultStep || 0.1;
    }

    return options;
  }
}
