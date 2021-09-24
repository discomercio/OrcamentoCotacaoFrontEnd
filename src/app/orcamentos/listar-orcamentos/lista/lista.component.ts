import { Component, OnInit, ViewChild, DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api/selectitem';
import { ListaDto } from 'src/app/dto/orcamentos/lista-dto';
import { OrcamentosService } from 'src/app/service/orcamentos/orcamentos.service';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { isDate } from 'util';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { PedidosService } from 'src/app/service/pedidos/pedidos.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ListaComponent implements OnInit {

  constructor(private readonly activatedRoute: ActivatedRoute,
    public readonly orcamentoService: OrcamentosService,
    public readonly pedidoService: PedidosService,
    private fb: FormBuilder,
    private mensagemService: MensagemService) {
  }
  @ViewChild('dataTable') table: Table;
  public form: FormGroup;
  inscricao: Subscription;
  param: string;
  selectedFiltros: SelectItem;
  lstFiltro: SelectItem[];
  filtro: SelectItem[] = new Array<SelectItem>();
  emPedidos: boolean = false;
  cols: any[];
  lstDto: Array<ListaDto> = new Array();
  lstDtoFiltrada: Array<ListaDto> = new Array();
  moedaUtils:MoedaUtils = new MoedaUtils();

  ngOnInit(): void {
    this.criarForm();
    this.montarLista();
    this.inscricao = this.activatedRoute.params.subscribe((param: any) => { this.iniciarFiltro(param); });
  }

  criarForm() {
    this.form = this.fb.group({
      filtro: [''],
      dataInicio: [''],
      dataFinal: ['']
    });
  }

  montarLista() {
    this.cols = [
      { field: 'Data', header: 'Data' },
      { field: 'Numero', header: 'Número' },
      { field: 'Nome', header: 'Nome' },
      { field: 'Status', header: 'Status' },
      { field: 'Valor', header: 'Valor' }
    ];
  }

  iniciarFiltro(param: any) {
    this.param = param.filtro;
    if (this.param == "todos" || "pendente") {
      this.emPedidos = false;
      this.montarSelectFiltro();
      this.setarFiltro(this.param);
      this.buscarOrcamentos();
      this.filtrar();
    }
    if (this.param == "pedido") {
      this.emPedidos = true;
      this.montarSelectFiltro();
      this.setarFiltro("todos");
      this.buscarPedidos();
      this.filtrar();
    }
  }

  setarFiltro(filtro:string) {
    this.filtro = new Array<SelectItem>();
    this.lstFiltro.map((m) => {
      let map: string = m.value.toLowerCase();
      if (map.indexOf(filtro) > -1) {
        this.filtro.push(m.value);
      }
    });
  }

  buscarOrcamentos() {
    if (!this.emPedidos) {
      this.orcamentoService.buscarListaOrcamento().toPromise().then((r) => {
        if (r != null) {
          this.lstDto = r;
          this.lstDtoFiltrada = this.lstDto;
        }
      });
    }
  }

  buscarPedidos() {
    if (this.emPedidos) {
      this.pedidoService.buscarListaPedidos().toPromise().then((r) => {
        if (r != null) {
          this.lstDto = r;
          this.lstDtoFiltrada = this.lstDto;
        }
      });
    }
  }

  montarSelectFiltro() {
    if (this.emPedidos) {
      this.lstFiltro = [
        { label: "Todos", value: 'Todos' },
        { label: "Em espera", value: "Em espera" },
        { label: "A entregar", value: "A entregar" },
        { label: "Entregue", value: "Entregue" },
        { label: "Split possível", value: "Split possível" },
        { label: "Separar mercadoria", value: "Separar mercadoria" },
        { label: "Cancelado", value: "Cancelado" }
      ];
    }
    if (!this.emPedidos) {
      this.lstFiltro = [
        { label: "Todos", value: 'Todos' },
        { label: "Virou pedido", value: "Virou pedido" },
        { label: "Encerrado (Cancelado)", value: "Encerrado (Cancelado)" },
        { label: "Em edição", value: "Em edição" },
        { label: "Pendente de aprovação do cliente", value: "Pendente de aprovação do cliente" },
        { label: "Pendente de aprovação de desconto", value: "Pendente de aprovação de desconto" },
        { label: "Desconto negado", value: "Desconto negado" }
      ]
    }

  }

  filtrar() {
    this.mensagemService.showWarnViaToast("Estamos implementando!");
  }

  ngOnDestroy() {
    this.inscricao.unsubscribe();
  }
}
