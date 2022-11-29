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
    private router: Router,
    private fb: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly produtoService: ProdutoCatalogoService,
    private readonly alertaService: AlertaService,
    private readonly mensagemService: MensagemService,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private readonly sweetalertService: SweetalertService,
    private readonly autenticacaoService: AutenticacaoService) { }

  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public produtoPropriedade: ProdutoCatalogoPropriedade = new ProdutoCatalogoPropriedade();
  private id: number;
  public boolAtivo: boolean;
  carregando: boolean = false;
  @ViewChild("criarPropriedade") criarPropriedade: ProdutosCatalogoPropriedadesCriarComponent;

  ngOnInit(): void {
    
    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoPropriedadeIncluirEditar)) {
      this.sweetalertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
      return;
    }

    this.carregando = true;
    this.id = this.activatedRoute.snapshot.params.id;
    this.buscarPropriedadesPorId();
  }

  buscarPropriedadesPorId() {

    this.produtoService.buscarPropriedadesPorId(this.id).toPromise().then((r) => {
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

        this.criarPropriedade.changeDataType();
      }
      this.carregando = false;
    }).catch((r) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(r);
    });
  }

}

