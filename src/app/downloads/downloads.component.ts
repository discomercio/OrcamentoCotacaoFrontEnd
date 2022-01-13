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
    private readonly alertaService: AlertaService) {

  }

  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public uploadedFiles: any[] = [];
  public files2: TreeNode[];
  public selectedFiles2: TreeNode;
  public cols: any[];
  public novaPasta: boolean;
  public ehArquivo: boolean = false;

  ngOnInit(): void {

    this.form = this.fb.group({
      pasta: ['', [Validators.required]],
      descricaoPasta: ['', [Validators.required]]
    });

    this.novaPasta = false;

    this.downloadsService.buscarToTree().then(files => this.files2 = files);
    
    this.cols = [
      { field: 'name', header: 'Nome' },
      { field: 'size', header: 'Tamanho' },
      { field: 'descricao', header: 'Descrição' },
      { field: 'key', header: 'Id' }
    ];
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

  public ehUpload: boolean = false;
  upload() {
    console.log('upload');
    if(!!this.selectedFiles2 == false){
      this.mensagemService.showWarnViaToast("Selecione uma pasta!");
      return;
    }

    //console.log(this.selectedFiles2.data.name + ` - ` + this.selectedFiles2.data.key);

    if (this.ehUpload) {
      this.ehUpload = false;
      return;
    }
    this.ehUpload = true;
    if (this.novaPasta)
      this.criarPastaTable();

    this.addArquivoTable('19dec002-0ed1-428e-9e65-2217863a5992', 'arquivo.pdf', '100kb', 'Manual em PDF');
  }

  criarPastaTable() {
    console.log('criarPastaTable');

    if(!!this.selectedFiles2 == false){
      this.mensagemService.showWarnViaToast("Selecione uma pasta!");
      return;
    }

    if (this.novaPasta) {
      this.novaPasta = false;
      return;
    }
    this.novaPasta = true;
    if (this.ehUpload) this.upload();
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
    if (!this.validacaoFormGroup.validaForm(this.form)) return;

    let novoArquivoTree: TreeNode = {
      data: {
        "name": "",
        "size": "",
        "descricao": "",
        "type": "File"
      },
      children: [],
      parent: idpai
    };

    novoArquivoTree.data.name = nome;
    novoArquivoTree.data.size = tamanho;
    novoArquivoTree.data.descricao = descricao;
    
    if (this.selectedFiles2)
      this.selectedFiles2.children.push(novoArquivoTree);
    else
      this.files2.push(novoArquivoTree);

    this.files2 = [...this.files2];
    this.novaPasta = false;
    this.form.reset();
  }

  download() {
    console.log('download:' + this.selectedFiles2.data.key);
    if (!!this.selectedFiles2) {
      this.downloadsService.download(this.selectedFiles2.data.key).subscribe((response: any) => {
        let blob: any = new Blob([response], { type: 'application/pdf; charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        fileSaver.saveAs(blob, this.selectedFiles2.data.name);
        this.mensagemService.showSuccessViaToast("Download efetuado com sucesso");
      }), (error: any) => this.mensagemService.showErrorViaToast("Erro ao fazer o download.");
      return;
    }

    this.mensagemService.showWarnViaToast("Selecione um arquivo.");
  }

  onUpload(event) {
    console.log('onUpload');
    console.log('descricaoPasta: ' + this.form.controls.descricaoPasta.value);
    event.formData.append('idPai', this.selectedFiles2.data.key);
    event.formData.append('descricao', this.form.controls.descricaoPasta.value);

    this.addArquivoTable(this.selectedFiles2.data.key, 'arquivo.pdf', '100kb', 'Manual em PDF');

    // for (let file of event.files) {
    //   this.uploadedFiles.push(file);
    // }
    
    this.mensagemService.showSuccessViaToast("Upload efetuado com sucesso.");

    // this.downloadsService.enviar('arquivo.pdf').toPromise().then(r => {
    //   if (r == null) {
    //     // erro
    //   }
    // }).catch((r)=> this.alertaService.mostrarErroInternet(r));
  }
}
