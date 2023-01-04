import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { DropDownItem } from '../../orcamentos/models/DropDownItem';

@Component({
  selector: 'app-orcamentos',
  templateUrl: './orcamentos.component.html',
  styleUrls: ['./orcamentos.component.scss']
})
export class OrcamentosComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private readonly usuarioService: UsuariosService) { }

  @Input() listaNome = "";

  form: FormGroup;
  nomeLista: string;

  //Combos
  cboVendedores: Array<DropDownItem> = [];
  cboLojas: Array<DropDownItem> = [];
  cboComParceiros: Array<DropDownItem> = [];
  cboParceiros: Array<DropDownItem> = [];
  cboVendedoresParceiros: Array<DropDownItem> = [];
  cboFabricantes: Array<DropDownItem> = [];
  cboGrupos: Array<DropDownItem> = [];

  ngOnInit(): void {
    debugger;
    if (this.listaNome == "vigentes") this.nomeLista = "Vigentes";
    if (this.listaNome == "cadastrados") this.nomeLista = "Cadastrados";
    if (this.listaNome == "pendentes") this.nomeLista = "com Mensagens Pendentes";
    if (this.listaNome == "expirados") this.nomeLista = "Expirados";
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

  buscarTodosVendedores() {
    this.usuarioService.buscarTodosUsuarios().toPromise().then((r) => {
      if (r != null) {

      }
    });
  }
}
