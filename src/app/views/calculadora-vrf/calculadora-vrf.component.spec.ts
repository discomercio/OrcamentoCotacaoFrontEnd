import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculadoraVrfComponent } from './calculadora-vrf.component';

describe('CalculadoraVrfComponent', () => {
  let component: CalculadoraVrfComponent;
  let fixture: ComponentFixture<CalculadoraVrfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalculadoraVrfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculadoraVrfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
