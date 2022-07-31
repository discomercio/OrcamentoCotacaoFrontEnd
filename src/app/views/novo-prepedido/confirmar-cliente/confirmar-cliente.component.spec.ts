import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarClienteComponent } from './confirmar-cliente.component';

describe('ConfirmarClienteComponent', () => {
  let component: ConfirmarClienteComponent;
  let fixture: ComponentFixture<ConfirmarClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmarClienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmarClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
