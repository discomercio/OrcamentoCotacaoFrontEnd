import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItensOrcamentosComponent } from './itens-orcamentos.component';

describe('ItensOrcamentosComponent', () => {
  let component: ItensOrcamentosComponent;
  let fixture: ComponentFixture<ItensOrcamentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItensOrcamentosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItensOrcamentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
