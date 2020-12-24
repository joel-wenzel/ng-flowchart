import { EmbeddedViewRef } from '@angular/core';

export namespace NgFlowChart {
    export interface Flow {
        name?: string;
        steps: Step[];
    }

    export interface Step {
        index?: number;
        name: string;
        data?: any;
        children?: Step[]; 
    }

    export interface StepView extends EmbeddedViewRef<any> {
        data?: any
    }

    export type InsertBehavior = 'INSERT_BETWEEN' | 'INSERT_PARALLEL' | 'REPLACE';

    export class Options {
        /** The gap (in pixels) between flow steps*/
        stepGap: number = 40;

        /** An inner deadzone radius (in pixels) that will not register the hover icon  */
        hoverDeadzoneRadius: number = 20;

        /** Is the flow sequential? If true, then you will not be able to drag parallel steps */
        isSequential: boolean = false;
    }

    
}

export const SampleFlow: NgFlowChart.Flow = {
    name: 'Sample Flow',
    steps: [
        {
            name: 'Clone Source Code',
            data: {
                input1: 'abc',
                input2: 'joel'
            }
        },
        {
            name: 'NG Build',
            data: {
                input1: 'bob'
            }
        }
    ]
}