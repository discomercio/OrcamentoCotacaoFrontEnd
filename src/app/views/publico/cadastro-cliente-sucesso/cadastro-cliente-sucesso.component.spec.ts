import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicoCadastroClienteSucessoComponent } from './cadastro-cliente-sucesso.component';

describe('CadastroClienteSucessoComponent', () => {
  let component: PublicoCadastroClienteSucessoComponent;
  let fixture: ComponentFixture<PublicoCadastroClienteSucessoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicoCadastroClienteSucessoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicoCadastroClienteSucessoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
