import { Component, OnInit } from '@angular/core';
import { NgFlowchartStepComponent } from 'projects/ng-flowchart/src/lib/ng-flowchart-step/ng-flowchart-step.component';

export type MyForm = {
  input1: string
}

@Component({
  selector: 'app-form-step',
  templateUrl: './form-step.component.html',
  styleUrls: ['./form-step.component.scss']
})
export class FormStepComponent<MyForm> extends NgFlowchartStepComponent implements OnInit {

  constructor() { 
    super()
  }

  ngOnInit(): void {
  }

  

}
