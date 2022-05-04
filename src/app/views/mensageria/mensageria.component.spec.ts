import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensageriaComponent } from './mensageria.component';

describe('MensageriaComponent', () => {
  let component: MensageriaComponent;
  let fixture: ComponentFixture<MensageriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MensageriaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MensageriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
