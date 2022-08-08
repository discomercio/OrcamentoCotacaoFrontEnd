import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaBaseComponent } from './consulta-base.component';

describe('ConsultaBaseComponent', () => {
  let component: ConsultaBaseComponent;
  let fixture: ComponentFixture<ConsultaBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
