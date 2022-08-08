import { Component, Input, Output, EventEmitter, ViewEncapsulation, ViewChild } from '@angular/core';
import { CepDto } from 'src/app/dto/ceps/CepDto';
import { CepsService } from 'src/app/service/ceps/ceps.service';
// import { BuscarClienteService } from 'src/app/service/cliente/buscar-cliente.service';
// import { CpfCnpjUtils } from 'src/app/utilities/cpfCnpjUtils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { AlertaService } from '../alert-dialog/alerta.service';
import { ButtonArClubeComponent } from '../button/button-arclube.component';

@Component({
	selector: 'selecionarcep-arclube',
	templateUrl: './selecionar-cep.component.html',
	styleUrls: ['./selecionar-cep.component.css'], encapsulation: ViewEncapsulation.None
})
export class SelecionarCepArClubeComponent {
	constructor(public alertaService: AlertaService,
		public readonly cepService: CepsService) { }

	@ViewChild(ButtonArClubeComponent, { static: false })
	button: ButtonArClubeComponent
	
	@Output() rowSelected = new EventEmitter()

	titleLabel: string
	value: string
	type: string = 'text'
	widthContainer: any = 100
	widthInput: any = 100
	widthTitle: any = 100
	disabled: boolean = false
	invalid: boolean = false
	placeholder: string = ''
	id: string
	mask: string = ''
	feedback: boolean = false
	fieldValid: boolean = true
	requiredField: boolean = false
	requiredLabel: string = ''
	number: number;
	carregando: boolean;
	modalCEP: boolean = false;
	innerWidth: number;
	innerHeight: number;
	UFs: any[];
	Localidades: any;
	_loading: boolean = false;

	tableContent: Array<any>[];

	CepDTO: CepDto;

	//campos sendo editados
	public Endereco: string;
	public Numero: string;
	public Complemento: string;
	public Bairro: string;
	public Cidade: string;
	public Uf: string;
	public Cep: string;

	mostrarCepNaoEncontrado() {
		this.Endereco = "";
		this.Numero = "";
		this.Complemento = "";
		this.Bairro = "";
		this.Cidade = "";
		this.Uf = "";
		this.Cep = "";
		this.alertaService.mostrarMensagem("CEP inválido ou não encontrado.");

	}

	mascaraCep() {
		return [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/];
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

	public lstCidadeIBGE: string[];
	public temCidade: boolean;
	public temUf: boolean;
	public cep_retorno: string;



	@Output() inputValue = new EventEmitter();

	@Input()
	set setId(value: string) {
		this.id = value
	}

	@Input()
	set setDisable(value: boolean) {
		this.disabled = value
	}

	@Input()
	set setInvalid(value: boolean) {
		this.invalid = value
	}

	@Input()
	set setPlaceholder(value: string) {
		this.placeholder = value
	}

	@Input()
	set titleInput(value: string) {
		this.titleLabel = value
	}

	@Input()
	set typeInput(value: string) {
		this.type = value
	}

	@Input()
	set valueInput(value: string) {
		this.value = value
	}

	@Input()
	set setWidthContainer(value: any) {
		this.widthContainer = value
	}

	@Input()
	set setWidthInput(value: any) {
		this.widthInput = value
	}

	@Input()
	set setWidthTitle(value: any) {
		this.widthTitle = value
	}

	@Input()
	set setMask(value: any) {
		this.mask = value
	}

	@Input()
	set setFeedback(value: boolean) {
		this.feedback = value
	}

	@Input()
	set validControl(value: boolean) {
		this.fieldValid = value
	}

	@Input()
	set isRequired(value: boolean) {
		this.requiredField = value
		this.requiredLabel = value ? '*' : ''
	}

	//saiu do campo de CEP, vamos carregar o endereco
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
			this.zerarCamposEndEntrega();
			//vamos fazer a busca
			this.carregando = true;

			this.cepService.buscarCep(this.Cep, null, null, null).toPromise()
				.then((r) => {
					this.carregando = false;

					if (!r || r.length !== 1) {
						this.cep_retorno = "";
						this.mostrarCepNaoEncontrado();
						return;
					}
					//recebemos um endereço
					const end = r[0];

					this.cep_retorno = this.Cep;
					if (!!end.Bairro) {
						this.Bairro = end.Bairro;
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

	enterCep(event: Event) {
		document.getElementById("numero").focus();
		event.cancelBubble = true;
		event.preventDefault();
		// event.srcElement

	}

	//para acessar a caixa de diálogo
	buscarCep() {

		this.zerarCamposEndEntrega();

		let options: any = {
			autoFocus: false,
			width: "60em"
			//não colocamos aqui para que ele ajuste melhor: height:"85vh",
		};
		// if (!this.telaDesktop) {
		// 	//opções para celular
		// 	options = {
		// 		autoFocus: false,
		// 		width: "100vw", //para celular, precisamos da largura toda
		// 		maxWidth: "100vw"
		// 		//não colocamos aqui para que ele ajuste melhor: height:"85vh",
		// 	};
		// }
		// const dialogRef = this.dialog.open(CepDialogComponent, options);
		//this.modalCEP = true
		// dialogRef.afterClosed().subscribe((result) => {
		// 	if (result) {
		// 		let end: CepDto = dialogRef.componentInstance.lstEnderecos[dialogRef.componentInstance.endereco_selecionado];

		// 		if (!!end.Uf) {
		// 			this.Uf = end.Uf;
		// 			this.temUf = true;
		// 		}
		// 		if (!!end.Cidade) {
		// 			if (!!end.ListaCidadeIBGE && end.ListaCidadeIBGE.length > 0) {
		// 				this.temCidade = false;
		// 				this.lstCidadeIBGE = end.ListaCidadeIBGE;
		// 			}
		// 			else {
		// 				this.Cidade = end.Cidade;
		// 				this.temCidade = true;
		// 			}

		// 		}
		// 		if (!!end.Bairro) {
		// 			this.Bairro = end.Bairro;
		// 		}
		// 		if (!!end.Endereco) {
		// 			this.Endereco = end.Endereco;
		// 		}

		// 		this.Cep = end.Cep;
		// 		this.cep_retorno = end.Cep;
		// 	}
		// });
	}

	CloseModalCEP() {
		this.modalCEP = false
	}

	onChangeUF(event) {
		this._loading = true
		this.CepDTO.Uf = event
		this.cepService.BuscarLocalidades(event).toPromise().then(x => {
			let res = x.map((value, index) => {
				return {
					id: value,
					name: value
				};
			})
			this._loading = false
			this.Localidades = res;
		})
	}

	btnBuscar() {
		this.modalCEP = true
		this._loading = true
		this.cepService.buscarCepPorEndereco(this.CepDTO.Endereco, this.CepDTO.Cidade, this.CepDTO.Uf).toPromise().then(x => {
			this.generateTable(x);
			this._loading = false
			this.innerHeight = window.innerHeight * 0.5;
		});
	}

	returnValue() {
		this._loading = true;
		this.cepService.buscarCep(this.value, null, null, null).toPromise().then(x => {
			if(x.length > 0){
				this._loading = false			
				this.inputValue.emit(x)
			}
		});
	}

	onRowSelected(rowData) {
		this.inputValue.emit(rowData)
		this.modalCEP = false
	}

	ngOnInit() {
		this.innerWidth = window.innerWidth * 0.8;
		this.innerHeight = window.innerHeight * 0.2;
		this.CepDTO = new CepDto();
		this.cepService.buscarEstados().toPromise().then(x => {
			this.UFs = x;
		})
		this.CepDTO.Uf = "SP"
		this.CepDTO.Endereco = "Rua Piauí"
		this.CepDTO.Cidade = "São Caetano do Sul"
		this.onChangeUF(this.CepDTO.Uf)
	}

	generateTable(items) {
		let itemsTable: Array<any> = []
		itemsTable = items

		let headersTable = [
			{ name: 'CEP', field: 'Cep', isSortable: false, },
			{ name: 'UF', field: 'Uf', isSortable: false },
			{ name: 'Cidade', field: 'Cidade', isSortable: false },
			{ name: 'Bairro', field: 'Bairro', isSortable: false },
			{ name: 'Endereço', field: 'Endereco', isSortable: false },
			//   {name: 'Data do Pagamento', field: 'DataPagamento', isSortable: false},
			//   {name: 'Protesto', field: 'Protesto', isSortable: false },
			//   {name: 'Atraso', field: 'Atraso', isSortable: false }
		]
		/* Cep: string;
  Uf: string;
  Cidade: string;
  Bairro: string;
  Endereco: string;
  Numero: string;
  Complemento: string;
  LogradouroComplemento: string;
  ListaCidadeIBGE: string[];*/
		let table: Array<any> = []
		table.push(itemsTable)
		table.push(headersTable)
		table.push(items.totalRows)
		this.tableContent = table
	}
}