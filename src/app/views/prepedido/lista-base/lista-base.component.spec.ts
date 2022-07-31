import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaBaseComponent } from './lista-base.component';

describe('ListaBaseComponent', () => {
  let component: ListaBaseComponent;
  let fixture: ComponentFixture<ListaBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
