import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { FormatarEndereco } from 'src/app/utilities/formatarString/formata-endereco';
import { Constantes } from 'src/app/utilities/constantes';
import { PrepedidoService } from 'src/app/service/prepedido/orcamento/prepedido.service';
import { PrePedidoDto } from 'src/app/dto/prepedido/prepedido/DetalhesPrepedido/PrePedidoDto';
import { PermissaoService } from 'src/app/service/permissao/permissao.service';
import { PermissaoPrePedidoResponse } from 'src/app/dto/permissao/PermissaoPrePedidoResponse';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';

@Component({
  selector: 'app-prepedido-detalhes',
  templateUrl: './prepedido-detalhes.component.html',
  styleUrls: ['./prepedido-detalhes.component.scss']
})
export class PrepedidoDetalhesComponent extends TelaDesktopBaseComponent implements OnInit {
  constructor(private readonly activatedRoute: ActivatedRoute,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly prepedidoService: PrepedidoService,
    private readonly alertaService: AlertaService,
    private router: Router,
    private location: Location,
    private readonly permissaoService: PermissaoService,
    private readonly sweetalertService: SweetalertService,
    telaDesktopService: TelaDesktopService
  ) { super(telaDesktopService) }

  numeroPrepedido = "";
  prepedido: PrePedidoDto;
  stringUtils = new StringUtils();
  moedaUtils: MoedaUtils = new MoedaUtils();
  dataUtils: DataUtils = new DataUtils();
  formatarTelefone: FormataTelefone = new FormataTelefone();
  formatarEndereco: FormatarEndereco = new FormatarEndereco();
  constantes: Constantes = new Constantes();
  public enderecoEntregaFormatado: string;
  public qtdeLinhaEndereco: number;
  permissaoPrePedidoResponse: PermissaoPrePedidoResponse;
  carregando: boolean;

  ngOnInit() {
    this.carregando = true;
    this.numeroPrepedido = this.activatedRoute.snapshot.params.numeroPrepedido;

    const promises: any = [this.buscarPermissao(this.numeroPrepedido), this.buscarPrepedido(this.numeroPrepedido)];

    Promise.all(promises).then((r: any) => {
      this.verificarPermissaoPrepedido(r[0]);
      this.setarPrepedido(r[1]);
    }).catch((e) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(e);
      return;
    }).finally(() => {
      this.carregando = false;
    });
  }

  buscarPermissao(numeroPrepedido: string): Promise<PermissaoPrePedidoResponse> {
    return this.permissaoService.buscarPermissaoPrePedido(numeroPrepedido).toPromise();
  }

  buscarPrepedido(numeroPrepedido: string): Promise<PrePedidoDto> {
    return this.prepedidoService.carregar(numeroPrepedido).toPromise();
  }

  verificarPermissaoPrepedido(r: PermissaoPrePedidoResponse) {
    this.permissaoPrePedidoResponse = r;

    if (!this.permissaoPrePedidoResponse.Sucesso) {
      this.sweetalertService.aviso(this.permissaoPrePedidoResponse.Mensagem);
      this.router.navigate(['orcamentos/listar/pendentes']);
      return;
    }

    if (!this.permissaoPrePedidoResponse.VisualizarPrePedido) {
      this.sweetalertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      this.router.navigate(['orcamentos/listar/pendentes']);
      return;
    }
  }

  setarPrepedido(r: PrePedidoDto) {
    if (r != null) {
      this.prepedido = r;
      if (this.prepedido.EnderecoEntrega.OutroEndereco) {
        this.montarEnderecoEntrega(this.prepedido.EnderecoEntrega);
      }
    }
  }

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

  voltar() {
    this.router.navigate(["orcamentos/listar/pendentes/"]);
  }

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

  consultarCliente() {
    let cliente = StringUtils.retorna_so_digitos(this.prepedido.DadosCliente.Cnpj_Cpf);
    this.router.navigate(["/prepedido/cliente/cliente", cliente]);
  }
}
