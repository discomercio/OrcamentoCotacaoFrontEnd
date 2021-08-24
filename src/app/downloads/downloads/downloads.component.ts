import { Component, OnInit } from '@angular/core';
import { DownloadsService } from 'src/app/service/downloads/downloads.service';
import { TreeNode } from 'primeng/api/treenode';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.component.html',
  styleUrls: ['./downloads.component.scss']
})
export class DownloadsComponent implements OnInit {

  constructor(private readonly downloadsService: DownloadsService,
    private readonly router: Router,
    public readonly activatedRoute: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.novaPasta = false;

    this.downloadsService.buscar().then(files => this.files1 = files);
    this.downloadsService.buscarToTree().then(files => this.files2 = files);
    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'size', header: 'Size' },
      { field: 'descricao', header: 'Descrição' }
    ];
  }


  files1: TreeNode[];
  selectedFiles1: TreeNode;

  files2: TreeNode[];
  selectedFiles2: TreeNode;
  cols: any[];

  public novaPasta: boolean;
  public ehArquivo: boolean = false;

  public criarPasta() {
    if (!!this.selectedFiles1) {
      if (this.novaPasta) {
        this.novaPasta = false;
        return;
      }
      this.upload();
      this.novaPasta = true;
    }
    else {
      this.novaPasta = false;
      console.log("falta mostrar uma mensagem");
    }
  }

  public controlaBotoes() {
    debugger;
    if (!!this.selectedFiles1) {
      if (this.selectedFiles1.label.indexOf(".") > -1) {
        this.ehArquivo = true;
        this.novaPasta = false;
      }
      else {
        this.ehArquivo = false;

      }
    }
  }


  criarPastaTable() {
    if (!!this.selectedFiles2) {
      if (this.novaPasta) {
        this.novaPasta = false;
        return;
      }
      this.novaPasta = true;
    }
    else {
      this.novaPasta = false;
      console.log("falta mostrar uma mensagem");
    }

  }

  addPastaTable() {
    debugger;
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
    if (!nome.value) return;
    novaPastaTree.data.name = nome.value;
    novaPastaTree.data.size = "0kb";
    novaPastaTree.data.descricao = descricao.value;
    this.selectedFiles2.children.push(novaPastaTree);

    this.files2 = [...this.files2];
    this.novaPasta = false;
  }

  uploadedFiles: any[] = [];
  public ehUpload: boolean = false;
  upload() {
    this.criarPasta();
    if (this.ehUpload) {
      this.ehUpload = false;
      return;
    }
    this.ehUpload = true;
  }
}
