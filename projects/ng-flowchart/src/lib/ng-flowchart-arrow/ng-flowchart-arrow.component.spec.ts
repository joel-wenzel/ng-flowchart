import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgFlowchartArrowComponent } from './ng-flowchart-arrow.component';

describe('NgFlowchartArrowComponent', () => {
  let component: NgFlowchartArrowComponent;
  let fixture: ComponentFixture<NgFlowchartArrowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NgFlowchartArrowComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgFlowchartArrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
