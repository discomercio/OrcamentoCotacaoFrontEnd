import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcamentosListarComponent } from './listar.component';

describe('OrcamentosListarComponent', () => {
  let component: OrcamentosListarComponent;
  let fixture: ComponentFixture<OrcamentosListarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrcamentosListarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrcamentosListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
