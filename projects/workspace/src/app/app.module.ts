import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgFlowchartModule } from 'projects/ng-flowchart/src/lib/ng-flowchart.module';
import { AppComponent } from './app.component';
import { CustomStepComponent } from './custom-step/custom-step.component';
import { RouteStepComponent } from './custom-step/route-step/route-step.component';
import { NestedFlowComponent } from './nested-flow/nested-flow.component';
import { FormStepComponent } from './form-step/form-step.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AppComponent,
    CustomStepComponent,
    RouteStepComponent,
    NestedFlowComponent,
    FormStepComponent
  ],
  imports: [
    BrowserModule,
    NgFlowchartModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
