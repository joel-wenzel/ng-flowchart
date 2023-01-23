import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgFlowchartConnectorArrowComponent } from './ng-flowchart-connector-arrow.component';

describe('NgFlowchartConnectorArrowComponent', () => {
  let component: NgFlowchartConnectorArrowComponent;
  let fixture: ComponentFixture<NgFlowchartConnectorArrowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NgFlowchartConnectorArrowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgFlowchartConnectorArrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
