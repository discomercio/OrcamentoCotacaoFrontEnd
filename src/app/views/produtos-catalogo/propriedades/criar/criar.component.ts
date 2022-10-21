import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { ProdutoCatalogoPropriedade } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedade';
import { DataType } from 'src/app/dto/produtos-catalogo/DataType';
import { SelectItem } from 'primeng/api';
import { ProdutoCatalogoPropriedadeOpcao } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedadeOpcao';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';

@Component({
  selector: 'app-criar-produto',
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
    private readonly autenticacaoService:AutenticacaoService
  ) { }

  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public produtoPropriedade: ProdutoCatalogoPropriedade = new ProdutoCatalogoPropriedade();
  carregando: boolean = false;
  lstDataTypes: SelectItem[] = new Array();
  lstTipoPropriedadeCatalogo: SelectItem[] = new Array();
  lstValoresValidos: ProdutoCatalogoPropriedadeOpcao[] = new Array();
  valorValido: string;
  selectedValorValido: any;
  alertaTipoProp: string;
  ocultoOpcao: boolean = false;
  ocultoPropriedade: boolean = false;
  idCfgDataType: number;
  idTipoPropriedade: number;

  ngOnInit(): void {
    this.carregando = true;
    this.criarForm();
    this.buscargDataTypes();
    this.buscarTipoPropriedades();
    //buscar t_CFG_TIPO_PERMISSAO_EDICAO_CADASTRO
  }

  buscargDataTypes() {
    this.produtoService.buscarDataTypes().toPromise().then((r) => {

      if (r != null) {
        this.lstDataTypes = this.montarListaParaSelectItem(r);
      }
      else {
        this.alertaService.mostrarMensagem("Ops! Não encontramos a lista de tipo de dado.");
      }
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
    });
  }

  changeDataType() {
    let dataType: string;
    dataType = this.form.controls.idCfgDataType.value;

    if (this.lstValoresValidos.length > 0) {

      if (this.produtoPropriedade.IdCfgDataType != this.idCfgDataType) {
        this.mensagemService.showWarnViaToast("Não é permitido alterar o tipo de dado da propriedade com itens na lista de valores válidos!");
        this.idCfgDataType = this.produtoPropriedade.IdCfgDataType;
        this.form.controls.idCfgDataType.setValue(this.idCfgDataType);
        return;
      }
    }

    if (dataType == "0")//texto
    {
      this.form.controls["valorValido"].clearValidators();

    }
    if (dataType == "1")//inteiro
    {
      this.form.controls["valorValido"].setValidators([Validators.pattern("^[0-9]*$")]);
      this.alertaTipoProp = "Informe somente números";
    }
    if (dataType == "2")//real
    {
      this.form.controls["valorValido"].setValidators([Validators.pattern("^[0-9]+(,[0-9]+)?$")]);
      this.alertaTipoProp = "Esperamos vírgula";
    }

    this.form.controls["valorValido"].updateValueAndValidity();
  }

  buscarTipoPropriedades() {
    this.produtoService.buscarTipoPropriedades().toPromise().then((r) => {
      if (r != null) {
        this.lstTipoPropriedadeCatalogo = this.montarListaParaSelectItem(r);
      }
      else this.alertaService.mostrarMensagem("Ops! Não encontramos a lista de tipo de propriedade.")
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
    });
  }

  inserirClick() {
    if (this.valorValido.trim() == "") {
      this.alertaService.mostrarMensagem("Favor informar um valor!");
      return;
    }

    if (!this.validacaoFormularioService.validaForm(this.form)) {
      if(!this.form.controls.descricao.invalid) return;
    }

    if (this.lstValoresValidos.length > 0) {
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
    item.oculto = this.ocultoOpcao;
    item.valor = this.valorValido;

    this.lstValoresValidos = [...this.lstValoresValidos, item];
    this.produtoPropriedade.IdCfgDataType = this.idCfgDataType;
    this.valorValido = "";
  }

  removeClick() {
    if (this.selectedValorValido == undefined) {
      this.alertaService.mostrarMensagem("Para remover um item, é necessário selecionar algum item da lista de valores válidos!");
      return;
    }

    this.lstValoresValidos = this.lstValoresValidos.filter(x => x.valor != this.selectedValorValido[0].valor);
    this.lstValoresValidos = [...this.lstValoresValidos];
  }

  criarForm() {
    this.form = this.fb.group({
      descricao: ['', [Validators.required]],
      idCfgDataType: ['', [Validators.required, Validators.min(0), Validators.max(2)]],
      idTipoPropriedade: ['', [Validators.required]],
      valorValido: [''],
      ocultoPropriedade: ['', [Validators.required]],
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
    this.router.navigate(["//produtos-catalogo/propriedades/listar"]);
  }

  retornarSimOuNao(oculto: any) {
    if (oculto == true) {
      return "Sim";
    } else {
      return "Não";
    }
  }

  salvarClick() {

    if (!this.validacaoFormularioService.validaForm(this.form)) {
      return;
    }
    
    let prod = new ProdutoCatalogoPropriedade();
    prod.IdCfgDataType = this.idCfgDataType;
    prod.IdCfgTipoPropriedade = this.idTipoPropriedade
    prod.descricao = this.form.controls.descricao.value;
    prod.usuario_cadastro = this.autenticacaoService._usuarioLogado;
    prod.oculto = this.ocultoPropriedade;
    debugger;
    //fazer a parte no caso de propriedade limitada
    if(this.idTipoPropriedade == 1){
      
    }

    // this.produtoService.criarPropriedades(prod).toPromise().then((r) => {
    //   if (r != null) {
    //     this.mensagemService.showSuccessViaToast("Propriedade criada com sucesso!");
    //     this.router.navigate(["//produtos-catalogo/propriedades/listar"]);
    //     //this.router.navigate([`//produtos-catalogo-propriedades/editar/${prod.Id}`]);
    //   }
    // }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

}

