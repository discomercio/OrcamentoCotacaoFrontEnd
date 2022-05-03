import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutosCatalogoPropriedadesCriarComponent } from './criar.component';

describe('ProdutosCatalogoPropriedadesCriarComponent', () => {
    let component: ProdutosCatalogoPropriedadesCriarComponent;
    let fixture: ComponentFixture<ProdutosCatalogoPropriedadesCriarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [ProdutosCatalogoPropriedadesCriarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
      fixture = TestBed.createComponent(ProdutosCatalogoPropriedadesCriarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
