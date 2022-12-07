import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Component, OnInit } from '@angular/core';
import { DownloadsService } from 'src/app/service/downloads/downloads.service';
import { TreeNode } from 'primeng/api/treenode';
import { Router, ActivatedRoute } from '@angular/router';
import * as fileSaver from 'file-saver';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { Constantes } from 'src/app/utilities/constantes';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { CdkTreeNode } from '@angular/cdk/tree';
import { Console } from 'console';

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.component.html',
  styleUrls: ['./downloads.component.scss']
})

export class DownloadsComponent extends TelaDesktopBaseComponent implements OnInit {
  constructor(private readonly downloadsService: DownloadsService,
    public readonly activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private readonly validacaoFormGroup: ValidacaoFormularioService,
    private readonly mensagemService: MensagemService,
    private readonly alertaService: AlertaService,
    private readonly autenticacaoService: AutenticacaoService,
    telaDesktopService: TelaDesktopService,
    private readonly sweetalertService: SweetalertService) {
    super(telaDesktopService);
  }

  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public uploadedFiles: any[] = [];
  public estrutura: TreeNode[];
  public estruturaSelecionada: TreeNode;
  public cols: any[];
  public novaPasta: boolean = false;
  public edicao: boolean = false;
  public ehArquivo: boolean = false;
  public ehUpload: boolean = false;
  public constantes: Constantes = new Constantes();
  public pastaRaizInserida: boolean = false;
  exibeBotaoUpload: boolean;
  exibeBotaoNovaPasta: boolean;
  exibeBotaoEditarArquivoPasta: boolean;
  exibeBotaoExcluirArquivoPasta: boolean;
  lojaLogado:string;

  ngOnInit(): void {
    this.criarForm();
    this.atualizarEstrutura();
    this.montarPastas();
    this.verificarPermissoes();
    this.lojaLogado = this.autenticacaoService._lojaLogado;
  }

  criarForm() {
    this.form = this.fb.group({
      pasta: ['', [Validators.required]],
      descricaoPasta: [''],
      txtNome: ['', [Validators.required]],
      txtDescricao: [''],
    });
  }

  atualizarEstrutura() {
    this.downloadsService.buscarToTree().toPromise().then(response => {

      if (!response.Sucesso) {
        this.sweetalertService.aviso(response.Mensagem);
        return;
      }

      this.limparEstrutura();

      this.estrutura = response.Childs;

    }).catch((response) => this.sweetalertService.aviso(response));
  }

  montarPastas() {
    this.cols = [
      { field: 'name', header: 'Nome' },
      { field: 'size', header: 'Tamanho' },
      { field: 'descricao', header: 'Descrição' },
      { field: 'key', header: 'Id', visible: 'none' },
      { field: 'acoes', header: 'Ações' }
    ];
  }

  verificarPermissoes() {
    this.exibeBotaoUpload = this.autenticacaoService.verificarPermissoes(ePermissao.ArquivosDownloadIncluirEditarPastasArquivos);
    this.exibeBotaoNovaPasta = this.autenticacaoService.verificarPermissoes(ePermissao.ArquivosDownloadIncluirEditarPastasArquivos);
    this.exibeBotaoEditarArquivoPasta = this.autenticacaoService.verificarPermissoes(ePermissao.ArquivosDownloadIncluirEditarPastasArquivos);
    this.exibeBotaoExcluirArquivoPasta = this.autenticacaoService.verificarPermissoes(ePermissao.ArquivosDownloadIncluirEditarPastasArquivos);
  }

  novaPastaClick() {

    this.novaPasta = !this.novaPasta;
    this.ehUpload = false;
    this.edicao = false;

  }

  addPastaTable() {

    if(!this.autenticacaoService.verificarPermissoes(ePermissao.ArquivosDownloadIncluirEditarPastasArquivos)) return;

    let idPai = "";

    if(this.estruturaSelecionada != undefined){
      idPai = this.estruturaSelecionada.data.key;
    }

    let nome = this.form.controls.pasta.value;
    let descricao = this.form.controls.descricaoPasta.value;
    
    this.downloadsService.novaPasta(idPai, nome, descricao, this.lojaLogado).toPromise().then(response => {
      
      if (!response.Sucesso) {
        this.sweetalertService.aviso(response.Mensagem);
        return;
      }

      if(idPai === "") {
        this.pastaRaizInserida = true;
        this.novaPasta = false;
        this.form.reset();
        this.atualizarEstrutura();
        return;
      }      
  
      let novaPasta: TreeNode = {
        data: {
          "name": "",
          "size": "",
          "descricao": "",
          "type": "Folder"
        },
        children: [],
        parent: null
      };

      novaPasta.data.key = response.Id;
      novaPasta.data.name = nome;
      novaPasta.data.size = "";
      novaPasta.data.descricao = descricao;
        
      if (this.estruturaSelecionada)
        this.estruturaSelecionada.children.push(novaPasta);
      else
        this.estrutura.push(novaPasta);

      this.estrutura = [...this.estrutura];
      this.novaPasta = false;
      this.form.reset();
      this.atualizarEstrutura();

    }).catch((r) => this.sweetalertService.aviso(r));
  }

  excluirClick() {
    if(!this.autenticacaoService.verificarPermissoes(ePermissao.ArquivosDownloadIncluirEditarPastasArquivos)) return;

    if (!!this.estruturaSelecionada == false) {
      this.sweetalertService.aviso("Selecione uma pasta, ou arquivo!");
      return;
    }

    this.sweetalertService.dialogo("", "Tem certeza que deseja excluir?").subscribe(result => {

      if (!result) {
        return;
      }
      else { 
        this.concluirExclusao();
      }

    });
  }

  concluirExclusao() {
    if(!this.autenticacaoService.verificarPermissoes(ePermissao.ArquivosDownloadIncluirEditarPastasArquivos)) return;

    if (this.estruturaSelecionada.hasOwnProperty('children') && this.estruturaSelecionada.children.length > 0) {
      this.sweetalertService.aviso("Não é possivel excluir pastas que possuem arquivos!");
      return;
    }
debugger;
    this.downloadsService.excluir(this.estruturaSelecionada.data.key, this.lojaLogado).toPromise().then(response => {

      if (!response.Sucesso) {
        this.sweetalertService.aviso(response.Mensagem);
        return;
      }
      
      if (this.ehArquivo) {
        this.sweetalertService.sucesso("Arquivo excluído!");
      } 
      else {
        this.sweetalertService.sucesso("Pasta excluída!");
      }

      if(this.estrutura.length == 1 && this.estrutura[0].children.length == 0) {
        this.limparEstrutura();
      }
      else {
        this.atualizarEstrutura();
      }

    }).catch(e => this.sweetalertService.aviso(e));
  }

  limparEstrutura() {
      this.estruturaSelecionada = null;
      this.estrutura = null;
      this.edicao = false;
  }

  public controlaBotoes(rowData: any) {

    if (!this.estruturaSelecionada) {
      this.edicao = false;
    }

    if (!!this.estruturaSelecionada) {
      if (this.estruturaSelecionada.data.type == "File") {
        this.ehArquivo = true;
        this.novaPasta = false;
      }
      else {
        this.ehArquivo = false;
      }
    }
  }

  editarClick() {
    if (!!this.estruturaSelecionada == false) {
      this.sweetalertService.aviso("Selecione um arquivo ou pasta!");
      return;
    }

    this.form.controls.txtNome.setValue(this.estruturaSelecionada.data.name);
    this.form.controls.txtDescricao.setValue(this.estruturaSelecionada.data.descricao);

    this.edicao = !this.edicao;
    this.novaPasta = false;
    this.ehUpload = false;
  }

  editarSalvarClick() {
    if(!this.autenticacaoService.verificarPermissoes(ePermissao.ArquivosDownloadIncluirEditarPastasArquivos)) return;

    let id = this.estruturaSelecionada.data.key;
    let nome = this.form.controls.txtNome.value;
    let descricao = this.form.controls.txtDescricao.value;

    this.downloadsService.editar(id, nome, descricao).toPromise().then(response => {

      if (!response.Sucesso) {
        this.sweetalertService.aviso(response.Mensagem);
        return;
      }

      this.sweetalertService.sucesso(response.Mensagem);

      this.atualizarEstrutura();

    }).catch((r) => this.sweetalertService.aviso(r));
  }

  uploadClick() {
    if(!this.autenticacaoService.verificarPermissoes(ePermissao.ArquivosDownloadIncluirEditarPastasArquivos)) return;

    if (!!this.estruturaSelecionada == false) {
      this.sweetalertService.aviso("Selecione uma pasta!");
      return;
    }

    this.ehUpload = !this.ehUpload;
    this.novaPasta = false;
    this.edicao = false;
  }

  myUploader(event) {

    let idPai = this.estruturaSelecionada.data.key;
    let arquivo = event;

    this.downloadsService.upload(idPai, arquivo).toPromise().then(response => {

      if (!response.Sucesso) {
        this.sweetalertService.aviso(response.Mensagem);
        return;
      }

      this.ehUpload = false;
      this.sweetalertService.sucesso(response.Mensagem);
      
      this.atualizarEstrutura();

    }).catch((response) => this.sweetalertService.aviso(response));
  }

  downloadSelecionado(event) {
    
    this.downloadsService.download(event.key).toPromise().then(response => {

      if (!response.Sucesso) {
        this.sweetalertService.aviso(response.Mensagem);
        return;
      }

      let vb64Data = response.ByteArray;
      let contentType = 'application/pdf; charset=utf-8';
      const byteCharacters = atob(vb64Data.toString());
      const byteArrays = [];
  
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
  
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i); 
        }
  
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
  
      const blob = new Blob(byteArrays, {type: contentType});
      const url = window.URL.createObjectURL(blob);
      fileSaver.saveAs(blob, response.Nome);
      this.sweetalertService.sucesso(response.Mensagem);
      this.edicao = false;
      this.novaPasta = false;
      this.ehUpload = false;

    }).catch((response) => this.sweetalertService.aviso(response));
  }
}