import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicoCadastroClienteComponent } from './cadastro-cliente.component';

describe('CadastroClienteComponent', () => {
  let component: PublicoCadastroClienteComponent;
  let fixture: ComponentFixture<PublicoCadastroClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicoCadastroClienteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicoCadastroClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
