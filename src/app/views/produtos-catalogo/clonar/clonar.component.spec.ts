import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClonarComponent } from './clonar.component';

describe('ClonarComponent', () => {
  let component: ClonarComponent;
  let fixture: ComponentFixture<ClonarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClonarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClonarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
