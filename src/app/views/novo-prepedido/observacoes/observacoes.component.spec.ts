import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservacoesComponent } from './observacoes.component';

describe('ObservacoesComponent', () => {
  let component: ObservacoesComponent;
  let fixture: ComponentFixture<ObservacoesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservacoesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservacoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
