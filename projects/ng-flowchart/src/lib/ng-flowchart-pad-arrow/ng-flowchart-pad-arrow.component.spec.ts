import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgFlowchartPadArrowComponent } from './ng-flowchart-pad-arrow.component';

describe('NgFlowchartPadArrowComponent', () => {
  let component: NgFlowchartPadArrowComponent;
  let fixture: ComponentFixture<NgFlowchartPadArrowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NgFlowchartPadArrowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgFlowchartPadArrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
