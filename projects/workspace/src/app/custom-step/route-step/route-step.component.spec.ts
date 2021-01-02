import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteStepComponent } from './route-step.component';

describe('RouteStepComponent', () => {
  let component: RouteStepComponent;
  let fixture: ComponentFixture<RouteStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
