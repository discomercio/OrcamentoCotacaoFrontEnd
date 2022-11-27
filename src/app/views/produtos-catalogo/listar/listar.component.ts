import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ProdutoCatalogo } from '../../../dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { Filtro } from 'src/app/dto/orcamentos/filtro';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';

@Component({
  selector: 'app-listar-produtos',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss']
})
export class ProdutosCatalogoListarComponent implements OnInit {

  constructor(private readonly service: ProdutoCatalogoService,
    private fb: FormBuilder,
    private readonly router: Router,
    private readonly mensagemService: MensagemService,
    private readonly alertaService: AlertaService,
    private readonly autenticacaoService: AutenticacaoService) { }

  @ViewChild('dataTable') table: Table;
  public form: FormGroup;
  listaProdutoDto: ProdutoCatalogo[];
  listaProdutoDtoApoio: ProdutoCatalogo[];
  cols: any[];
  carregando: boolean = false;
  produtoFiltro: string;
  fabricanteFiltro: string;
  nomeFiltro: string;
  descriacaoFiltro: string;

  ngOnInit(): void {
    this.carregando = true;
    this.buscarTodosProdutos();
  }

  buscarTodosProdutos() {

    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoCaradastrarConsultar)) {
      this.alertaService.mostrarMensagem("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      this.router.navigate(["/dashboards"]);
      return;
    }

    this.service.buscarTodosProdutos().toPromise().then((r) => {
      if (r != null) {
        this.listaProdutoDto = r;
        this.listaProdutoDtoApoio = this.listaProdutoDto;
        this.montarCampoTexto();
      }
      this.carregando = false;
    }).catch((r) => {
      this.alertaService.mostrarErroInternet(r);
      this.carregando = false;
    });
  }

  montarCampoTexto() {
    this.listaProdutoDto.forEach(x => {
      x.linhaBusca = x.Id + "/";
      x.linhaBusca += x.Produto + "/";
      x.linhaBusca = x.Fabricante + "/";
      x.linhaBusca = x.Nome + "/";
      x.linhaBusca = x.Descricao + "/";
    });
  }

  visualizarClick(id: any) {
    this.router.navigate(["/produtos-catalogo/visualizar", id]);
  }

  editarClick(id: any) {
    this.router.navigate(["/produtos-catalogo/editar", id]);
  }

  clonarClick(id: any) {
    this.router.navigate(["/produtos-catalogo/clonar", id]);
  }

  copiarClick(id: any) {

    this.router.navigate(["/produtos-catalogo/editar", id]);
  }

  excluirClick(id: any) {
    this.service.excluirProduto(id).toPromise().then((r) => {
      if (r != null && r == true) {
        this.mensagemService.showSuccessViaToast("Produto inativado com sucesso!");
        this.carregando = false;
        this.buscarTodosProdutos();
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  criarClick() {
    this.router.navigate(["/produtos-catalogo/criar"]);
  }

  filtrar() {
    this.listaProdutoDto = this.listaProdutoDtoApoio;

    let p: ProdutoCatalogo = new ProdutoCatalogo();

    if (this.produtoFiltro)
      this.listaProdutoDto = this.listaProdutoDto.filter(x => x.Produto.toLowerCase().includes(this.produtoFiltro.toLowerCase()));
    if (this.fabricanteFiltro)
      this.listaProdutoDto = this.listaProdutoDto.filter(x => x.Fabricante.toLowerCase().includes(this.fabricanteFiltro.toLowerCase()));
    if (this.nomeFiltro)
      this.listaProdutoDto = this.listaProdutoDto.filter(x => x.Nome.toLowerCase().includes(this.nomeFiltro.toLowerCase()));
    if (this.descriacaoFiltro)
      this.listaProdutoDto = this.listaProdutoDto.filter(x => x.Descricao.toLowerCase().includes(this.descriacaoFiltro.toLowerCase()));
  }
}

