import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProdutoService } from 'src/app/service/produto/produto.service';
import { FormBuilder } from '@angular/forms';
import { DetalhesProdutoDto } from 'src/app/dto/produtos/DetalhesProdutoDto';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';

@Component({
  selector: 'app-visualizar-produto',
  templateUrl: './visualizar-produto.component.html',
  styleUrls: ['./visualizar-produto.component.scss']
})
export class VisualizarProdutoComponent implements OnInit {

  constructor(private readonly activatedRoute: ActivatedRoute,
    private readonly produtoService: ProdutoService,
    private fb: FormBuilder,
    private readonly alertaService: AlertaService) { }

  produto: string;
  fabricante: string;
  detalhesProduto: DetalhesProdutoDto = new DetalhesProdutoDto();
  ngOnInit(): void {
    this.produto = this.activatedRoute.snapshot.params.produto;
    this.fabricante = this.activatedRoute.snapshot.params.fabricante;
    this.produtoService.buscarProduto(this.produto).toPromise().then((r) => {
      if (r != null) {
        this.detalhesProduto = r.filter(f => f.Fabricante == this.fabricante && f.Produto == this.produto)[0];
      }
    }).catch((r)=> this.alertaService.mostrarErroInternet(r));
  }

}
