import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcamentosVigentesComponent } from './orcamentos-vigentes.component';

describe('OrcamentosVigentesComponent', () => {
  let component: OrcamentosVigentesComponent;
  let fixture: ComponentFixture<OrcamentosVigentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrcamentosVigentesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrcamentosVigentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
