
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Component, VERSION, OnInit,Input, ViewChild, ElementRef } from "@angular/core";
import { OrcamentosService } from 'src/app/views/orcamentos/orcamentos.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { Constantes } from 'src/app/utilities/constantes';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { OrcamentoOpcaoService } from 'src/app/service/orcamento-opcao/orcamento-opcao.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { MensageriaDto } from 'src/app/dto/mensageria/mensageria';


@Component({
  selector: 'app-aprovar-orcamento',
  templateUrl: './aprovar-orcamento.component.html',
  styleUrls: ['./aprovar-orcamento.component.scss']
})
export class AprovarOrcamentoComponent extends TelaDesktopBaseComponent implements OnInit {
    
  constructor(private readonly orcamentoService: OrcamentosService,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    telaDesktopService: TelaDesktopService,
    private readonly alertaService: AlertaService,
    private readonly orcamentoOpcaoService: OrcamentoOpcaoService,
    private readonly sweetalertService: SweetalertService,
    private readonly activedRoute: ActivatedRoute,
    private readonly mensagemService: MensagemService,
    private fb: FormBuilder,
    private location: Location) {
    super(telaDesktopService);
    }
    public form: FormGroup;
    dataUtils: DataUtils = new DataUtils();
    
    vendedor: boolean;
    tipoUsuario: string;

    @ViewChild("mensagem") mensagem: ElementRef;

    ngOnInit(): void {              

    this.activedRoute.params.subscribe(params => {
      this.desabiltarBotoes = params["aprovando"] == "false" ? true : false;
      console.log(this.desabiltarBotoes);
    });
      this.buscarOrcamento(1453);
      this.buscarOpcoesOrcamento(1453);
    }

  @Input() desabiltarBotoes: boolean;

  // opcoesOrcamento: OpcoesOrcamentoCotacaoDto = new OpcoesOrcamentoCotacaoDto();
  moedaUtils: MoedaUtils = new MoedaUtils();
  stringUtils = StringUtils;
  constantes: Constantes = new Constantes();
  opcaoPagto: number;

  buscarOrcamento(id: number) {
    this.novoOrcamentoService.criarNovo();
    this.orcamentoService.buscarOrcamento(id.toString()).toPromise().then(r => {
      if (r != null) {
          this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto = r;
      }
    });
    }

    formatarData(dateString) {
        if ('undefined' === typeof dateString || '' === dateString) {
            return null;
        }
         var parts = dateString.split('-');
        var hora = dateString.substr(11, 5);

         var year = parseInt(parts[0], 10);
         var month = parseInt(parts[1], 10);
         var day = parseInt(parts[2], 10);

         var dataFinal = day + "/" + month + "/" + year + " " + hora;

         return dataFinal;
    }

  buscarOpcoesOrcamento(id: number) {
    this.orcamentoOpcaoService.buscarOpcoesOrcamento(id.toString()).toPromise().then(r => {
      if (r != null) {
        this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto = r;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  activeState: boolean[] = [false, false, false];
  toggle(index: number) {
    if (this.activeState.toString().indexOf("true") == -1) return;

    for (let i = 0; i < this.activeState.length; i++) {
      if (i == index) this.activeState[i] = true;
      else this.activeState[i] = false;
    }
  }

  aprovar(orcamento) {
    if (!this.opcaoPagto) {
    }
    this.sweetalertService.confirmarAprovacao("Deseja aprovar essa opção?", "").subscribe(result => {
      console.log(result);

    });
  }

  voltar(){
      this.location.back();
  }

}
