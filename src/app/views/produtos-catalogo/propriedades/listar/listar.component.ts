import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { ProdutoCatalogoPropriedade } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedade';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';

@Component({
  selector: 'app-listar-produtos',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss']
})
export class ProdutosCatalogoPropriedadesListarComponent implements OnInit {

  constructor(
    private readonly service: ProdutoCatalogoService,
    private fb: FormBuilder,
    private readonly router: Router,
    private readonly mensagemService: MensagemService,
    private readonly alertaService: AlertaService,
    private readonly sweetalertService: SweetalertService,
    private readonly autenticacaoService: AutenticacaoService,
    public readonly cdr: ChangeDetectorRef) { }

  @ViewChild('dataTable') table: Table;
  public form: FormGroup;
  listaPropriedadesProdutoDto: ProdutoCatalogoPropriedade[];
  listaPropriedadesProdutoApoioDto: ProdutoCatalogoPropriedade[] = new Array();
  cols: any[];
  carregando: boolean = false;
  realizandoAcao: boolean = false;
  filtro: string = "";

  ngOnInit(): void {

    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoPropriedadeConsultar)) {
      this.sweetalertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      return;
    }

    this.carregando = true;
    this.criarTabela();
    this.buscarTodosProdutos();
  }

  criarTabela() {
    this.cols = [
      { field: "Descricao", header: "Descrição", visible: true },
      { field: "Ativo", header: "Ativo", visible: true },
      { field: "Acoes", header: "Ações", visible: true }
    ]
  }

  buscarTodosProdutos() {
    this.service.buscarPropriedades().toPromise().then((r) => {
      if (r != null) {
        this.listaPropriedadesProdutoDto = r;
        this.listaPropriedadesProdutoApoioDto = JSON.parse(JSON.stringify(r));

        let url = sessionStorage.getItem("urlAnterior");
        if (!!url && (url.indexOf("/produtos-catalogo/propriedades/editar") > -1 ||
          url.indexOf("/produtos-catalogo/propriedades/criar") > -1)) {
          let json = sessionStorage.getItem("filtro");
          this.filtro = json;
        }
        this.filtrar();
        this.carregando = false;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  filtrar() {

    sessionStorage.setItem("filtro", this.filtro);
    let lstFiltrada = this.listaPropriedadesProdutoApoioDto.filter(x => x.descricao.toLocaleLowerCase().indexOf(this.filtro) > -1);
    if (lstFiltrada.length > 0) {
      this.listaPropriedadesProdutoDto = lstFiltrada;
    }
    else {
      this.listaPropriedadesProdutoDto = this.listaPropriedadesProdutoApoioDto;
    }
  }

  editarClick(id: any) {
    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoPropriedadeIncluirEditar)) {
      this.sweetalertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      return;
    }

    this.realizandoAcao = true;
    sessionStorage.setItem("urlAnterior", "/produtos-catalogo/propriedades/editar");
    this.router.navigate(["/produtos-catalogo/propriedades/editar", id]);
  }

  criarClick() {

    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoPropriedadeIncluirEditar)) {
      this.sweetalertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      return;
    }

    this.realizandoAcao = true;
    sessionStorage.setItem("urlAnterior", "/produtos-catalogo/propriedades/criar");
    this.router.navigate(["/produtos-catalogo/propriedades/criar"]);
  }

  excluirClick(id: any) {

    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoPropriedadeIncluirEditar)) {
      this.sweetalertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      return;
    }

    this.service.buscarPropriedadesUtilizadas(id).toPromise().then((response) => {

      if (response) {
        this.sweetalertService.aviso("Existem produtos do catálogo utilizando a propriedade.");
        return;
      }
      else {
        let loja = this.autenticacaoService._lojaLogado;
        this.service.excluirPropriedades(id, loja).toPromise().then((resp) => {
          if (!resp.Sucesso) {
            this.carregando = false;
            this.alertaService.mostrarMensagem(resp.Mensagem);
            return;
          }

          this.sweetalertService.sucesso("Propriedade excluída com sucesso.");
          this.carregando = true;
          this.buscarTodosProdutos();

        }).catch((r) => this.alertaService.mostrarErroInternet(r));
      }

    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  ngOnDestroy() {
    if (!this.realizandoAcao) {
      sessionStorage.removeItem("filtro");
      sessionStorage.removeItem("urlAnterior");
    }
  }
}