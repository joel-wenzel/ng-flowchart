import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgFlowchartStepComponent } from './ng-flowchart-step.component';

describe('NgFlowchartStepComponent', () => {
  let component: NgFlowchartStepComponent;
  let fixture: ComponentFixture<NgFlowchartStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NgFlowchartStepComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgFlowchartStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
