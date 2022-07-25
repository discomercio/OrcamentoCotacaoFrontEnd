import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { PrepedidoService } from 'src/app/service/prepedido/prepedido.service';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { FormatarEndereco } from 'src/app/utilities/formatarString/formata-endereco';
import { Constantes } from 'src/app/utilities/constantes';

@Component({
  selector: 'app-prepedido-detalhes',
  templateUrl: './prepedido-detalhes.component.html',
  styleUrls: ['./prepedido-detalhes.component.scss']
})
export class PrepedidoDetalhesComponent implements OnInit {
  constructor(private readonly activatedRoute: ActivatedRoute,
    public readonly prepedidoService: PrepedidoService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly alertaService: AlertaService,
    private location: Location
  ) { }

  numeroPrepedido = "";
  prepedido: any = null;
  stringUtils = new StringUtils();  
  moedaUtils: MoedaUtils = new MoedaUtils();  
  dataUtils: DataUtils = new DataUtils();  
  formatarTelefone: FormataTelefone = new FormataTelefone();
  formatarEndereco: FormatarEndereco = new FormatarEndereco();
  constantes: Constantes = new Constantes();
  public enderecoEntregaFormatado: string;
  public qtdeLinhaEndereco: number;

  montarEnderecoEntrega(enderecoEntregaDto: any): void {  
    
    if (enderecoEntregaDto.OutroEndereco) {
      let retorno: string = "";
      let sEndereco: string;
      let split: string[];
      //vamos formatar conforme é feito no asp
      sEndereco = this.formatarEndereco.formata_endereco(enderecoEntregaDto.EndEtg_endereco,
        enderecoEntregaDto.EndEtg_endereco_numero, enderecoEntregaDto.EndEtg_endereco_complemento,
        enderecoEntregaDto.EndEtg_bairro, enderecoEntregaDto.EndEtg_cidade, enderecoEntregaDto.EndEtg_uf,
        enderecoEntregaDto.EndEtg_cep);

      //vamos verificar se esta ativo a memorização de endereço completa
      //se a memorização não estiver ativa ou o registro foi criado no formato antigo, paramos por aqui

      if (enderecoEntregaDto.St_memorizacao_completa_enderecos == 0) {
        this.enderecoEntregaFormatado = sEndereco + "\n" + enderecoEntregaDto.EndEtg_descricao_justificativa;
        return;
        // return;
      }
      else {
        
        let emails: string = "";
        if (this.prepedido.DadosCliente.Tipo == this.constantes.ID_PF) {
          if ((!!enderecoEntregaDto.EndEtg_email) ||
            (!!enderecoEntregaDto.EndEtg_email_xml))
            emails = "\n";

          if (!!enderecoEntregaDto.EndEtg_email && enderecoEntregaDto.EndEtg_email != "")
            emails += "E-mail: " + enderecoEntregaDto.EndEtg_email + " ";

          if (!!enderecoEntregaDto.EndEtg_email_xml && enderecoEntregaDto.EndEtg_email_xml != "")
            emails += "E-mail (XML): " + enderecoEntregaDto.EndEtg_email_xml;
          
          this.enderecoEntregaFormatado = sEndereco + emails + "\n" + enderecoEntregaDto.EndEtg_descricao_justificativa;

          split = this.enderecoEntregaFormatado.split('\n');
          this.qtdeLinhaEndereco = split.length;
          return;
        }
      }

      //memorização ativa, colocamos os campos adicionais
      if (enderecoEntregaDto.EndEtg_tipo_pessoa == this.constantes.ID_PF) {
        this.enderecoEntregaFormatado = this.formatarEndereco.montarEnderecoEntregaPF(enderecoEntregaDto, sEndereco);

        split = this.enderecoEntregaFormatado.split('\n');
        this.qtdeLinhaEndereco = split.length;
        return;
      }
      //se chegar aqui é PJ
      this.enderecoEntregaFormatado = this.formatarEndereco.montarEnderecoEntregaPJ(enderecoEntregaDto, sEndereco);
      split = this.enderecoEntregaFormatado.split('\n');
      this.qtdeLinhaEndereco = split.length;
    }

    return;
  }  

  carregar() {
    
    if (this.numeroPrepedido) {
      this.prepedidoService.carregar(this.numeroPrepedido).toPromise().then((r) => {
        if (r != null) {
          this.prepedido = r;
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
    }
  }

  voltar() {
    this.location.back();
  } 

  editar() {
    //
  } 

  //para dizer se é PF ou PJ
  ehPf(): boolean {
    if (this.prepedido && this.prepedido.DadosCliente && this.prepedido.DadosCliente.Tipo)
      return this.prepedido.DadosCliente.Tipo == 'PF';
    //sem dados! qualquer opção serve...  
    return true;
  }
  
  verificaValor() {
    if (this.prepedido.TotalFamiliaParcelaRA >= 0)
      return true
    else
      return false;
  }  

  ngOnInit() {
    this.numeroPrepedido = this.activatedRoute.snapshot.params.numeroPrepedido;
    this.carregar();        
    setTimeout(() => {
      this.montarEnderecoEntrega(this.prepedido.EnderecoEntrega);
    }, 5000);    
        
  }  

}
