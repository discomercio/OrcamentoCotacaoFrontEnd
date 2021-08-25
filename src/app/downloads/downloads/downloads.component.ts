import { Component, OnInit } from '@angular/core';
import { DownloadsService } from 'src/app/service/downloads/downloads.service';
import { TreeNode } from 'primeng/api/treenode';
import { Router, ActivatedRoute } from '@angular/router';
import * as fileSaver from 'file-saver';
import { MensagemComponent } from 'src/app/utilities/mensagem/mensagem.component';


@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.component.html',
  styleUrls: ['./downloads.component.scss']
})
export class DownloadsComponent implements OnInit {

  constructor(private readonly downloadsService: DownloadsService,
    private readonly router: Router,
    public readonly activatedRoute: ActivatedRoute,
    private mensagem:MensagemComponent) {

  }

  ngOnInit(): void {
    this.novaPasta = false;

    this.downloadsService.buscarToTree().then(files => this.files2 = files);
    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'size', header: 'Size' },
      { field: 'descricao', header: 'Descrição' }
    ];
  }

  files2: TreeNode[];
  selectedFiles2: TreeNode;
  cols: any[];

  public novaPasta: boolean;
  public ehArquivo: boolean = false;

  public controlaBotoes() {
    if (!!this.selectedFiles2) {
      if (this.selectedFiles2.data.name.indexOf(".") > -1) {
        this.ehArquivo = true;
        this.novaPasta = false;
      }
      else {
        this.ehArquivo = false;

      }
    }
  }

  criarPastaTable() {
    if (this.novaPasta) {
      this.novaPasta = false;
      return;
    }
    this.novaPasta = true;
    if (this.ehUpload)
      this.upload();
  }

  addPastaTable() {
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

    let nome: HTMLInputElement = document.getElementById("pastaTable") as HTMLInputElement;
    let descricao: HTMLInputElement = document.getElementById("descricaoTable") as HTMLInputElement;
    if (!nome.value) {
      this.mensagem.showErrorViaToast();
      return;
    }
    novaPastaTree.data.name = nome.value;
    novaPastaTree.data.size = "0kb";
    novaPastaTree.data.descricao = descricao.value;
    if (this.selectedFiles2)
      this.selectedFiles2.children.push(novaPastaTree);
    else
      this.files2.push(novaPastaTree);

    this.files2 = [...this.files2];
    this.novaPasta = false;
  }

  uploadedFiles: any[] = [];
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
      }), (error: any) => console.log('Erro ao baixar o arquivo!');
      return;
    }

    console.log("Selecione um arquivo!");
  }

  onUpload(event) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    console.log("Salvo com sucesso!");
  }
}
