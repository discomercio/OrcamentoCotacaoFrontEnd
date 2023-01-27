import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcamentosComMensagensPendentesComponent } from './orcamentos-com-mensagens-pendentes.component';

describe('OrcamentosComMensagensPendentesComponent', () => {
  let component: OrcamentosComMensagensPendentesComponent;
  let fixture: ComponentFixture<OrcamentosComMensagensPendentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrcamentosComMensagensPendentesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrcamentosComMensagensPendentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
