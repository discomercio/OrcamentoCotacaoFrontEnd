import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProdDialogComponent } from './select-prod-dialog.component';

describe('SelectProdDialogComponent', () => {
  let component: SelectProdDialogComponent;
  let fixture: ComponentFixture<SelectProdDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectProdDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectProdDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
