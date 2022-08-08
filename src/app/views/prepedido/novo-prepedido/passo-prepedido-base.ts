import { NovoPrepedidoDadosService } from './novo-prepedido-dados.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Output, EventEmitter } from '@angular/core';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { PrePedidoDto } from 'src/app/dto/prepedido/prepedido/DetalhesPrepedido/PrePedidoDto';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Constantes } from 'src/app/dto/prepedido/Constantes';
import { CpfCnpjUtils } from 'src/app/utilities/cpfCnpjUtils';

/*
classe que implementa a variável telaDesktop
usamos em diversos compoentes, mais fácil colocar em uma classe base
*/

export class PassoPrepedidoBase extends TelaDesktopBaseComponent {
    constructor(telaDesktopService: TelaDesktopService,
        public readonly router: Router,
        public readonly novoPrepedidoDadosService: NovoPrepedidoDadosService) {
        super(telaDesktopService);
    }

    //#region dados
    //dados sendo criados
    public criando = true;
    public prePedidoDto: PrePedidoDto;
    //#endregion

    verificarEmProcesso() {
        //pegamos o que está no serviço
        this.prePedidoDto = this.novoPrepedidoDadosService.prePedidoDto;
        if (!this.prePedidoDto) {
            this.router.navigate(["/novoprepedido"]);
            return;
        }
        this.criando = !this.prePedidoDto.NumeroPrePedido;
    }

    //#region formatação de dados para a tela

    moedaUtils: MoedaUtils = new MoedaUtils();

    cpfCnpj() {
        let ret = "CPF: ";
        if (this.prePedidoDto.DadosCliente.Tipo == new Constantes().ID_PJ) {
            ret = "CNPJ: ";
        }
        //fica melhor sem nada na frente:
        ret = "";
        return ret + CpfCnpjUtils.cnpj_cpf_formata(this.prePedidoDto.DadosCliente.Cnpj_Cpf);
    }    
}