import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { DropDownItem } from '../../orcamentos/models/DropDownItem';

@Component({
  selector: 'app-orcamentos-vigentes',
  templateUrl: './orcamentos-vigentes.component.html',
  styleUrls: ['./orcamentos-vigentes.component.scss']
})
export class OrcamentosVigentesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
}
