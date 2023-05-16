import { Component, Inject, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { CepDto } from 'src/app/dto/ceps/CepDto';
import { CepsService } from 'src/app/service/ceps/ceps.service';
import { FormatarEndereco } from 'src/app/utilities/formatarEndereco';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';

@Component({
  selector: 'app-cep-dialog',
  templateUrl: './cep-dialog.component.html',
  styleUrls: ['./cep-dialog.component.scss']
})
export class CepDialogComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(public readonly cepService: CepsService,
    private readonly alertaService: AlertaService,
    telaDesktopService: TelaDesktopService,
    @Inject(DynamicDialogConfig) public option: DynamicDialogConfig,
    public ref: DynamicDialogRef,) {
    super(telaDesktopService);
  }

  formatarEndereco: FormatarEndereco = new FormatarEndereco();
  lstUfs: SelectItem[] = [];
  uf: string;
  lstCidades: SelectItem[] = [];
  lstFiltradaCidades: SelectItem[] = [];
  cidade: SelectItem;
  lstEnderecos: CepDto[] = [];
  endereco: any;
  carregando: boolean;
  origem: string;
  paginacao:number = 0;
  enderecoSelecionado:string;

  ngOnInit(): void {
    this.origem = this.option.data.origem;
    this.carregando = true;
    this.buscarUfs();
  }

  buscarUfs() {
    return this.cepService.BuscarUfs(this.origem).subscribe({
      next: (r: string[]) => {
        if (!!r) {
          this.lstUfs = this.montarLista(r);
          this.carregando = false;
        }
        else {
          this.carregando = false;
          this.alertaService.mostrarMensagem("Erro ao carregar a lista de Estados!")
        }
      },
      error: (r: string) => {
        this.carregando = false;
        this.alertaService.mostrarErroInternet(r)
      }
    });
  }

  montarLista(lst: any[]) {
    let retorno: SelectItem[] = [];
    retorno.unshift({ value: "Selecione" });

    lst.forEach(x => {
      retorno.push({ value: x })
    });

    return retorno;
  }

  filtrarCidades(event) {
    //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
    let filtered: any[] = [];
    let query = event.query;

    for (let i = 0; i < this.lstCidades.length; i++) {
      let country = this.lstCidades[i];
      if (country.value.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(country);
      }
    }

    this.lstFiltradaCidades = filtered;
  }

  buscarCidades(): void {

    this.lstEnderecos = [];
    this.lstCidades = [];
    if (!this.uf) {
      this.alertaService.mostrarMensagem("Favor selecionar um Estado!");
    }
    else {
      this.carregando = true;
      this.cepService.BuscarLocalidades(this.uf, this.origem).subscribe({
        next: (r: string[]) => {
          if (!!r) {
            this.carregando = false;
            this.lstCidades = this.montarLista(r);
            this.cidade = { value: "" };
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
  buscarCepPorEndereco() {

    this.lstEnderecos = [];
    
    if (!this.endereco && this.cidade && !this.cidade.value) {
      this.alertaService.mostrarMensagem("Favor digitar o endereco ou a localidade!");
      return;
    }
    if (!this.uf) {
      this.alertaService.mostrarMensagem("Favor selecionar um Estado!");
      return;
    }
    if (this.uf && !this.cidade.value) {
      this.alertaService.mostrarMensagem("Favor digitar uma localidade!");
      return;
    }

    this.carregando = true;

    let achou = this.lstCidades.filter(x => x.value == this.cidade.value);

    if (achou.length > 0) {
      this.cepService.buscarCepPorEndereco(this.endereco, this.cidade.value, this.uf, this.origem).toPromise().then((r) => {
        if (!!r) {
          if (r.length > 0) {
            this.lstEnderecos = r;
          }
        }
        this.carregando = false;
      }).catch((e) => {
        this.carregando = false;
        this.alertaService.mostrarErroInternet(e);
      });
    }

    this.paginacao = 0;
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
  addEndereco() {
    if (this.enderecoSelecionado != null) {
      this.ref.close(this.enderecoSelecionado);
    }
    return;
  }

  marcarLinha(e: Event) {
    debugger;
  }
}
