import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcamentosExpiradosComponent } from './orcamentos-expirados.component';

describe('OrcamentosExpiradosComponent', () => {
  let component: OrcamentosExpiradosComponent;
  let fixture: ComponentFixture<OrcamentosExpiradosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrcamentosExpiradosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrcamentosExpiradosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
