import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOrcamentoComponent } from './dashboard-orcamento.component';

describe('DashboardOrcamentoComponent', () => {
  let component: DashboardOrcamentoComponent;
  let fixture: ComponentFixture<DashboardOrcamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardOrcamentoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardOrcamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
