import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutosCatalogoCriarComponent } from './criar.component';

describe('ProdutosCatalogoCriarComponent', () => {
  let component: ProdutosCatalogoCriarComponent;
  let fixture: ComponentFixture<ProdutosCatalogoCriarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProdutosCatalogoCriarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProdutosCatalogoCriarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
