import { AfterViewInit, Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import { ProdutoTabela } from 'src/app/dto/produtos-catalogo/ProdutoTabela';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';

@Component({
  selector: 'app-pdf-calculadora-vrf',
  templateUrl: './pdf-calculadora-vrf.component.html',
  styleUrls: ['./pdf-calculadora-vrf.component.scss']
})
export class PdfCalculadoraVrfComponent implements OnInit, AfterViewInit {

  constructor() { }

  nomeCliente: string = "Gabriel Prada Teodoro";
  nomeObra: string = "Casa do cliente";
  telefone: string = "11981603313";
  email: string = "gabriel.teodoro@itssolucoes.com.br";
  observacao: string = "Apenas para teste";

  evaporadorasSelecionadas = new Array<ProdutoTabela>();
  combinacaoCom3aparelhos: ProdutoTabela[] = [];
  simultaneidadeCalculada3aparelhos: number;
  combinacaoCom2aparelhos: ProdutoTabela[] = [];
  simultaneidadeCalculada2aparelhos: number;
  combinacaoCom1aparelhos: ProdutoTabela[] = [];
  simultaneidadeCalculada1aparelho: number;
  calculado: boolean = false;
  stringUtils = StringUtils;
  moedaUtils = new MoedaUtils();

  ngOnInit(): void {
  }

  ngAfterViewInit() {
  }
  export() {
    let doc = new jsPDF('l', 'pt', 'a4');
    let pdf = document.getElementById("pdf");
    // doc.internal.scaleFactor = 0.8; NÃO FICA LEGAL
    doc.html(pdf, {
      html2canvas:{letterRendering:true, backgroundColor:"#00000"},
      callback: (doc) => {
        
        doc.output('dataurlnewwindow');
      }
    });

  }

  somarTotalCondensadoras(lstCondensadora: ProdutoTabela[]) {
    return lstCondensadora
      .reduce((sum, current) => sum + (Number.parseFloat(current.kcal) * current.qtde), 0);
  }
}
