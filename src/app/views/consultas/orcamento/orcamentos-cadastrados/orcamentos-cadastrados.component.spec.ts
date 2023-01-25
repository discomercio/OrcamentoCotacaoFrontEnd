import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcamentosCadastradosComponent } from './orcamentos-cadastrados.component';

describe('OrcamentosCadastradosComponent', () => {
  let component: OrcamentosCadastradosComponent;
  let fixture: ComponentFixture<OrcamentosCadastradosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrcamentosCadastradosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrcamentosCadastradosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
