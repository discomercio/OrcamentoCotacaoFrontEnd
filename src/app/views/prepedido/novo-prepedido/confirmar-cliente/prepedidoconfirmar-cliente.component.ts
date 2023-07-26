import { Component, OnInit, ElementRef, ViewChild, AfterContentInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import { NovoPrepedidoDadosService } from '../novo-prepedido-dados.service';
import { ConfirmarEnderecoComponent } from '../confirmar-endereco/confirmar-endereco.component';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { DadosClienteCadastroDto } from 'src/app/dto/prepedido/ClienteCadastro/DadosClienteCadastroDto';
import { ClienteCadastroDto } from 'src/app/dto/prepedido/ClienteCadastro/ClienteCadastroDto';
import { EnderecoEntregaDtoClienteCadastro } from 'src/app/dto/prepedido/ClienteCadastro/EnderecoEntregaDTOClienteCadastro';
import { EnderecoCadastralClientePrepedidoDto } from 'src/app/dto/prepedido/prepedido/EnderecoCadastralClientePrepedidoDto';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { BuscarClienteService } from 'src/app/service/prepedido/cliente/buscar-cliente.service';
import { Constantes } from 'src/app/dto/prepedido/Constantes';
import { ClienteCadastroUtils } from 'src/app/dto/prepedido/AngularClienteCadastroUtils/ClienteCadastroUtils';
import { ClienteCorpoComponent } from '../../cliente/cliente-corpo/cliente-corpo.component';
import { ValidacoesClienteUtils } from 'src/app/utilities/validacoesClienteUtils';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';


@Component({
  selector: 'app-prepedidoconfirmar-cliente',
  templateUrl: './prepedidoconfirmar-cliente.component.html',
  styleUrls: ['./prepedidoconfirmar-cliente.component.scss']
})
export class PrePedidoConfirmarClienteComponent extends TelaDesktopBaseComponent implements OnInit {
  constructor(private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    public telaDesktopService: TelaDesktopService,
    private readonly location: Location,
    public readonly dialog: MatDialog,
    private readonly alertaService: AlertaService,
    private readonly sweetalertService: SweetalertService,
    private readonly novoPrepedidoDadosService: NovoPrepedidoDadosService,
    private readonly buscarClienteService: BuscarClienteService) {
    super(telaDesktopService);
  }

  //dados
  dadosClienteCadastroDto = new DadosClienteCadastroDto();
  clienteCadastroDto = new ClienteCadastroDto();
  enderecoEntregaDtoClienteCadastro = new EnderecoEntregaDtoClienteCadastro();
  public endCadastralClientePrepedidoDto = new EnderecoCadastralClientePrepedidoDto();
  private dadosClienteCadastroDtoIe: string;
  private dadosClienteCadastroDtoProdutorRural: number;
  private dadosClienteCadastroDtoContribuinte_Icms_Status: number;
  public constantes = new Constantes();
  //precisa do static: false porque está dentro de um ngif
  @ViewChild("confirmarEndereco", { static: false }) confirmarEndereco: ConfirmarEnderecoComponent;
  //esta como undefined
  @ViewChild("clienteCorpo", { static: false }) clienteCorpo: ClienteCorpoComponent;
  //desabilita o botão para evitar duplo clique
  desabilita = false;
  //#region fase
  /*
  temos 2 fases: uma que confirma o cliente e a segunda que confirma o endereço de entrega
  na especificação original, é uma tela só no desktop e duas telas no celular
  talvez no desktop também fique em duas
  aqui controlamos a transição entre as telas
  */
  fase1 = true;
  fase2 = false;
  fase1e2juntas = false;
  //#endregion
  converteu_tel_endCadastralClientePrepedidoDto = false;

  ngOnInit() {
    this.telaDesktopService.carregando = true;
    this.verificarFase();

    this.endCadastralClientePrepedidoDto = new EnderecoCadastralClientePrepedidoDto();
    this.dadosClienteCadastroDto = null;
    if (this.router.getCurrentNavigation()) {
      let clienteCadastroDto: ClienteCadastroDto = (this.router.getCurrentNavigation().extras.state) as ClienteCadastroDto;
      if (clienteCadastroDto && clienteCadastroDto.DadosCliente) {
        this.dadosClienteCadastroDto = clienteCadastroDto.DadosCliente;
        this.verificarCriarNovoPrepedido();
        this.atualizarDadosEnderecoTela();
        return;
      }
    }

    //se chegar como null é pq foi salvo como link; não temos dados para mostrar
    if (!this.dadosClienteCadastroDto) {
      let promises = [this.buscarDadosCliente()];
      Promise.all(promises).then((r) => {
        this.setarDadosCliente(r[0]);
      }).catch((e) => {
        this.telaDesktopService.carregando = false;
        this.router.navigate(["/novoprepedido"]);
      }).finally(() => {
        this.telaDesktopService.carregando = false;
        this.verificarCriarNovoPrepedido();
        this.salvarAtivoInicializar();
        this.atualizarDadosEnderecoTela();
      });
    }
    else {
      //inicializamos
      this.salvarAtivoInicializar();
    }

    //para pegar o enter
    document.getElementById("idcontinuar").focus();
  }

  buscarDadosCliente(): Promise<ClienteCadastroDto> {
    const clienteBusca = this.activatedRoute.snapshot.params.cpfCnpj;
    return this.buscarClienteService.buscar(clienteBusca).toPromise();
  }

  setarDadosCliente(r: ClienteCadastroDto) {
    if (r === null) {
      this.router.navigate(["/novoprepedido"]);
      return;
    }

    if (this.novoPrepedidoDadosService.prePedidoDto != null)
      this.novoPrepedidoDadosService.prePedidoDto.DadosCliente = r.DadosCliente;
    this.dadosClienteCadastroDto = r.DadosCliente;
    this.clienteCadastroDto = r;

    this.endCadastralClientePrepedidoDto.Endereco_tipo_pessoa = this.dadosClienteCadastroDto.Tipo;
    this.endCadastralClientePrepedidoDto.Endereco_nome = this.dadosClienteCadastroDto.Tipo == this.constantes.ID_PF ?
      this.dadosClienteCadastroDto.Nome : "";
    this.endCadastralClientePrepedidoDto.Endereco_cnpj_cpf = this.dadosClienteCadastroDto.Cnpj_Cpf;
    this.endCadastralClientePrepedidoDto.Endereco_produtor_rural_status = this.dadosClienteCadastroDto.Tipo == this.constantes.ID_PF ?
      this.dadosClienteCadastroDto.ProdutorRural : 0;

    this.endCadastralClientePrepedidoDto.Endereco_contribuinte_icms_status =
      this.dadosClienteCadastroDto.Tipo == this.constantes.ID_PF ? this.dadosClienteCadastroDto.Contribuinte_Icms_Status : 0
    this.endCadastralClientePrepedidoDto.Endereco_ie = this.dadosClienteCadastroDto.Tipo == this.constantes.ID_PF ?
      this.dadosClienteCadastroDto.Ie : "";
  }

  atualizarDadosEnderecoTela() {
    if (this.confirmarEndereco) {
      this.telaDesktopService.carregando = true;
      this.confirmarEndereco.setarDadosEnderecoTela(this.enderecoEntregaDtoClienteCadastro);

      let promises = [this.confirmarEndereco.buscarCep(this.enderecoEntregaDtoClienteCadastro.EndEtg_cep)];
      Promise.all(promises).then((r) => {
        this.confirmarEndereco.setarDadosCep(r[0]);
      }).catch((e) => {
        this.telaDesktopService.carregando = false;
      }).finally(() => {
        this.telaDesktopService.carregando = false;
      });
    }
  }

  verificarFase() {
    this.fase1 = true;
    if (this.telaDesktop) {
      this.fase2 = true;
      this.fase1e2juntas = true;
    }
    else {
      if (this.novoPrepedidoDadosService.clicadoBotaoVoltarDaTelaItens) {
        this.fase1 = false;
        this.fase2 = true;
        this.novoPrepedidoDadosService.clicadoBotaoVoltarDaTelaItens = false;
        return;
      }
      this.fase2 = false;
      this.fase1e2juntas = false;
    }
  }

  verificarCriarNovoPrepedido() {
    if (!!this.novoPrepedidoDadosService.prePedidoDto) {
      let existente = this.novoPrepedidoDadosService.prePedidoDto.DadosCliente.Id;
      if (existente == this.dadosClienteCadastroDto.Id) {
        //nao criamos! usamos o que já está no serviço
        this.dadosClienteCadastroDto = this.novoPrepedidoDadosService.prePedidoDto.DadosCliente;
        //precisamos verificar se tem dado para não perder a seleção do this.enderecoEntregaDtoClienteCadastro.OutroEndereço
        if (this.novoPrepedidoDadosService.prePedidoDto.EnderecoEntrega.OutroEndereco)
          this.enderecoEntregaDtoClienteCadastro = this.novoPrepedidoDadosService.prePedidoDto.EnderecoEntrega;

        if (this.novoPrepedidoDadosService.prePedidoDto.EnderecoCadastroClientePrepedido.Endereco_cnpj_cpf)
          this.endCadastralClientePrepedidoDto = this.novoPrepedidoDadosService.prePedidoDto.EnderecoCadastroClientePrepedido;

        this.clienteCorpo.atualizarDadosEnderecoCadastralClienteTela(this.endCadastralClientePrepedidoDto);

        return;
      }
    }
    ///vamos criar um novo
    this.novoPrepedidoDadosService.criarNovo(this.dadosClienteCadastroDto, this.enderecoEntregaDtoClienteCadastro,
      this.endCadastralClientePrepedidoDto);
    //quando a tela é para celular o "this.confirmarEndereco" esta "undefined" e já da problema
    //comentei para teste
    // if (this.telaDesktop) {
    //   this.confirmarEndereco.atualizarDadosEnderecoTela(this.enderecoEntregaDtoClienteCadastro);
    //   //vamos atualizar o end cadastral
    // }
  }

  salvarAtivoInicializar() {
    this.dadosClienteCadastroDtoIe = this.dadosClienteCadastroDto.Ie;
    this.dadosClienteCadastroDtoProdutorRural = this.dadosClienteCadastroDto.ProdutorRural;
    this.dadosClienteCadastroDtoContribuinte_Icms_Status = this.dadosClienteCadastroDto.Contribuinte_Icms_Status;
  }

  salvarAtivo(): boolean {
    //diz se o botão de salvar está ligado
    if (!this.dadosClienteCadastroDto) {
      return false;
    }
    //se estiver com NULL é pq ainda não pegou os valores
    if (this.dadosClienteCadastroDtoIe == null) {
      return false;
    }
    if (this.dadosClienteCadastroDtoIe !== this.dadosClienteCadastroDto.Ie) {
      return true;
    }
    //vamos verificar se o cliente selecionou Produtor Rural, pois ele é obrigado a informar sim ou não
    /*
      Peguei um caso que o cliente não continha essa informação, e estava sendo permitido seguir na criação do prepedido,
      pois nesse momento estamos apenas verificando se o cliente teve alteração no cadastro dele, sendo assim, 
      iremos verificar se Produtor Rural é igual a "0"      
     */
    if (this.dadosClienteCadastroDtoProdutorRural !== this.dadosClienteCadastroDto.ProdutorRural ||
      this.dadosClienteCadastroDtoProdutorRural == 0 && this.dadosClienteCadastroDto.Tipo != this.constantes.ID_PJ) {
      return true;
    }
    if (this.dadosClienteCadastroDtoContribuinte_Icms_Status !== this.dadosClienteCadastroDto.Contribuinte_Icms_Status) {
      return true;
    }

    return false;
  }

  //vamos salvar as alterações
  salvar(continuar: boolean): void {
    //as validações  
    let mensagem = new ClienteCadastroUtils().validarInscricaoestadualIcms(this.dadosClienteCadastroDto);
    if (mensagem && mensagem.trim() !== "") {
      this.mostrarMensagem(mensagem);
      this.desabilita = false;
      return;
    }

    //estamos removendo os dados antes de salvar
    this.dadosClienteCadastroDto = new ClienteCadastroUtils().validarProdutorRural(this.dadosClienteCadastroDto);

    //tudo validado!
    this.buscarClienteService.atualizarCliente(this.dadosClienteCadastroDto).subscribe(
      {
        next: (r) => {
          //retorna uma lista de strings com erros
          if (r.length == 0) {
            this.salvarAtivoInicializar();
            if (continuar) {

              //já que os dados de cadastro do cliente foram alterados, vamos alterar de forma automática o cliente PF
              if (this.dadosClienteCadastroDto.Tipo == this.constantes.ID_PF) {
                this.endCadastralClientePrepedidoDto.Endereco_produtor_rural_status = this.dadosClienteCadastroDto.ProdutorRural;
                this.endCadastralClientePrepedidoDto.Endereco_contribuinte_icms_status = this.dadosClienteCadastroDto.Contribuinte_Icms_Status;
                this.endCadastralClientePrepedidoDto.Endereco_ie = this.dadosClienteCadastroDto.Ie;
              }

              //salvamento automático? então já clicamos no continuar
              this.continuarEfetivo();
              return;
            }

            this.mostrarMensagem(`Dados salvos com sucesso.`);
            this.desabilita = false;
            return;
          }

          //vamos mostrar os erros
          this.mostrarMensagem(`Ocorreu um erro ao salvar os dados. Mensagens de erro: ` + r.join(", "));
          this.desabilita = false;
        },
        error: (r) => {
          this.alertaService.mostrarErroInternet(r);
          this.desabilita = false;
        }
      }
    );
  }

  mostrarMensagem(msg: string): void {
    this.alertaService.mostrarMensagem(msg);
  }

  voltar() {
    //voltamos apra a fase anterior
    //fazer uma variavel para receber um valor para saber para onde voltar
    if (this.fase1e2juntas) {
      this.location.back();
      return;
    }
    if (this.fase1) {
      this.location.back();
      return;
    }

    //vltamos para a fase 1
    this.clienteCorpo.desconverterTelefonesEnderecoDadosCadastrais(this.endCadastralClientePrepedidoDto);
    this.converteu_tel_endCadastralClientePrepedidoDto = false;
    this.confirmarEndereco.prepararAvancar();
    this.fase1 = true;
    this.fase2 = false;
    this.confirmarEndereco.desconverterTelefonesEnderecoEntrega(this.enderecoEntregaDtoClienteCadastro);

  }

  continuar(): void {
    //desabilita o botão para evitar duplo clique
    this.desabilita = true;
    //primeiro, vamos ver o CEP que está dentro do cliente
    //somente se o confirmarEndereco estiver atribuído. Se não estiver, é porque não estamos na tela em que precisamos testar ele
    if (this.confirmarEndereco && !this.confirmarEndereco.podeAvancar()) {
      this.alertaService.mostrarMensagem("Aguarde o carregamento do endereço antes de continuar.");
      this.desabilita = false;
      return;
    }


    this.clienteCorpo.prepararAvancarEnderecoCadastralClientePrepedidoDto();

    //avisamos para o corpo do cliente que vamos avançar
    if (this.confirmarEndereco) {
      this.confirmarEndereco.prepararAvancar();
    }
    //salvamos automaticamente
    if (this.salvarAtivo()) {
      this.salvar(true);
      return;
    }

    this.continuarEfetivo();
  }


  continuarEfetivo(): void {

    let validacoes: string[] = new Array();


    if (!this.converteu_tel_endCadastralClientePrepedidoDto) {
      this.endCadastralClientePrepedidoDto = this.clienteCorpo.converterTelefones(this.endCadastralClientePrepedidoDto);
      this.converteu_tel_endCadastralClientePrepedidoDto = true;
    }
    validacoes = ValidacoesClienteUtils.validarEnderecoCadastralClientePrepedidoDto(this.endCadastralClientePrepedidoDto,
      this.clienteCorpo.componenteCepDadosCadastrais.lstCidadeIBGE);

    if (validacoes.length == 0) {
      if (this.dadosClienteCadastroDto.Tipo == this.constantes.ID_PF) {
        if (this.dadosClienteCadastroDto.Contribuinte_Icms_Status == this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_SIM) {
          if (this.dadosClienteCadastroDto.Ie != "") {
            if (this.dadosClienteCadastroDto.Uf.trim().toUpperCase() !=
              this.endCadastralClientePrepedidoDto.Endereco_uf.trim().toUpperCase()) {
              validacoes = validacoes.concat("Dados cadastrais: Inscrição estadual inválida pra esse estado (" + this.endCadastralClientePrepedidoDto.Endereco_uf.trim().toUpperCase() + "). " +
                "Caso o cliente esteja em outro estado, entre em contato com o suporte para alterar o cadastro do cliente.");
            }
          }
        }
      }
    }

    if (validacoes.length > 0) {
      this.sweetalertService.aviso("Campos inválidos. Preencha os campos marcados como obrigatórios. <br>Lista de erros: <br>" + validacoes.join("<br>"));
      this.clienteCorpo.desconverterTelefonesEnderecoDadosCadastrais(this.endCadastralClientePrepedidoDto);
      this.converteu_tel_endCadastralClientePrepedidoDto = false;
      this.clienteCorpo.componenteCepDadosCadastrais.required = true;
      this.desabilita = false;
      return;
    }

    //se estamos na fase 2, cotninua
    //caso contrário, volta para a fase 1
    if (this.fase2 || this.fase1e2juntas) {

      //estou removendo o código abaixo de dentro da condição de "OutroEndereco", pois mesmo que o outro endereço esteja como false
      //ele pode ter preenchido os dados
      if (!this.confirmarEndereco.converteu_tel_enderecoEntrega)
        this.enderecoEntregaDtoClienteCadastro = this.confirmarEndereco.converterTelefones(this.enderecoEntregaDtoClienteCadastro);
      if (this.enderecoEntregaDtoClienteCadastro.OutroEndereco) {
        validacoes = validacoes.concat(ValidacoesClienteUtils.validarEnderecoEntregaDtoClienteCadastro(this.enderecoEntregaDtoClienteCadastro,
          this.endCadastralClientePrepedidoDto, this.confirmarEndereco.componenteCep.lstCidadeIBGE));
      }

      //Apenas para consistir que a opção da entrega foi selecionada
      if (this.enderecoEntregaDtoClienteCadastro.OutroEndereco == undefined) {
        validacoes = validacoes.concat("Informe se o endereço de entrega será o mesmo endereço do cadastro ou não!");
      }

      if (validacoes.length > 0) {
        this.alertaService.mostrarMensagem("Campos inválidos. Preencha os campos marcados como obrigatórios. \nLista de erros: \n" + validacoes.join("\n"));

        if (this.fase2 || this.fase1e2juntas) {
          this.clienteCorpo.desconverterTelefonesEnderecoDadosCadastrais(this.endCadastralClientePrepedidoDto);
          this.converteu_tel_endCadastralClientePrepedidoDto = false;
        }
        this.confirmarEndereco.desconverterTelefonesEnderecoEntrega(this.enderecoEntregaDtoClienteCadastro);

        if (this.confirmarEndereco.enderecoEntregaDtoClienteCadastro.OutroEndereco) {
          this.confirmarEndereco.required = true;
          this.confirmarEndereco.componenteCep.required = true;
        }
        this.clienteCorpo.componenteCepDadosCadastrais.required = true;
        this.desabilita = false;
        return;
      }
      //salvar no serviço
      //afazer: incluir a passagem de EnderecoCadastralClientePrepedidoDto para salavar no serviço
      this.novoPrepedidoDadosService.setarDTosParciais(this.dadosClienteCadastroDto, this.enderecoEntregaDtoClienteCadastro,
        this.endCadastralClientePrepedidoDto);

      //continuamos
      this.router.navigate(['/novoprepedido/itens']);
      return;
    }
    this.fase2 = true;
    this.fase1 = false;
    this.desabilita = false;

  }
}

