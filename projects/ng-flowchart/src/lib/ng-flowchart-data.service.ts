import { Injectable, TemplateRef } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class NgFlowchartDataService {
    
    activeTemplate: TemplateRef<any>;

    constructor() {

    }

    public setActiveTemplate(ref: TemplateRef<any>) {
        this.activeTemplate = ref;
    }

    public getTemplateRef() {
        return this.activeTemplate;
    }
}