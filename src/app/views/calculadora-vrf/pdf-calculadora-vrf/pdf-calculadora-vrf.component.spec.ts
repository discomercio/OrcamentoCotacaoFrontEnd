import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfCalculadoraVrfComponent } from './pdf-calculadora-vrf.component';

describe('PdfCalculadoraVrfComponent', () => {
  let component: PdfCalculadoraVrfComponent;
  let fixture: ComponentFixture<PdfCalculadoraVrfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfCalculadoraVrfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfCalculadoraVrfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
