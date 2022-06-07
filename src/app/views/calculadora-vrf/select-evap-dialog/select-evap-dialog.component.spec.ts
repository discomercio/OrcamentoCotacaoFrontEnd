import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectEvapDialogComponent } from './select-evap-dialog.component';

describe('SelectEvapDialogComponent', () => {
  let component: SelectEvapDialogComponent;
  let fixture: ComponentFixture<SelectEvapDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectEvapDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectEvapDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
