import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarEnderecoComponent } from './confirmar-endereco.component';

describe('ConfirmarEnderecoComponent', () => {
  let component: ConfirmarEnderecoComponent;
  let fixture: ComponentFixture<ConfirmarEnderecoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmarEnderecoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmarEnderecoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
