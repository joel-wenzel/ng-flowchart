import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgFlowchartModule } from 'projects/ng-flowchart/src/lib/ng-flowchart.module';
import { AppComponent } from './app.component';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgFlowchartModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
