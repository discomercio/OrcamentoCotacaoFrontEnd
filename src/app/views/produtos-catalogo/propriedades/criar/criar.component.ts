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
  ) { }

  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public produtoPropriedade: ProdutoCatalogoPropriedade = new ProdutoCatalogoPropriedade();
  carregando: boolean = false;
  lstDataTypes: SelectItem[] = new Array();
  lstTipoPropriedadeCatalogo: SelectItem[] = new Array();
  lstValoresValidos: SelectItem[] = new Array();
  valorValido: string;
  selectedValorValido:any;

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
    dataType = this.form.controls.tipoDado.value;
    alert(dataType);
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

  changetipoPropriedade() {
    let tipoProp: string;
    tipoProp = this.form.controls.tipoPropriedade.value;
    alert(tipoProp);
  }

  buscarPermissaoEdicaoCadastro() {

  }

  inserirClick() {
    if (this.valorValido == "") {
      this.alertaService.mostrarMensagem("Favor informar um valor!");
      return;
    }

    let item: SelectItem = { label: this.valorValido, value: this.valorValido };
    this.lstValoresValidos = [...this.lstValoresValidos, item];
    this.valorValido = "";
  }

  removeClick(){
    if (this.selectedValorValido == undefined) {
      this.alertaService.mostrarMensagem("Para remover um item, é necessário selecionar algum item da lista de valores válidos!");
      return;
    }
    
    this.lstValoresValidos = this.lstValoresValidos.filter(x => x.label != this.selectedValorValido[0].label)
    this.lstValoresValidos = [...this.lstValoresValidos];
  }

  criarForm() {
    this.form = this.fb.group({
      id: ['', [Validators.required]],
      descricao: ['', [Validators.required]],
      ativo: [''],
      tipoDado: ['', [Validators.required, Validators.min(0), Validators.max(2)]],
      tipoPropriedade: ['', [Validators.required]],
      valorValido: ['']
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

  salvarClick() {

    let prod = new ProdutoCatalogoPropriedade();
    //prod.Id = this.form.controls.id.value;
    prod.descricao = this.form.controls.descricao.value;
    prod.usuario_cadastro = 'SISTEMA';

    this.produtoService.criarPropriedades(prod).toPromise().then((r) => {
      if (r != null) {
        this.mensagemService.showSuccessViaToast("Propriedade criada com sucesso!");
        this.router.navigate(["//produtos-catalogo/propriedades/listar"]);
        //this.router.navigate([`//produtos-catalogo-propriedades/editar/${prod.Id}`]);
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

}

