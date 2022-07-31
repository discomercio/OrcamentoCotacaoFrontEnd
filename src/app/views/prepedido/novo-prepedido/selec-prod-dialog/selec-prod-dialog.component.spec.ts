import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelecProdDialogComponent } from './selec-prod-dialog.component';

describe('SelecProdDialogComponent', () => {
  let component: SelecProdDialogComponent;
  let fixture: ComponentFixture<SelecProdDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelecProdDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelecProdDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
