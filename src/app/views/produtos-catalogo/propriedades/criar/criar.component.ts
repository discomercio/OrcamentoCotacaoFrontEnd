import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { ProdutoCatalogoPropriedade } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedade';
import { SelectItem } from 'primeng/api';
import { ProdutoCatalogoPropriedadeOpcao } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedadeOpcao';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { DataType } from 'src/app/dto/produtos-catalogo/DataType';

@Component({
  selector: 'app-criar-propriedade-produto',
  templateUrl: './criar.component.html',
  styleUrls: ['./criar.component.scss']
})
export class ProdutosCatalogoPropriedadesCriarComponent implements OnInit {

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private readonly produtoService: ProdutoCatalogoService,
    private readonly alertaService: AlertaService,
    private readonly mensagemService: MensagemService,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private readonly sweetAlertService: SweetalertService,
    private readonly autenticacaoService: AutenticacaoService) { }

  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public produtoPropriedade: ProdutoCatalogoPropriedade = new ProdutoCatalogoPropriedade();
  carregando: boolean;
  lstDataTypes: SelectItem[] = new Array();
  lstTipoPropriedadeCatalogo: SelectItem[] = new Array();
  lstValoresValidos: ProdutoCatalogoPropriedadeOpcao[] = new Array();
  lstValoresValidosApoioExclusao: ProdutoCatalogoPropriedadeOpcao[] = new Array();
  valorValido: string;
  selectedValorValido: any;
  alertaTipoProp: string;
  ocultoOpcao: boolean = true;
  ocultoPropriedade: boolean = true;
  idCfgDataType: number;
  idTipoPropriedade: number;
  itemApoioEdicao = new ProdutoCatalogoPropriedadeOpcao();
  editando: boolean = false;
  @Input() edicao: boolean;
  @ViewChild("inputValorValido") inputValorValido: ElementRef;
  permissaoEdicaoCadastro:boolean;

  ngOnInit(): void {

    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoPropriedadeIncluirEditar)) {
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      this.router.navigate(["/produtos-catalogo/propriedades/listar"]);
      return;
    }

    this.carregando = true;
    this.criarForm();

    if(!this.edicao){
    this.permissaoEdicaoCadastro = true;
      let promise: any = [this.buscarDataTypes(), this.buscarTipoPropriedades()];
      Promise.all(promise).then((r: any) => {
        this.setarDataTypes(r[0]);
        this.setarTipoPropriedades(r[1]);
      }).catch((e) => {
        this.carregando = false;
        this.alertaService.mostrarErroInternet(e);
      }).finally(() => {
        this.carregando = false;
      });
    }
  }

  buscarDataTypes(): Promise<Array<DataType>> {
    return this.produtoService.buscarDataTypes().toPromise();
  }

  buscarTipoPropriedades(): Promise<any[]> {
    return this.produtoService.buscarTipoPropriedades().toPromise();
  }

  setarDataTypes(r: Array<DataType>) {
    if (r != null) {
      this.lstDataTypes = this.montarListaParaSelectItem(r);
      return;
    }
    this.alertaService.mostrarMensagem("Ops! Não encontramos a lista de tipo de dado.");
  }

  setarTipoPropriedades(r: any[]) {
    if (r != null) {
      this.lstTipoPropriedadeCatalogo = this.montarListaParaSelectItem(r);
      return;
    }

    this.alertaService.mostrarMensagem("Ops! Não encontramos a lista de tipo de propriedade.")
  }

  changeDataType() {
    let dataType: string;
    dataType = this.form.controls.idCfgDataType.value;

    if (this.idTipoPropriedade == 1 && this.lstValoresValidos.length > 0) {

      if (this.produtoPropriedade.IdCfgDataType != this.idCfgDataType) {

        this.sweetAlertService
          .dialogo("A lista de valores válidos será excluída!", "Tem certeza que deseja excluir a lista?")
          .subscribe(result => {
            if (!result) {
              this.idCfgDataType = this.produtoPropriedade.IdCfgDataType;
              this.form.controls.idCfgDataType.setValue(this.idCfgDataType);
              return;
            }

            this.lstValoresValidos = new Array();
            this.lstValoresValidos = [...this.lstValoresValidos];
          });
      }
    }

    if (dataType == "0")//texto
    {
      this.form.controls["valorValido"].clearValidators();
      this.form.controls["valorValido"].setValidators([Validators.maxLength(255)]);
    }
    if (dataType == "1")//inteiro
    {
      this.form.controls["valorValido"].setValidators([Validators.pattern("^[0-9]*$")]);
      this.alertaTipoProp = "Informe somente números";
    }
    if (dataType == "2")//real
    {
      this.form.controls["valorValido"].setValidators([Validators.pattern("^[0-9]+(,[0-9]+)?$")]);
      this.alertaTipoProp = "Esperamos números com vírgula";
    }

    this.form.controls["valorValido"].updateValueAndValidity();
  }

  inserirClick() {
    if (this.valorValido == undefined || this.valorValido.trim() == "") {
      this.alertaService.mostrarMensagem("Favor informar um valor!");
      return;
    }

    if (this.produtoPropriedade.IdCfgTipoPermissaoEdicaoCadastro == 1) {
      this.alertaService.mostrarMensagem("Não é permitido inserir itens na lista de valores válidos para essa propriedade!");
      this.valorValido = "";
      return;
    }

    if (!this.validacaoFormularioService.validaForm(this.form)) {
      if (this.form.controls.valorValido.invalid) return;
    }

    if (this.idTipoPropriedade == 1 && this.lstValoresValidos.length > 0) {
      if (this.produtoPropriedade.IdCfgDataType != this.idCfgDataType) {
        this.mensagemService.showErrorViaToast(["Não é permitido alterar o tipo de dado da propriedade com intens na lista de valores válidos!"]);
        this.idCfgDataType = this.produtoPropriedade.IdCfgDataType;
        this.form.controls.idCfgDataType.setValue(this.idCfgDataType);
        return;
      }

      let propExiste = this.lstValoresValidos.filter(x => x.valor == this.valorValido);
      if (propExiste.length > 0) {
        this.mensagemService.showErrorViaToast(["Esse valor já existe!"]);
        return;
      }
    }

    let item = new ProdutoCatalogoPropriedadeOpcao();
    item.oculto = this.ocultoOpcao ? false : true;
    item.valor = this.valorValido;
    item.id = (this.lstValoresValidos.length + 1).toString();
    item.usuario_cadastro = this.autenticacaoService._usuarioLogado;
    this.lstValoresValidos = [...this.lstValoresValidos, item];
    this.lstValoresValidosApoioExclusao = this.lstValoresValidos.slice();
    this.produtoPropriedade.IdCfgDataType = this.idCfgDataType;
    this.valorValido = "";
    this.ocultoOpcao = true;

    this.inputValorValido.nativeElement.focus();
  }

  removeClick() {
    if (this.produtoPropriedade.IdCfgTipoPermissaoEdicaoCadastro == 1) {
      this.alertaService.mostrarMensagem("Não é permitido remover itens da lista de valores válidos para essa propriedade!");
      return;
    }

    if (this.selectedValorValido == undefined) {
      this.alertaService.mostrarMensagem("Para remover um item, é necessário selecionar algum item da lista de valores válidos!");
      return;
    }

    if (this.selectedValorValido[0].id <= 10000 && this.produtoPropriedade.IdCfgTipoPermissaoEdicaoCadastro == 1) {
      this.mensagemService.showErrorViaToast(["Desculpe! Esse item não pode ser removido."]);
      return;
    }

    this.sweetAlertService
      .dialogo("", `Tem certeza que deseja remover o item "${this.selectedValorValido[0].valor}" da lista de valores válidos?`)
      .subscribe(result => {
        if (!result) return;

        this.lstValoresValidos = this.lstValoresValidos.filter(x => x.valor != this.selectedValorValido[0].valor);
        this.lstValoresValidos = [...this.lstValoresValidos];
        this.selectedValorValido = null;
      });
  }

  editarClick() {
    if (this.produtoPropriedade.IdCfgTipoPermissaoEdicaoCadastro == 1) {
      this.alertaService.mostrarMensagem("Não é permitido editar a de valores válidos para essa propriedade!");
      return;
    }
    if (this.selectedValorValido == undefined) {
      this.alertaService.mostrarMensagem("Para editar um item, é necessário selecionar algum item da lista de valores válidos!");
      return;
    }

    if (this.selectedValorValido[0].id <= 10000 && this.produtoPropriedade.IdCfgTipoPermissaoEdicaoCadastro == 1) {
      this.mensagemService.showErrorViaToast(["Desculpe! Esse item não pode ser editado."]);
      return;
    }

    this.valorValido = this.selectedValorValido[0].valor;
    this.ocultoOpcao = !this.selectedValorValido[0].oculto

    this.itemApoioEdicao = new ProdutoCatalogoPropriedadeOpcao();
    this.itemApoioEdicao.oculto = !this.selectedValorValido[0].oculto
    this.itemApoioEdicao.valor = this.selectedValorValido[0].valor;
    this.itemApoioEdicao.usuario_cadastro = this.selectedValorValido[0].usuarioLogado;
    this.itemApoioEdicao.dt_cadastro = this.selectedValorValido[0].dt_cadastro;
    this.itemApoioEdicao.id = this.selectedValorValido[0].id;
    this.itemApoioEdicao.id_produto_catalogo_propriedade = this.selectedValorValido[0].id_produto_catalogo_propriedade;
    this.itemApoioEdicao.ordem = this.selectedValorValido[0].ordem;

    this.editando = true;
  }

  salvarEdicaoClick() {
    if (this.valorValido.trim() == "") {
      this.alertaService.mostrarMensagem("Favor informar um valor!");
      return;
    }

    if (!this.validacaoFormularioService.validaForm(this.form)) {
      if (!this.form.controls.descricao.invalid) return;
    }

    let propExiste = this.lstValoresValidos.filter(x => x.id == this.itemApoioEdicao.id);

    if (propExiste.length == 1) {
      propExiste[0].valor = this.valorValido;
      propExiste[0].oculto = this.ocultoOpcao ? false : true;
    }

    this.cancelarEdicaoClick();
    this.selectedValorValido = null;

    this.inputValorValido.nativeElement.focus();
  }

  cancelarEdicaoClick() {
    this.itemApoioEdicao = new ProdutoCatalogoPropriedadeOpcao();
    this.valorValido = "";
    this.ocultoOpcao = true;
    this.editando = false;
    this.selectedValorValido = null;

    this.inputValorValido.nativeElement.focus();
  }

  changeOrdem(event: Event) {
    let valor = ((event.target) as HTMLInputElement).value;
    this.form.controls.ordem.setValue(valor.replace(".", "").replace(",", ""));
    if (isNaN(Number(valor))) {
      let limpando = valor.replace(/[^0-9]/g, '');
      this.form.controls.ordem.setValue(limpando);
    }
  }

  criarForm() {
    this.form = this.fb.group({
      descricao: [this.produtoPropriedade.descricao, [Validators.required, Validators.maxLength(100)]],
      idCfgDataType: [this.produtoPropriedade.IdCfgDataType, [Validators.required, Validators.min(0), Validators.max(2)]],
      idTipoPropriedade: [this.produtoPropriedade.IdCfgTipoPropriedade, [Validators.required]],
      ordem: [this.produtoPropriedade.ordem, [Validators.required, Validators.maxLength(4), Validators.pattern("^[0-9]*$")]],//'^-?[0-9]\\d*(d{1,2})?$'
      valorValido: [''],
      ocultoPropriedade: [!this.produtoPropriedade.oculto, [Validators.required]],
      ocultoOpcao: [''],
    });
  }

  montarListaParaSelectItem(lista: Array<any>): SelectItem[] {
    let listaResponse: SelectItem[] = [];
    lista.forEach(x => {
      if (x != null) {
        let item: SelectItem = { label: x.Descricao, value: x.Id };
        listaResponse.push(item);
      }
    });

    return listaResponse;
  }

  voltarClick(): void {
    this.sweetAlertService.dialogo("", "Tem certeza que deseja cancelar essa operação?").subscribe(result => {
      if (result) this.router.navigate(["//produtos-catalogo/propriedades/listar"]);

      if (!result) {
        this.carregando = false;
        return;
      }
    });
  }

  retornarSimOuNao(oculto: any) {
    if (oculto == true) {
      return "Não";
    } else {
      return "Sim";
    }
  }

  salvarClick() {
    this.carregando = true;
    if (!this.validacaoFormularioService.validaForm(this.form)) {
      this.carregando = false;
      return;
    }

    let prop = new ProdutoCatalogoPropriedade();
    prop.id = this.produtoPropriedade.id;
    prop.IdCfgDataType = this.idCfgDataType;
    prop.IdCfgTipoPropriedade = this.idTipoPropriedade;
    prop.IdCfgTipoPermissaoEdicaoCadastro = this.edicao ? this.produtoPropriedade.IdCfgTipoPermissaoEdicaoCadastro : 0;
    prop.descricao = this.form.controls.descricao.value;
    prop.usuario_cadastro = this.edicao? this.produtoPropriedade.usuario_cadastro : this.autenticacaoService._usuarioLogado;
    prop.oculto = this.form.controls.ocultoPropriedade.value ? false : true;
    prop.ordem = this.form.controls.ordem.value;

    if (this.idTipoPropriedade == 1) {
      if (this.lstValoresValidos.length == 0) {
        this.mensagemService.showErrorViaToast(["É necessário informar ao menos um item na lista de valores válido!"]);
        this.carregando = false;
        return
      }
      prop.produtoCatalogoPropriedadeOpcao = new Array();
      prop.produtoCatalogoPropriedadeOpcao = this.lstValoresValidos;
    }

    if (this.edicao) this.editarPropriedade(prop);
    else this.criarPropriedade(prop);

  }

  editarPropriedade(propriedade: ProdutoCatalogoPropriedade) {

    this.produtoService.atualizarPropriedades(propriedade).toPromise().then((r) => {
      this.carregando = false;
      if (!!r.Mensagem) {
        this.sweetAlertService.aviso(`Erro ao salvar!<br>${r.Mensagem}`);
        return;
      }
      if (r.produtosCatalogo != null && r.produtosCatalogo.length > 0) {
        // tratar o retorno para mostrar apenas o produto e a descrição
        let lista = new Array();
        let texto = "";
        r.produtosCatalogo.forEach(p => {
          texto = texto.concat(`${p.Produto} - ${p.Descricao}<br>`);
          lista.push(`${p.Produto} - ${p.Descricao}`);
        });
        this.sweetAlertService.aviso(`<b>Erro ao remover valor válido da lista!</b><br>Existem produtos que utilizam essa opção: <br> ${texto}`);
        this.lstValoresValidos = [...this.lstValoresValidosApoioExclusao];
        return;
      }

      this.sweetAlertService.sucesso("Propriedade atualizado com sucesso!");
      this.router.navigate(["//produtos-catalogo/propriedades/listar"]);
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.carregando = false;
    });
  }

  criarPropriedade(propriedade: ProdutoCatalogoPropriedade) {
    propriedade.loja = this.autenticacaoService._lojaLogado;
    this.produtoService.criarPropriedades(propriedade).toPromise().then((r) => {
      if (r == null) {
        this.mensagemService.showSuccessViaToast("Propriedade criada com sucesso!");
        this.router.navigate(["//produtos-catalogo/propriedades/listar"]);
      }
      this.carregando = false;
    }).catch((r) => {
      this.alertaService.mostrarErroInternet(r);
      this.carregando = false;
    });
  }

  onSelectionChange() {
    if (this.produtoPropriedade.id <= 10000 && this.produtoPropriedade.IdCfgTipoPermissaoEdicaoCadastro == 1) {
      this.selectedValorValido = null;
      return false;
    }
  }

  onReorder() {
    if (this.produtoPropriedade.id <= 10000 && this.produtoPropriedade.IdCfgTipoPermissaoEdicaoCadastro == 1) {
      this.selectedValorValido = null;
      this.lstValoresValidos = new Array();
      this.lstValoresValidos = [...this.lstValoresValidosApoioExclusao];
      this.alertaService.mostrarMensagem("Não é permitido reordenar a lista de valores válidos dessa propriedade!");
      return;
    }
  }
}

