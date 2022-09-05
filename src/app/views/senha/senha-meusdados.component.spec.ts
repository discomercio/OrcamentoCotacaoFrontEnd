import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SenhaMeusdadosComponent } from './senha-meusdados.component';

describe('UsuarioMeusdadosComponent', () => {
  let component: SenhaMeusdadosComponent;
  let fixture: ComponentFixture<SenhaMeusdadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SenhaMeusdadosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SenhaMeusdadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});