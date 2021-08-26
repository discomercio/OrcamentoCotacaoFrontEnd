import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidacaoFormularioComponent } from './validacao-formulario.component';

describe('ValidacaoFormularioComponent', () => {
  let component: ValidacaoFormularioComponent;
  let fixture: ComponentFixture<ValidacaoFormularioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidacaoFormularioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidacaoFormularioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
