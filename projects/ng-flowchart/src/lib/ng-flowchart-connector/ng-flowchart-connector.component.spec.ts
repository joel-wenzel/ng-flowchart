import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgFlowchartConnectorComponent } from './ng-flowchart-connector.component';

describe('NgFlowchartConnectorComponent', () => {
  let component: NgFlowchartConnectorComponent;
  let fixture: ComponentFixture<NgFlowchartConnectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NgFlowchartConnectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgFlowchartConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
