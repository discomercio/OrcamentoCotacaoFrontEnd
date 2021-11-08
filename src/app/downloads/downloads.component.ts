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
    public alert: AlertaService) {

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
      { field: 'name', header: 'Name' },
      { field: 'size', header: 'Size' },
      { field: 'descricao', header: 'Descrição' }
    ];
  }

  public controlaBotoes() {
    if (!!this.selectedFiles2) {
      if (this.selectedFiles2.data.name.indexOf(".") > -1) {
        this.ehArquivo = true;
        this.novaPasta = false;
      }
      else this.ehArquivo = false;
    }
  }

  criarPastaTable() {
    if (this.novaPasta) {
      this.novaPasta = false;
      return;
    }
    this.novaPasta = true;
    if (this.ehUpload) this.upload();
  }

  addPastaTable() {
    if (!this.validacaoFormGroup.validaForm(this.form)) return;

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
    novaPastaTree.data.size = "0kb";
    novaPastaTree.data.descricao = this.form.controls.descricaoPasta.value;

    if (this.selectedFiles2)
      this.selectedFiles2.children.push(novaPastaTree);
    else
      this.files2.push(novaPastaTree);

    this.files2 = [...this.files2];
    this.novaPasta = false;
    this.form.reset();
  }

  public ehUpload: boolean = false;
  upload() {
    if (this.ehUpload) {
      this.ehUpload = false;
      return;
    }
    this.ehUpload = true;
    if (this.novaPasta)
      this.criarPastaTable();
  }

  download() {
    if (!!this.selectedFiles2) {
      this.downloadsService.download().subscribe((response: any) => {
        let blob: any = new Blob([response], { type: 'text/json; charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        fileSaver.saveAs(blob, this.selectedFiles2.data.name + ".json");
        this.mensagemService.showSuccessViaToast("Download efetuado com sucesso");
      }), (error: any) => this.mensagemService.showErrorViaToast("Erro ao fazer o download.");
      return;
    }

    this.mensagemService.showWarnViaToast("Selecione um arquivo.");
  }

  onUpload(event) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.mensagemService.showSuccessViaToast("Upload efetuado com sucesso.");

    this.downloadsService.enviar('').toPromise().then(r => {
      if (r == null) {
        // erro
      }
    });
  }
}
