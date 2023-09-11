import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { ProdutoCatalogoPropriedade } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedade';
import { ProdutosCatalogoPropriedadesCriarComponent } from '../criar/criar.component';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';

@Component({
  selector: 'app-editar-produto',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss']
})
export class ProdutosCatalogoPropriedadesEditarComponent implements OnInit {

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly produtoService: ProdutoCatalogoService,
    private readonly alertaService: AlertaService,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private readonly sweetalertService: SweetalertService,
    private readonly autenticacaoService: AutenticacaoService) { }

  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public produtoPropriedade: ProdutoCatalogoPropriedade = new ProdutoCatalogoPropriedade();
  private id: number;
  public boolAtivo: boolean;
  @ViewChild("criarPropriedade", { static: true }) criarPropriedade: ProdutosCatalogoPropriedadesCriarComponent;

  ngOnInit(): void {

    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoPropriedadeIncluirEditar)) {
      this.sweetalertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      return;
    }

    this.criarPropriedade.carregando = true;
    this.id = this.activatedRoute.snapshot.params.id;

    let promises: any = [this.buscarPropriedadesPorId2(), this.criarPropriedade.buscarDataTypes(), this.criarPropriedade.buscarTipoPropriedades()];
    Promise.all(promises).then((r:any)=>{
      this.setarProdutoPropriedade(r[0]);
      this.criarPropriedade.setarDataTypes(r[1]);
      this.criarPropriedade.setarTipoPropriedades(r[2]);
    }).catch((e)=>{
      this.criarPropriedade.carregando = false;
      this.alertaService.mostrarErroInternet(e);
    }).finally(()=>{
      this.criarPropriedade.carregando = false;
    });
  }

  buscarPropriedadesPorId2(): Promise<ProdutoCatalogoPropriedade> {
    return this.produtoService.buscarPropriedadesPorId(this.id).toPromise();
  }

  setarProdutoPropriedade(r: ProdutoCatalogoPropriedade) {
    if (r != null) {
      this.produtoPropriedade = r[0];
      
      this.criarPropriedade.produtoPropriedade = r[0];
      this.criarPropriedade.criarForm();
      this.criarPropriedade.form.controls.idTipoPropriedade.setValue(this.produtoPropriedade.IdCfgTipoPropriedade);
      this.criarPropriedade.idTipoPropriedade = this.produtoPropriedade.IdCfgTipoPropriedade;
      this.criarPropriedade.idCfgDataType = this.produtoPropriedade.IdCfgDataType;
      if (this.produtoPropriedade.produtoCatalogoPropriedadeOpcao != null) {
        this.criarPropriedade.lstValoresValidos = this.produtoPropriedade.produtoCatalogoPropriedadeOpcao;
        this.criarPropriedade.lstValoresValidosApoioExclusao = this.produtoPropriedade.produtoCatalogoPropriedadeOpcao.slice();
      }
      if(this.produtoPropriedade.IdCfgTipoPermissaoEdicaoCadastro == 1){
        this.criarPropriedade.permissaoEdicaoCadastro = false;
      }
      if(this.produtoPropriedade.IdCfgTipoPermissaoEdicaoCadastro == 0){
        this.criarPropriedade.permissaoEdicaoCadastro = true;
      }

      this.criarPropriedade.changeDataType();
    }
  }
}

