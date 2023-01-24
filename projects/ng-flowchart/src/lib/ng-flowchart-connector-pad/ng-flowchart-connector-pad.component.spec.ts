import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgFlowchartConnectorPadComponent } from './ng-flowchart-connector-pad.component';

describe('NgFlowchartConnectorPadComponent', () => {
  let component: NgFlowchartConnectorPadComponent;
  let fixture: ComponentFixture<NgFlowchartConnectorPadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NgFlowchartConnectorPadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgFlowchartConnectorPadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
