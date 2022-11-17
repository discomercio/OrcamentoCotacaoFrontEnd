import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { Location, registerLocaleData } from '@angular/common';

import { MatSelect } from '@angular/material';
import { nextTick } from 'q';
import { HtmlAstPath } from '@angular/compiler';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { DadosClienteCadastroDto } from 'src/app/dto/prepedido/ClienteCadastro/DadosClienteCadastroDto';
import { ClienteCadastroDto } from 'src/app/dto/prepedido/ClienteCadastro/ClienteCadastroDto';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { Constantes } from 'src/app/dto/prepedido/Constantes';
import { ValidacoesClienteUtils } from 'src/app/utilities/validacoesClienteUtils';
import { FormatarTelefone } from 'src/app/utilities/formatarTelefone';
import { ClienteCorpoComponent } from '../../cliente/cliente-corpo/cliente-corpo.component';
import { BuscarClienteService } from 'src/app/service/prepedido/cliente/buscar-cliente.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';



@Component({
  selector: 'app-prepedidocadastrar-cliente',
  templateUrl: './prepedidocadastrar-cliente.component.html',
  styleUrls: ['./prepedidocadastrar-cliente.component.scss']
})
export class PrePedidoCadastrarClienteComponent extends TelaDesktopBaseComponent implements OnInit, AfterViewInit {

  @ViewChild("clienteCorpo", { static: true }) clienteCorpo: ClienteCorpoComponent;

  ngAfterViewInit(): void {
    var lista = document.querySelectorAll('form input, button');
    var mySelect2 = this.clienteCorpo;
    var chamaMetodo = this;

    for (let i = 0; i < lista.length; i++) {
      lista[i].addEventListener('keyup',
        function (e: KeyboardEvent) {
          if (e.which === 13) {
            if (mySelect2.ignorarProximoEnter) {
              mySelect2.ignorarProximoEnter = false;
              return;
            }

            let src: HTMLInputElement = e.srcElement as HTMLInputElement;

            if (src == document.getElementById("avancar")) {
              chamaMetodo.continuar();
            }

            for (let i2 = 0; i2 < lista.length; i2++) {
              if (lista[i2] === src && i2 + 1 < lista.length) {
                
                if (lista[i2] == document.getElementById("cep")) {
                  (lista[i2 + 2] as HTMLInputElement).focus();
                }
                else if (lista[i2] == document.getElementById("emailXml")) {
                  mySelect2.mySelectProdutor.focus();
                }
                else {
                  (lista[i2 + 1] as HTMLInputElement).focus();
                }
              }
            }
          }
        });
    }
  }

  //o dado sendo editado
  dadosClienteCadastroDto = new DadosClienteCadastroDto();
  clienteCadastroDto = new ClienteCadastroDto();

  //cosntrutor
  constructor(private readonly activatedRoute: ActivatedRoute,
    private readonly buscarClienteService: BuscarClienteService,
    private readonly router: Router,
    private readonly location: Location,
    private readonly alertaService: AlertaService,
    private readonly sweetalertService: SweetalertService,
    telaDesktopService: TelaDesktopService,
    private readonly autenticacaoService: AutenticacaoService) {
    super(telaDesktopService);
  }


  //carregamos os dados que passaram pelo Router
  //ou somente o número do CPF/CNPJ
  ngOnInit() {
    //lemos o único dado que é fixo
    const cpfCnpj = this.activatedRoute.snapshot.params.cpfCnpj;
    
    this.dadosClienteCadastroDto.Cnpj_Cpf = cpfCnpj;
    this.clienteCadastroDto.DadosCliente = this.dadosClienteCadastroDto;

    //inicializar como vazio
    this.dadosClienteCadastroDto.Nome = "";
    this.dadosClienteCadastroDto.Contato = "";

    //vamos verificar se o cliente já existe para que possamos redirecionar para a tela correta
    this.buscarClienteService.buscar(cpfCnpj).toPromise()
      .then((r) => {
        if (r === null) {
          return;
        }
        //cliente já existe
        this.router.navigate(['confirmar-cliente', StringUtils.retorna_so_digitos(cpfCnpj)],
        { relativeTo: this.activatedRoute, state: cpfCnpj });
      }).catch((r) => {
        //deu erro na busca
        //ou não achou nada...
        this.alertaService.mostrarErroInternet(r);
        return;
      });
  }

  verificarCliente(cpfCnpj: string): boolean {

    this.buscarClienteService.buscar(cpfCnpj).toPromise()
      .then((r) => {
        if (r === null) {
          return false;
        }
        //cliente já existe
      }).catch((r) => {
        //deu erro na busca
        //ou não achou nada...
        this.alertaService.mostrarErroInternet(r);
        return false;
      });

    return true;
  }

  ehPf() {
    if (this.dadosClienteCadastroDto.Cnpj_Cpf && StringUtils.retorna_so_digitos(this.dadosClienteCadastroDto.Cnpj_Cpf).length == 11) {
      return true;
    }
    return false;
  }
  voltar() {
    this.location.back();
  }


  //desabilita o botão para evitar duplo clique
  desabilita = false;

  continuar() {

    this.desabilita = true;
    //primeiro, vamos ver o CEP que está dentro do cliente
    if (!this.clienteCorpo.podeAvancar()) {
      this.alertaService.mostrarMensagem("Aguarde o carregamento do endereço antes de continuar.");
      this.desabilita = false;
      return;
    }
    //avisamos para o corpo do cliente que vamos avançar
    this.clienteCorpo.prepararAvancar();


    let constantes = new Constantes();
    if (this.ehPf()) {
      this.dadosClienteCadastroDto.Tipo = constantes.ID_PF;
    }
    else {
      this.dadosClienteCadastroDto.Tipo = constantes.ID_PJ;
    }

    this.converterTelefones();
    if (this.clienteCorpo.cadastrando)
      this.clienteCorpo.componenteCep.required = true;

    let validacoes: string[] = ValidacoesClienteUtils.ValidarDadosClienteCadastroDto(this.dadosClienteCadastroDto,
      this.clienteCadastroDto, this.ehPf(), this.clienteCorpo.componenteCep.lstCidadeIBGE);
    //mostrar as mensagens
    if (validacoes.length > 0) {
      this.desconverterTelefones();
      this.sweetalertService.aviso("Campos inválidos. Preencha os campos marcados como obrigatórios. <br>Lista de erros: <br>" + validacoes.join("<br>"));
      this.desabilita = false;
      return;
    }

    //passar a loja 
    this.clienteCadastroDto.DadosCliente.Loja = this.autenticacaoService._lojaLogado;

    //salvar e ir para a tela de confirmação de cliente


    this.carregando = true;
    this.buscarClienteService.cadastrarCliente(this.clienteCadastroDto).toPromise()
      .then((r) => {
        this.carregando = false;
        if (r === null) {
          this.desconverterTelefones();
          this.alertaService.mostrarErroInternet(r);
          return;
        }
        //se tem algum erro, mostra os erros
        if (r.length > 0) {
          this.desconverterTelefones();
          this.alertaService.mostrarMensagem("Erros ao salvar. \nLista de erros: \n" + r.join("\n"));
          this.desabilita = false;
          return;
        }
        //agora podemos continuar
        this.router.navigate(['/novoprepedido/confirmar-cliente', StringUtils.retorna_so_digitos(this.clienteCadastroDto.DadosCliente.Cnpj_Cpf)], { state: r })
      }).catch((r) => {
        //deu erro na busca
        //ou não achou nada...
        this.desconverterTelefones();
        this.carregando = false;
        this.alertaService.mostrarErroInternet(r);
        this.desabilita = false;
      });
  }

  carregando = false;

  converterTelefones() {
    /*
converter telefone do formato da edição (separar os DDDs)
TelefoneResidencial
Celular
TelComercial
TelComercial2
*/

    {
      let s = FormatarTelefone.SepararTelefone(this.dadosClienteCadastroDto.TelefoneResidencial);
      this.dadosClienteCadastroDto.TelefoneResidencial = s.Telefone;
      this.dadosClienteCadastroDto.DddResidencial = s.Ddd;

      s = FormatarTelefone.SepararTelefone(this.dadosClienteCadastroDto.Celular);
      this.dadosClienteCadastroDto.Celular = s.Telefone;
      this.dadosClienteCadastroDto.DddCelular = s.Ddd;

      s = FormatarTelefone.SepararTelefone(this.dadosClienteCadastroDto.TelComercial);
      this.dadosClienteCadastroDto.TelComercial = s.Telefone;
      this.dadosClienteCadastroDto.DddComercial = s.Ddd;

      s = FormatarTelefone.SepararTelefone(this.dadosClienteCadastroDto.TelComercial2);
      this.dadosClienteCadastroDto.TelComercial2 = s.Telefone;
      this.dadosClienteCadastroDto.DddComercial2 = s.Ddd;
    }

    //converter referências bancárias
    for (let i = 0; i < this.clienteCadastroDto.RefBancaria.length; i++) {
      let este = this.clienteCadastroDto.RefBancaria[i];
      let s = FormatarTelefone.SepararTelefone(este.Telefone);
      este.Telefone = s.Telefone;
      este.Ddd = s.Ddd;
    }

    //converter referências comerciais
    for (let i = 0; i < this.clienteCadastroDto.RefComercial.length; i++) {
      let este = this.clienteCadastroDto.RefComercial[i];
      let s = FormatarTelefone.SepararTelefone(este.Telefone);
      este.Telefone = s.Telefone;
      este.Ddd = s.Ddd;
    }


  }


  desconverterTelefones() {
    {
      this.dadosClienteCadastroDto.TelefoneResidencial = this.dadosClienteCadastroDto.DddResidencial + this.dadosClienteCadastroDto.TelefoneResidencial;

      this.dadosClienteCadastroDto.Celular = this.dadosClienteCadastroDto.DddCelular + this.dadosClienteCadastroDto.Celular;

      this.dadosClienteCadastroDto.TelComercial = this.dadosClienteCadastroDto.DddComercial + this.dadosClienteCadastroDto.TelComercial;

      this.dadosClienteCadastroDto.TelComercial2 = this.dadosClienteCadastroDto.DddComercial2 + this.dadosClienteCadastroDto.TelComercial2;
    }

    //converter referências bancárias
    for (let i = 0; i < this.clienteCadastroDto.RefBancaria.length; i++) {
      let este = this.clienteCadastroDto.RefBancaria[i];
      este.Telefone = este.Ddd + este.Telefone;
    }

    //converter referências comerciais
    for (let i = 0; i < this.clienteCadastroDto.RefComercial.length; i++) {
      let este = this.clienteCadastroDto.RefComercial[i];
      este.Telefone = este.Ddd + este.Telefone;
    }

  }










}



