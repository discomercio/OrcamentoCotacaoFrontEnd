import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarOpcaoComponent } from './editar-opcao.component';

describe('EditarOpcaoComponent', () => {
  let component: EditarOpcaoComponent;
  let fixture: ComponentFixture<EditarOpcaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarOpcaoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarOpcaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
