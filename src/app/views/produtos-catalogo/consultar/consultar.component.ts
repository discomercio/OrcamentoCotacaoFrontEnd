import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { ProdutoAtivoDto } from 'src/app/dto/produtos-catalogo/ProdutoAtivoDto';
import { ProdutoCatalogo } from 'src/app/dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { DropDownItem } from '../../orcamentos/models/DropDownItem';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';

@Component({
  selector: 'app-consultar',
  templateUrl: './consultar.component.html',
  styleUrls: ['./consultar.component.scss']
})
export class ProdutosCatalogoConsultarComponent implements OnInit {

  constructor(
    private readonly produtoService: ProdutoCatalogoService,
    private readonly alertaService: AlertaService,
    private readonly router: Router,
    private fb: FormBuilder,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly sweetAlertService: SweetalertService) { }

  @ViewChild('dataTable') table: Table;
  public form: FormGroup;
  listaProdutoDto: ProdutoCatalogo[];
  registros: ProdutoAtivoDto[];
  registrosFiltrados: ProdutoAtivoDto[];
  cols: any[];
  carregando: boolean = false;
  stringUtils = StringUtils;

  cboCalculadoraVRF: Array<DropDownItem> = [];
  cboTipoUnidade: Array<DropDownItem> = [];
  cboDescargaCondensadora: Array<DropDownItem> = [];
  cboVoltagem: Array<DropDownItem> = [];
  cboCapacidadeBTU: Array<DropDownItem> = [];
  cboCiclo: Array<DropDownItem> = [];
  cboLinhaProduto: Array<DropDownItem> = [];

  ngOnInit(): void {

    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoConsultar)) {
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
      return;
    }

    this.criarForm();
    this.buscarRegistros();
  }

  criarForm() {
    this.form = this.fb.group({
      CalculadoraVRF: [''],
      TipoUnidade: [''],
      DescargaCondensadora: [''],
      Voltagem: [''],
      CapacidadeBTU: [''],
      Ciclo: [''],
      LinhaProduto: ['']
    });
  }

  buscarRegistros() {
    this.produtoService.buscarProdutosAtivosLista().toPromise().then((r) => {
      if (r != null) {
        this.registros = r;
        this.registrosFiltrados = r;
        this.carregando = false;

        this.popularCombos();
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  popularCombos() {
    this.cboCalculadoraVRF = [];
    this.registros.forEach(x => {
      if (!this.cboCalculadoraVRF.find(f => f.Value == x.calculadoraVRF)) {
        if (x.calculadoraVRF) {
          this.cboCalculadoraVRF.push({ Id: x.calculadoraVRF, Value: x.calculadoraVRF });
        }
      }
    });

    this.cboTipoUnidade = [];
    this.registros.forEach(x => {
      if (!this.cboTipoUnidade.find(f => f.Value == x.tipoUnidade)) {
        if (x.tipoUnidade) {
          this.cboTipoUnidade.push({ Id: x.tipoUnidade, Value: x.tipoUnidade });
        }
      }
    });

    this.cboDescargaCondensadora = [];
    this.registros.forEach(x => {
      if (!this.cboDescargaCondensadora.find(f => f.Value == x.descargaCondensadora)) {
        if (x.descargaCondensadora) {
          this.cboDescargaCondensadora.push({ Id: x.descargaCondensadora, Value: x.descargaCondensadora });
        }
      }
    });

    this.cboVoltagem = [];
    this.registros.forEach(x => {
      if (!this.cboVoltagem.find(f => f.Value == x.voltagem)) {
        if (x.voltagem) {
          this.cboVoltagem.push({ Id: x.voltagem, Value: x.voltagem });
        }
      }
    });

    this.cboCapacidadeBTU = [];
    this.registros.forEach(x => {
      if (!this.cboCapacidadeBTU.find(f => f.Value == x.capacidadeBTU)) {
        if (x.capacidadeBTU) {
          this.cboCapacidadeBTU.push({ Id: x.capacidadeBTU, Value: x.capacidadeBTU });
        }
      }
    });

    this.cboCiclo = [];
    this.registros.forEach(x => {
      if (!this.cboCiclo.find(f => f.Value == x.ciclo)) {
        if (x.ciclo) {
          this.cboCiclo.push({ Id: x.ciclo, Value: x.ciclo });
        }
      }
    });

    this.cboLinhaProduto = [];
    this.registros.forEach(x => {
      if (!this.cboLinhaProduto.find(f => f.Value == x.linhaProduto)) {
        if (x.linhaProduto) {
          this.cboLinhaProduto.push({ Id: x.linhaProduto, Value: x.linhaProduto });
        }
      }
    });

  }

  FiltrarRegistros() {
    let vlCalculadoraVRF = this.form.controls.CalculadoraVRF.value;
    let vlTipoUnidade = this.form.controls.TipoUnidade.value;
    let vlDescargaCondensadora = this.form.controls.DescargaCondensadora.value;
    let vlVoltagem = this.form.controls.Voltagem.value;
    let vlCapacidadeBTU = this.form.controls.CapacidadeBTU.value;
    let vlCiclo = this.form.controls.Ciclo.value;
    let vlLinhaProduto = this.form.controls.LinhaProduto.value;

    this.registrosFiltrados = this.registros;

    if (vlCalculadoraVRF) { this.registrosFiltrados = this.registros.filter(x => x.calculadoraVRF == vlCalculadoraVRF); };
    if (vlTipoUnidade) { this.registrosFiltrados = this.registrosFiltrados.filter(x => x.tipoUnidade == vlTipoUnidade); }
    if (vlDescargaCondensadora) { this.registrosFiltrados = this.registrosFiltrados.filter(x => x.descargaCondensadora == vlDescargaCondensadora); }
    if (vlVoltagem) { this.registrosFiltrados = this.registrosFiltrados.filter(x => x.voltagem == vlVoltagem); }
    if (vlCapacidadeBTU) { this.registrosFiltrados = this.registrosFiltrados.filter(x => x.capacidadeBTU == vlCapacidadeBTU); }
    if (vlCiclo) { this.registrosFiltrados = this.registrosFiltrados.filter(x => x.ciclo == vlCiclo); }
    if (vlLinhaProduto) { this.registrosFiltrados = this.registrosFiltrados.filter(x => x.linhaProduto == vlLinhaProduto); }
  }

  visualizarClick(id: number) {
    this.router.navigate(["/produtos-catalogo/visualizar", id]);
  }

}


