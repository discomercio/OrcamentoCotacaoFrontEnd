import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCloneOpcoesDialogComponent } from './select-clone-opcoes-dialog.component';

describe('SelectCloneOpcoesDialogComponent', () => {
  let component: SelectCloneOpcoesDialogComponent;
  let fixture: ComponentFixture<SelectCloneOpcoesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectCloneOpcoesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectCloneOpcoesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
