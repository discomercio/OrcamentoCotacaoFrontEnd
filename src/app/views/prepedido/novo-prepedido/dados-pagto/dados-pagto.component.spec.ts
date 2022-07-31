import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DadosPagtoComponent } from './dados-pagto.component';

describe('DadosPagtoComponent', () => {
  let component: DadosPagtoComponent;
  let fixture: ComponentFixture<DadosPagtoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DadosPagtoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DadosPagtoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
