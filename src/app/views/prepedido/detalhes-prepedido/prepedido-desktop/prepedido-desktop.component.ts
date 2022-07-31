import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DetalhesPrepedidoComponent } from '../detalhes-prepedido.component';

import { NovoPrepedidoDadosService } from '../../novo-prepedido/novo-prepedido-dados.service';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { FormatarEndereco } from 'src/app/utilities/formatarEndereco';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { PrepedidoBuscarService } from 'src/app/service/prepedido/prepedido-buscar.service';
import { ImpressaoService } from 'src/app/utilities/impressao.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { ClienteCadastroUtils } from 'src/app/dto/prepedido/AngularClienteCadastroUtils/ClienteCadastroUtils';
import { Constantes } from 'src/app/dto/prepedido/Constantes';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { EnderecoEntregaDtoClienteCadastro } from 'src/app/dto/prepedido/ClienteCadastro/EnderecoEntregaDTOClienteCadastro';
import { EnderecoCadastralClientePrepedidoDto } from 'src/app/dto/prepedido/prepedido/EnderecoCadastralClientePrepedidoDto';


@Component({
  selector: 'app-prepedido-desktop',
  templateUrl: './prepedido-desktop.component.html',
  styleUrls: ['./prepedido-desktop.component.scss']
})
export class PrepedidoDesktopComponent extends TelaDesktopBaseComponent implements OnInit {
  formatarEndereco: FormatarEndereco = new FormatarEndereco();

  constructor(
    telaDesktopService: TelaDesktopService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    public readonly prepedidoBuscarService: PrepedidoBuscarService,
    public readonly detalhesPrepedido: DetalhesPrepedidoComponent,
    public readonly impressaoService: ImpressaoService,
    private readonly novoPrepedidoDadosService: NovoPrepedidoDadosService
  ) { super(telaDesktopService) }

  moedaUtils = new MoedaUtils();
  public prepedidoDto = this.detalhesPrepedido.prepedido;
  clienteCadastroUtils = new ClienteCadastroUtils();
  constantes = new Constantes();
  stringUtils = StringUtils;

  ngOnInit() {
    //this.prepedidoDto esta chegando null se for muito rápido
    this.montarEnderecoEntrega(this.prepedidoDto.EnderecoEntrega);

  }

  public enderecoEntregaFormatado: string;
  public qtdeLinhaEndereco: number;
  montarEnderecoEntrega(enderecoEntregaDto: EnderecoEntregaDtoClienteCadastro): void {
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
        if (this.prepedidoDto.DadosCliente.Tipo == this.constantes.ID_PF) {
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

  //para dizer se é PF ou PJ
  ehPf(): boolean {
    if (this.prepedidoDto && this.prepedidoDto.DadosCliente && this.prepedidoDto.DadosCliente.Tipo)
      return this.prepedidoDto.DadosCliente.Tipo == this.constantes.ID_PF;
    //sem dados! qualquer opção serve...  
    return true;
  }

  async imprimir(): Promise<void> {
    //versão para impressão somente com o pedido
    // this.router.navigate(['/prepedido/imprimir', this.prepedidoDto.NumeroPrePedido]);
    await this.prepedidoDto;
    this.impressaoService.forcarImpressao = true;
    setTimeout(() => {

      window.print();
      this.impressaoService.forcarImpressao = false;
    }
      , 1);
  }

  formata_endereco(): string {
    const p = this.prepedidoDto ? this.prepedidoDto.DadosCliente : null;
    if (!p)
      return "Sem endereço";
    return this.clienteCadastroUtils.formata_endereco(p);
  }

  telefone1(): string {
    const p = this.prepedidoDto ? this.prepedidoDto.DadosCliente : null;
    if (!p)
      return "";
    return this.clienteCadastroUtils.telefone1(p);
  }
  telefone2(): string {
    const p = this.prepedidoDto ? this.prepedidoDto.DadosCliente : null;
    if (!p)
      return "";
    return this.clienteCadastroUtils.telefone2(p);
  }
  telefoneCelular(): string {
    const p = this.prepedidoDto ? this.prepedidoDto.DadosCliente : null;
    if (!p)
      return "";
    return this.clienteCadastroUtils.telefoneCelular(p);
  }

  //status da entrega imediata
  entregaImediata(): string {
    if (!this.prepedidoDto || !this.prepedidoDto.DetalhesPrepedido)
      return "";
    return this.prepedidoDto.DetalhesPrepedido.EntregaImediata;
  }


  editar() {
    this.prepedidoDto.EnderecoCadastroClientePrepedido = new EnderecoCadastralClientePrepedidoDto();
    this.prepedidoDto.EnderecoEntrega = new EnderecoEntregaDtoClienteCadastro();
    this.novoPrepedidoDadosService.criarNovo(this.prepedidoDto.DadosCliente,
      this.prepedidoDto.EnderecoEntrega, this.prepedidoDto.EnderecoCadastroClientePrepedido);

    this.router.navigate(['/novoprepedido/confirmar-cliente',
      this.stringUtils.retorna_so_digitos(this.prepedidoDto.DadosCliente.Cnpj_Cpf)]);
  }

  verificaValor() {
    if (this.prepedidoDto.TotalFamiliaParcelaRA >= 0)
      return true
    else
      return false;
  }
}
