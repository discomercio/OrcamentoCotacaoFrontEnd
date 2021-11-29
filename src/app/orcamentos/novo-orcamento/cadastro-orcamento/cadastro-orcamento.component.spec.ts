import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroOrcamentoComponent } from './cadastro-orcamento.component';

describe('CadastroOrcamentoComponent', () => {
  let component: CadastroOrcamentoComponent;
  let fixture: ComponentFixture<CadastroOrcamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CadastroOrcamentoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroOrcamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
