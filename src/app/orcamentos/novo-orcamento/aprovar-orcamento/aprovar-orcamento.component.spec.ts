import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprovarOrcamentoComponent } from './aprovar-orcamento.component';

describe('AprovarOrcamentoComponent', () => {
  let component: AprovarOrcamentoComponent;
  let fixture: ComponentFixture<AprovarOrcamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AprovarOrcamentoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AprovarOrcamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
