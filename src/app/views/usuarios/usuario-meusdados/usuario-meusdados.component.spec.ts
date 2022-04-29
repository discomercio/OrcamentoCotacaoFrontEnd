import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioMeusdadosComponent } from './usuario-meusdados.component';

describe('UsuarioMeusdadosComponent', () => {
  let component: UsuarioMeusdadosComponent;
  let fixture: ComponentFixture<UsuarioMeusdadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsuarioMeusdadosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioMeusdadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
