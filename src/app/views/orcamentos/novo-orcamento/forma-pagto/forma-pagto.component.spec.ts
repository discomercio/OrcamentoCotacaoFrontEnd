import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormaPagtoComponent } from './forma-pagto.component';

describe('FormaPagtoComponent', () => {
  let component: FormaPagtoComponent;
  let fixture: ComponentFixture<FormaPagtoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormaPagtoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormaPagtoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
