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

  constructor(private fb: FormBuilder,
    private readonly usuarioService: UsuariosService) { }

  form: FormGroup;

  //Combos
  cboVendedores: Array<DropDownItem> = [];
  cboLojas: Array<DropDownItem> = [];
  cboComParceiros: Array<DropDownItem> = [];
  cboParceiros: Array<DropDownItem> = [];
  cboVendedoresParceiros: Array<DropDownItem> = [];
  cboFabricantes: Array<DropDownItem> = [];
  cboGrupos: Array<DropDownItem> = [];

  ngOnInit(): void {
    this.criarForm();
    this.buscarTodosVendedores();
  }

  criarForm() {
    this.form = this.fb.group({
      vendedor: [],
      loja: [],
      comParceiro: [],
      parceiro: [],
      vendedorParceiro: [],
      fabricante: [],
      grupo: [],
      dtCriacaoInicio: [],
      dtCriacaoFim: []
    });
  }

  buscarTodosVendedores(){
    this.usuarioService.buscarTodosUsuarios().toPromise().then((r) =>{
      if(r!=null){
        
      }
    });
  }
}
