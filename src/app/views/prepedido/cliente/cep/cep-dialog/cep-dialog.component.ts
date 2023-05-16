import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs';
import { strictEqual } from 'assert';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { FormatarEndereco } from 'src/app/utilities/formatarEndereco';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { CepsService } from 'src/app/service/ceps/ceps.service';
import { CepDto } from 'src/app/dto/ceps/CepDto';

@Component({
  selector: 'app-cep-dialog',
  templateUrl: './cep-dialog.component.html',
  styleUrls: ['./cep-dialog.component.scss']
})
export class CepDialogComponent extends TelaDesktopBaseComponent implements OnInit {

  formatarEndereco: FormatarEndereco = new FormatarEndereco();
  carregando: boolean = false;
  // optionsCepLocalidades$ : Observable<string[]>;

  constructor(
    public readonly cepService: CepsService,
    public readonly dialogRef: MatDialogRef<CepDialogComponent>,
    telaDesktopService: TelaDesktopService,
    public readonly alertaService: AlertaService) {
    super(telaDesktopService);
  }

  ngOnInit() {
    this.buscarUfs();
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onOkClick(): void {
    this.dialogRef.close(true);
  }

  //campos que o usuario escolhe
  public endereco: string = "";
  public localidade: string = "";
  public uf: string = "";
  public lstUf: string[] = [];
  public lstEnderecos: CepDto[] = [];
  public endereco_selecionado: string;

  //buscar lista de estados
  buscarUfs() {
    return this.cepService.BuscarUfs().subscribe({
      next: (r: string[]) => {
        if (!!r) {
          this.lstUf = r;
        }
        else {
          this.alertaService.mostrarMensagem("Erro ao carregar a lista de Estados!")
        }
      },
      error: (r: string) => this.alertaService.mostrarErroInternet(r)
    });
  }

  public lstCidades: string[] = [];

  buscarLocalidades(): void {
    
    this.lstEnderecos = [];
    this.lstCidades = new Array();
    if (!this.uf) {
      this.alertaService.mostrarMensagem("Favor selecionar um Estado!");
    }
    else {
      this.carregando = true;
      this.cepService.BuscarLocalidades(this.uf).subscribe({
        next: (r: string[]) => {
          if (!!r) {
            this.carregando = false;
            this.lstCidades = r;
            this.localidade = "";
            this.endereco = "";
          }
          else {
            this.alertaService.mostrarMensagem("Erro ao carregar a lista de Cidades!")
          }
        },
        error: (r: string) => {
          this.carregando = false;
          this.alertaService.mostrarErroInternet(r);
        }
      });
    }
  }

  public endNaoEncontrado: string = "";

  buscarCepPorEndereco() {

    //fazer a limpeza dos campos antes de realizar uma nova busca
    this.lstEnderecos = [];


    // if (!this.endereco && !this.localidade) {
    //   this.alertaService.mostrarMensagem("Favor digitar o endereco ou a localidade!");
    // }
    if (!this.uf) {
      this.alertaService.mostrarMensagem("Favor selecionar um Estado!");
    }
    else if (this.uf && !this.localidade) {
      this.alertaService.mostrarMensagem("Favor digitar uma localidade!");
    }
    else {

      this.carregando = true;
      for (let i = 0; i < this.lstCidades.length; i++) {
        if (this.localidade == this.lstCidades[i]) {
          return this.cepService.buscarCepPorEndereco(this.endereco, this.localidade, this.uf).subscribe({
            next: (r: CepDto[]) => {
              this.carregando = false;
              if (!!r) {
                if (r.length > 0) {
                  this.lstEnderecos = r;
                  this.endNaoEncontrado = "";
                }
                else
                  this.endNaoEncontrado = "Nenhum endereço encontrado";
              }
              else {
                this.alertaService.mostrarMensagem("Erro ao carregar a lista de Endereços!")
              }
            },
            error: (r: CepDto[]) => {
              this.carregando = false;
              this.alertaService.mostrarErroInternet(r);
            }
          });
        }
      }
      if (this.carregando) {
        this.carregando = false;
        this.alertaService.mostrarMensagem("Favor selecionar uma Localidade na lista!");
      }

      //limpar campos

    }
  }

  filtrarPorUf(uf: string) {
    if (!uf) {
      this.alertaService.mostrarMensagem("Necessário selecionar um estado!")
    }
    else {
      let lst = this.lstEnderecos.filter((estado) => {
        return estado.Uf === uf;
      });
    }
  }


  mascaraCep() {
    return [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/];
  }
}
