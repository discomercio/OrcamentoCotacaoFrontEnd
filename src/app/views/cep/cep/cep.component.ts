import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { CepDto } from 'src/app/dto/ceps/CepDto';
import { CepsService } from 'src/app/service/ceps/ceps.service';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { CepDialogComponent } from '../cep-dialog/cep-dialog.component';

@Component({
  selector: 'app-cep',
  templateUrl: './cep.component.html',
  styleUrls: ['./cep.component.scss']
})
export class CepComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(telaDesktopService: TelaDesktopService,
    public readonly cepService: CepsService,
    private readonly alertaService: AlertaService,
    private readonly dialogService: DialogService) {
    super(telaDesktopService);
  }

  carregando: boolean;

  lstCidadeIBGE: string[];
  Endereco: string;
  Numero: string;
  Complemento: string;
  Bairro: string;
  Cidade: string;
  Uf: string;
  Cep: string;

  temCidade: boolean;
  temUf: boolean;
  cep_retorno: string;

  mascaraCep: string;
  ngOnInit(): void {
    this.mascaraCep = StringUtils.mascaraCep();
  }

  saiuCep() {

    //se vazio, não damos nenhuma mensagem
    if (this.Cep == "" || this.Cep == 'undefined') {
      //nao avisamos
      this.Endereco = "";
      this.Numero = "";
      this.Complemento = "";
      this.Bairro = "";
      this.Cidade = "";
      this.Uf = "";
      this.cep_retorno = "";
      return false;
    }

    if (this.cep_retorno != undefined) {
      if (StringUtils.retorna_so_digitos(this.cep_retorno) == StringUtils.retorna_so_digitos(this.Cep)) {
        return;
      }
    }
    if (this.Cep != undefined && this.Cep != "") {
      // this.zerarCamposEndEntrega();
      //vamos fazer a busca
      this.carregando = true;

      this.cepService.buscarCep(this.Cep, null, null, null, "publico").toPromise()
        .then((r) => {
          this.carregando = false;

          if (!r || r.length !== 1) {
            this.cep_retorno = "";
            // this.mostrarCepNaoEncontrado();
            return;
          }
          const end = r[0];

          this.cep_retorno = this.Cep;
          if (!!end.Bairro) {
            this.Bairro = end.Bairro;
          }
          if (!!end.Cidade) {
            if (!!end.ListaCidadeIBGE && end.ListaCidadeIBGE.length > 0) {
              this.temCidade = false;
              debugger;
              this.lstCidadeIBGE = end.ListaCidadeIBGE;
            }
            else {
              this.Cidade = end.Cidade;
              this.temCidade = true;
            }

          }
          if (!!end.Endereco) {
            this.Endereco = end.Endereco;
          }
          if (!!end.Uf) {
            this.Uf = end.Uf;
            this.temUf = true;
          }

        }).catch((r) => {
          //deu erro na busca
          //ou não achou nada...

          this.carregando = false;
          this.alertaService.mostrarErroInternet(r);
        });
    }
  }

  public zerarCamposEndEntrega(): void {
    this.Cidade = "";
    this.Endereco = "";
    this.Bairro = "";
    this.Uf = "";
    this.Complemento = "";
    this.Numero = "";

    this.temCidade = false;
    this.temUf = false;
  }

  buscarCep() {

    this.zerarCamposEndEntrega();

    let options: any = {
      autoFocus: false,
      width: "60em",
      //não colocamos aqui para que ele ajuste melhor: height:"85vh",
      data: { origem: "publico" }
    };
    if (!this.telaDesktop) {
      //opções para celular
      options = {
        autoFocus: false,
        width: "100vw", //para celular, precisamos da largura toda
        maxWidth: "100vw",
        //não colocamos aqui para que ele ajuste melhor: height:"85vh",
        data: { origem: "publico" }
      };
    }
    const ref = this.dialogService.open(CepDialogComponent,
      options);

    ref.onClose.subscribe((resultado: CepDto) => {
      debugger;
      if (resultado) {
        let end: CepDto = resultado;

        if (!!end.Uf) {
          this.Uf = end.Uf;
          this.temUf = true;
        }
        if (!!end.Cidade) {
          if (!!end.ListaCidadeIBGE && end.ListaCidadeIBGE.length > 0) {
            this.temCidade = false;
            this.lstCidadeIBGE = end.ListaCidadeIBGE;
          }
          else {
            this.Cidade = end.Cidade;
            this.temCidade = true;
          }

        }
        if (!!end.Bairro) {
          this.Bairro = end.Bairro;
        }
        if (!!end.Endereco) {
          this.Endereco = end.Endereco;
        }

        this.Cep = end.Cep;
        this.cep_retorno = end.Cep;
      }
    });
  }
}
