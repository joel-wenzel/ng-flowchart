import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NgFlowchart } from '../model/flow.model';

@Injectable()
export class OptionsService {

    private _options: NgFlowchart.Options;

    optionsWatch = new Subject<NgFlowchart.Options>();

    constructor() {
        this._options = new NgFlowchart.Options();
    }

    set(options) {
        this._options = this.sanitizeOptions(options);        
        this.optionsWatch.next(this._options);
    }

    get options() {
        return this._options;
    }

    private sanitizeOptions(options: NgFlowchart.Options): NgFlowchart.Options {
        const defaultOpts = new NgFlowchart.Options();

        options = {
          ...defaultOpts,
          ...options
        };
    
        options.stepGap = Math.max(options.stepGap, 20) || 40;
        options.hoverDeadzoneRadius = Math.max(options.hoverDeadzoneRadius, 0) || 20;
    
        return options;
    }
}