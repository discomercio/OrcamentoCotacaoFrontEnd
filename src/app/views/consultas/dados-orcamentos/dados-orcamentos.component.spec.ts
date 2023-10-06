import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DadosOrcamentosComponent } from './dados-orcamentos.component';

describe('DadosOrcamentosComponent', () => {
  let component: DadosOrcamentosComponent;
  let fixture: ComponentFixture<DadosOrcamentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DadosOrcamentosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DadosOrcamentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
