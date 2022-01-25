import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { concat } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { DownloadsService } from 'src/app/service/downloads/downloads.service';
import { TreeNode } from 'primeng/api/treenode';
import { Router, ActivatedRoute } from '@angular/router';
import * as fileSaver from 'file-saver';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidacaoFormularioComponent } from 'src/app/utilities/validacao-formulario/validacao-formulario.component';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';


@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.component.html',
  styleUrls: ['./downloads.component.scss']
})
export class DownloadsComponent implements OnInit {
  constructor(private readonly downloadsService: DownloadsService,
    private readonly router: Router,
    public readonly activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private readonly validacaoFormGroup: ValidacaoFormularioComponent,
    private readonly mensagemService: MensagemService,
    private readonly alertaService: AlertaService,
    private readonly autenticacaoService: AutenticacaoService)  {  }

  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public uploadedFiles: any[] = [];
  public files2: TreeNode[];
  public selectedFiles2: TreeNode;
  public cols: any[];
  public novaPasta: boolean;
  public edicao: boolean;
  public ehArquivo: boolean = false;
  public ehUpload: boolean = false;
  public isAutorizado: boolean = this.autenticacaoService.authEstaLogado();
  public urlUpload: string = this.downloadsService.urlUpload;

  ngOnInit(): void {

    this.form = this.fb.group({
      pasta: ['', [Validators.required]],
      descricaoPasta: [''],
      txtNome: ['', [Validators.required]],
      txtDescricao: [''],
    });

    this.novaPasta = false;
    this.edicao = false;

    this.downloadsService.buscarToTree().then(files => this.files2 = files);

    this.cols = [
      { field: 'name', header: 'Nome' },
      { field: 'size', header: 'Tamanho' },
      { field: 'descricao', header: 'Descrição' },
      { field: 'key', header: 'Id', visible: 'none' }
    ];

  }

  sucesso(event, origem) {
    if(origem == "arquivo") {
      this.mensagemService.showWarnViaToast("Arquivo excluído!");
    } else if(origem = "pasta") {
      this.mensagemService.showWarnViaToast("Pasta excluída!");
    }
  }

  public controlaBotoes() {
    console.log('controlaBotoes');
    if (!!this.selectedFiles2) {
      if (this.selectedFiles2.data.name.indexOf(".") > -1) {
        this.ehArquivo = true;
        this.novaPasta = false;
      }
      else this.ehArquivo = false;
    }
  }

  novaPastaClick() {
    console.log('novaPastaClick');

    if(!!this.selectedFiles2 == false){
      this.mensagemService.showWarnViaToast("Selecione uma pasta!");
      return;
    }

    this.novaPasta = !this.novaPasta;
    this.ehUpload = false;
    this.edicao = false;
  }

  editarClick() {
    if(!!this.selectedFiles2 == false){
      this.mensagemService.showWarnViaToast("Selecione um arquivo ou pasta!");
      return;
    }

    this.form.controls.txtNome.value = this.selectedFiles2.data.name;
    this.form.controls.txtDescricao.value = this.selectedFiles2.data.descricao;

    this.edicao = !this.edicao;
    this.novaPasta = false;
    this.ehUpload = false;
  }

  editarSalvarClick() {
    //if (!this.validacaoFormGroup.validaForm(this.form)) return;

    this.downloadsService.editar(this.selectedFiles2.data.key, this.form.controls.txtNome.value, this.form.controls.txtDescricao.value).toPromise().then(r => {
      if (r == null) {
        // erro
      }
    }).catch((r)=> this.alertaService.mostrarErroInternet(r));

    this.editarItem();
    this.edicao = false;
    this.form.reset();
  }

  downloadClick() {
    if(!!this.selectedFiles2 == false){
      this.mensagemService.showWarnViaToast("Selecione um arquivo!");
      return;
    }

    if (!!this.selectedFiles2) {
      this.downloadsService.download(this.selectedFiles2.data.key).subscribe((response: any) => {
        let blob: any = new Blob([response], { type: 'application/pdf; charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        fileSaver.saveAs(blob, this.selectedFiles2.data.name);
        this.mensagemService.showSuccessViaToast("Download efetuado com sucesso");
        this.edicao = false;
        this.novaPasta = false;
        this.ehUpload = false;
      }), (error: any) => this.mensagemService.showErrorViaToast(["Erro ao fazer o download."]);
      return;
    }
  }

  uploadClick() {
    if(!!this.selectedFiles2 == false){
      this.mensagemService.showWarnViaToast("Selecione uma pasta!");
      return;
    }

    this.ehUpload = !this.ehUpload;
    this.novaPasta = false;
    this.edicao = false;
  }

  excluirClick() {
    let request;

    if(!!this.selectedFiles2 == false){
      this.mensagemService.showWarnViaToast("Selecione uma pasta, ou arquivo!");
      return;
    }

    if(this.selectedFiles2.hasOwnProperty('children') && this.selectedFiles2.children.length > 0) {
      this.mensagemService.showWarnViaToast("Não é possivel excluir pastas que possuem arquivos!");
      return;
    }

    request = this.downloadsService.excluir(this.selectedFiles2.data.key);

    if (this.ehArquivo) {
      request.subscribe((response) => {
        this.sucesso(response, "arquivo");
      }, error => {
        //this.error(error);
      });
    } else {
      request.subscribe((response) => {
        this.sucesso(response, "pasta");
      }, error => {
        //this.error(error);
      });
    }
  }

  remove(){
    //if (!this.validacaoFormGroup.validaForm(this.form)) return;

    if (this.selectedFiles2) {

      //this.selectedFiles2.children.remove(novoArquivoTree);

    // this.files2 = [...this.files2];
    // this.ehArquivo = false;
    // this.form.reset();

    var key = this.selectedFiles2.data.key;

    // console.log('key: ' + key);
    // console.log('this.files2.length: ' + this.files2.length);

    //this.files2.forEach(this.removeItem);

    for (var i = 0; i <= this.files2[0].children.length -1; i++) {
      console.log(this.files2[0].children[i].data.name);

      for (var c = 0; c <= this.files2[0].children[i].children.length -1; c++) {
        console.log(this.files2[0].children[i].children[c].data.name);

        if (this.files2[0].children[i].children[c].data.key == key) {
          this.files2[0].children[i].children[c] = null;
          //this.files2.model.update();
        }
       }
     }
  }
}


editarItem(){
  //if (!this.validacaoFormGroup.validaForm(this.form)) return;

  if (this.selectedFiles2) {
  var key = this.selectedFiles2.data.key;

  //1º Nivel
  if (this.files2[0].data.key == key) {
    this.files2[0].data.name = this.form.controls.txtNome.value;
    this.files2[0].data.descricao = this.form.controls.txtDescricao.value;
  }
  //2º Nivel
  for (var i = 0; i <= this.files2[0].children.length -1; i++) {
    console.log(this.files2[0].children[i].data.name);
    if (this.files2[0].children[i].data.key == key) {
      this.files2[0].children[i].data.name = this.form.controls.txtNome.value;
      this.files2[0].children[i].data.descricao = this.form.controls.txtDescricao.value;
    }
    //3º Nivel
    for (var c = 0; c <= this.files2[0].children[i].children.length -1; c++) {
      console.log(this.files2[0].children[i].children[c].data.name);
      if (this.files2[0].children[i].children[c].data.key == key) {
        this.files2[0].children[i].children[c].data.name = this.form.controls.txtNome.value;
        this.files2[0].children[i].children[c].data.descricao = this.form.controls.txtDescricao.value;
      }
     }
   }
}
}

  addPastaTable() {
    console.log('addPastaTable');
    if (!this.validacaoFormGroup.validaForm(this.form)) return;

    this.downloadsService.novaPasta(this.form.controls.pasta.value, this.selectedFiles2.data.key).toPromise().then(r => {
      if (r == null) {
        // erro
      }
    }).catch((r)=> this.alertaService.mostrarErroInternet(r));

    let novaPastaTree: TreeNode = {
      data: {
        "name": "",
        "size": "",
        "descricao": "",
        "type": "Folder"
      },
      children: [],
      parent: null
    };

    novaPastaTree.data.name = this.form.controls.pasta.value;
    novaPastaTree.data.size = "";
    novaPastaTree.data.descricao = this.form.controls.descricaoPasta.value;

    if (this.selectedFiles2)
      this.selectedFiles2.children.push(novaPastaTree);
    else
      this.files2.push(novaPastaTree);

    this.files2 = [...this.files2];
    this.novaPasta = false;
    this.form.reset();
  }

  addArquivoTable(idpai, nome, tamanho, descricao) {
    console.log('addArquivoTable');
    //if (!this.validacaoFormGroup.validaForm(this.form)) return;

    let novoArquivoTree: TreeNode = {
      data: {
        "name": "",
        "size": "",
        "descricao": "",
        "type": "File"
      },
      children: [],
      parent: null
    };

    novoArquivoTree.data.name = nome;
    novoArquivoTree.data.size = this.calculaTamanho(tamanho);
    novoArquivoTree.data.descricao = descricao;

    if (this.selectedFiles2)
      this.selectedFiles2.children.push(novoArquivoTree);
    else
      this.files2.push(novoArquivoTree);

    this.files2 = [...this.files2];
    this.ehArquivo = false;
    this.form.reset();
  }



  onBeforeUpload(event) {
    console.log('onBeforeUpload');
    event.formData.append('idPai', this.selectedFiles2.data.key);
    event.formData.append('descricao', this.form.controls.descricaoPasta.value);

    //console.log('fileUpload[0]: ' + fileUpload[0]);
    //console.log('arquivo this.form.controls.arquivo.value);
    //console.log('arquivo.value', this.form.controls.arquivo.value);
  }

   onUpload(event, fileUpload){
    this.ehUpload = false;
    this.mensagemService.showSuccessViaToast("Upload efetuado com sucesso.");

    //fileUpload.clear();

    for (let file of event.files) {
      this.addArquivoTable(this.selectedFiles2.data.key, file.name, file.size, '');
      //this.uploadedFiles.push(file);
    }
  }


  //AUX
  calculaTamanho(tamanhoBytes)
  {
      var sOut = "";
      var saida = 0;

      if ((tamanhoBytes / 1024) <= 1024)
      {
          saida = tamanhoBytes / 1024;
          sOut = `${Math.round(saida)}kb`;
      }
      else
      {
          saida = tamanhoBytes / 1024 / 1024;
          sOut = `${Math.round(saida)}mb`;
      }

      return sOut;
  }

}
