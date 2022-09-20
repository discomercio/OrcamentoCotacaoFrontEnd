import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CepDialogComponent } from './cep-dialog.component';

describe('CepDialogComponent', () => {
  let component: CepDialogComponent;
  let fixture: ComponentFixture<CepDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CepDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CepDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
