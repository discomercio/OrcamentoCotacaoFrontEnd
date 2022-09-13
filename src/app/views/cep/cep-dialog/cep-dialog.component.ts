import { Component, OnInit } from '@angular/core';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { CepsService } from 'src/app/service/ceps/ceps.service';

@Component({
  selector: 'app-cep-dialog',
  templateUrl: './cep-dialog.component.html',
  styleUrls: ['./cep-dialog.component.scss']
})
export class CepDialogComponent implements OnInit {

  constructor(public readonly cepService: CepsService,
    private readonly alertaService: AlertaService) 
    { }


  lstUf: string[] = [];
  ngOnInit(): void {
    this.buscarUfs();
  }

  buscarUfs() {
    return this.cepService.BuscarUfs("publico").subscribe({
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
}
