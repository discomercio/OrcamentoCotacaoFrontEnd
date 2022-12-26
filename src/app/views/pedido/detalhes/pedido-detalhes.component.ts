import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { PedidoService } from 'src/app/service/pedido/pedido.service';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { FormatarEndereco } from 'src/app/utilities/formatarString/formata-endereco';
import { Constantes } from 'src/app/utilities/constantes';
import { PermissaoService } from 'src/app/service/permissao/permissao.service';
import { PermissaoPedidoResponse } from 'src/app/dto/permissao/PermissaoPedidoResponse';

@Component({
  selector: 'app-pedido-detalhes',
  templateUrl: './pedido-detalhes.component.html',
  styleUrls: ['./pedido-detalhes.component.scss']
})
export class PedidoDetalhesComponent implements OnInit {
  constructor(private readonly activatedRoute: ActivatedRoute,
    public readonly pedidoService: PedidoService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly alertaService: AlertaService,
    private location: Location,
    private router: Router,
    private readonly permissaoService: PermissaoService
  ) { }


  dataFormatarTela = DataUtils.formatarTela;

  numeroPedido = "";
  pedido: any = null;
  stringUtils = new StringUtils();
  moedaUtils: MoedaUtils = new MoedaUtils();
  dataUtils: DataUtils = new DataUtils();
  formatarTelefone: FormataTelefone = new FormataTelefone();
  formatarEndereco: FormatarEndereco = new FormatarEndereco();
  constantes: Constantes = new Constantes();
  public enderecoEntregaFormatado: string;
  public qtdeLinhaEndereco: number;
  permissaoPedidoResponse: PermissaoPedidoResponse;

  montarEnderecoEntrega(enderecoEntregaDto: any) {

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
      }
      // else {
      //   if (this.pedido.DadosCliente.Tipo == this.constantes.ID_PF) {
      //     this.enderecoEntregaFormatado = sEndereco + "\n" + enderecoEntregaDto.EndEtg_descricao_justificativa;
      //     return;
      //   }
      // }

      //memorização ativa, colocamos os campos adicionais
      if (enderecoEntregaDto.EndEtg_tipo_pessoa == this.constantes.ID_PF) {
        this.enderecoEntregaFormatado = this.formatarEndereco.montarEnderecoEntregaPF(this.pedido.EnderecoEntrega, sEndereco);

        split = this.enderecoEntregaFormatado.split('\n');
        this.qtdeLinhaEndereco = split.length;
        return;
      }
      //se chegar aqui é PJ
      this.enderecoEntregaFormatado = this.formatarEndereco.montarEnderecoEntregaPJ(this.pedido.EnderecoEntrega, sEndereco);
      split = this.enderecoEntregaFormatado.split('\n');
      this.qtdeLinhaEndereco = split.length;
    }
  }

  carregar() {
    if (this.numeroPedido) {
      this.pedidoService.carregar(this.numeroPedido).toPromise().then((r) => {
        if (r != null) {
          this.pedido = r;
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
    if (this.pedido && this.pedido.DadosCliente && this.pedido.DadosCliente.Tipo)
      return this.pedido.DadosCliente.Tipo == 'PF';
    //sem dados! qualquer opção serve...  
    return true;
  }

  somenteDigito(msg: string): string {
    return msg.replace(/\D/g, "");
  }

  //status da entrega imediata
  entregaImediata(): string {
    if (!this.pedido || !this.pedido.DetalhesNF)
      return "";

    return this.pedido.DetalhesNF.EntregaImediata;
  }

  ngOnInit() {

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    this.numeroPedido = this.activatedRoute.snapshot.params.numeroPedido;

    this.permissaoService.buscarPermissaoPedido(this.numeroPedido).toPromise().then(response => {

      this.permissaoPedidoResponse = response;

      if (!this.permissaoPedidoResponse.Sucesso) {
        this.alertaService.mostrarMensagem(this.permissaoPedidoResponse.Mensagem);
        this.router.navigate(['orcamentos/listar/pedidos']);
        return;
      }

      if (!this.permissaoPedidoResponse.VisualizarPedido) {
        this.alertaService.mostrarMensagem("Não encontramos a permissão necessária para acessar essa funcionalidade!");
        this.router.navigate(['orcamentos/listar/pedidos']);
        return;
      }

      if (this.permissaoPedidoResponse.PrePedidoVirouPedido) {
        this.numeroPedido = this.permissaoPedidoResponse.IdPedido;
      }

      this.carregar();

      if (this.pedido != null) {
        setTimeout(() => {
          this.montarEnderecoEntrega(this.pedido.EnderecoEntrega);
        }, 7000);
      }

    }).catch((response) => this.alertaService.mostrarErroInternet(response));
  }

  consultarCliente() {
    let cliente = StringUtils.retorna_so_digitos(this.pedido.DadosCliente.Cnpj_Cpf);
    this.router.navigate(["/prepedido/cliente/cliente", cliente]);
  }
}
