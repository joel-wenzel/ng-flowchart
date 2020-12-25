import { Injectable, TemplateRef } from "@angular/core";

export type ActiveTemplate = {
    template: TemplateRef<any>,
    data: any
}

@Injectable({
    providedIn: 'root'
})
export class NgFlowchartDataService {

    activeTemplate: ActiveTemplate;

    constructor() {

    }

    public setActiveTemplate(ref: ActiveTemplate) {
        this.activeTemplate = ref;
    }

    public getTemplateRef() {
        return this.activeTemplate;
    }
}