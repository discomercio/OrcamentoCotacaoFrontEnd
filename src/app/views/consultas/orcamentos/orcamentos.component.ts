import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LazyLoadEvent } from 'primeng/api';
import { ConsultaGerencialOrcamentoRequest } from 'src/app/dto/orcamentos/consulta-gerencial-orcamento-request';
import { ConsultaGerencialOrcamentoResponse } from 'src/app/dto/orcamentos/consulta-gerencial-orcamento-response';
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { DropDownItem } from '../../orcamentos/models/DropDownItem';

@Component({
  selector: 'app-orcamentos',
  templateUrl: './orcamentos.component.html',
  styleUrls: ['./orcamentos.component.scss']
})
export class OrcamentosComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private readonly usuarioService: UsuariosService,
    private readonly orcamentoService: OrcamentosService,
    private readonly sweetAlertService: SweetalertService,
    public readonly cdr: ChangeDetectorRef) { }

  @Input() listaNome = "";

  form: FormGroup;
  nomeLista: string;
  consultaOrcamentoGerencialResponse = new Array<ConsultaGerencialOrcamentoResponse>();
  consultaOrcamentoGerencialResquest: ConsultaGerencialOrcamentoRequest = new ConsultaGerencialOrcamentoRequest();
  first: number = 0;
  qtdeRegistros: number;
  carregando: boolean = true;
  qtdePorPaginaInicial: number = 10;
  dataUtils: DataUtils = new DataUtils();
  mostrarQtdePorPagina:boolean = false;
  //Combos
  cboVendedores: Array<DropDownItem> = [];
  cboLojas: Array<DropDownItem> = [];
  cboComParceiros: Array<DropDownItem> = [];
  cboParceiros: Array<DropDownItem> = [];
  cboVendedoresParceiros: Array<DropDownItem> = [];
  cboFabricantes: Array<DropDownItem> = [];
  cboGrupos: Array<DropDownItem> = [];

  ngOnInit(): void {

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
    //busca de vendedores por loja
    this.usuarioService.buscarVendedores("").toPromise().then((r) => {

    });


    this.usuarioService.buscarTodosUsuarios().toPromise().then((r) => {
      if (r != null) {

      }
    });
  }

  buscarLista(filtro: ConsultaGerencialOrcamentoRequest) {
    this.carregando = true;
    this.orcamentoService.consultaGerencial(filtro).toPromise().then((r) => {
      if (!r.Sucesso) {
        this.sweetAlertService.aviso(r.Mensagem);
        this.carregando = false;
        return;
      }
      this.consultaOrcamentoGerencialResponse = r.lstConsultaGerencialOrcamentoResponse;
      this.qtdeRegistros = r.qtdeRegistros;
      this.carregando = false;
      this.mostrarQtdePorPagina = true;
    }).catch((e) => {
      this.sweetAlertService.aviso(e.error.Mensagem);
      this.carregando = false;
    });

  }

  buscarRegistros(event: LazyLoadEvent) {
    if (this.consultaOrcamentoGerencialResponse.length > 0) {
      this.consultaOrcamentoGerencialResquest.pagina = event.first / event.rows;
      this.consultaOrcamentoGerencialResquest.qtdeItensPagina = event.rows;
      this.buscarLista(this.consultaOrcamentoGerencialResquest);
    }
  }
}
