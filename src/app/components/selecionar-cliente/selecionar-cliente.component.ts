import { Component, Input, Output, EventEmitter, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from 'src/app/service/cliente/cliente.service';
import { CpfCnpjUtils } from 'src/app/utilities/cpfCnpjUtils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { AlertaService } from '../alert-dialog/alerta.service';

@Component({
	selector: 'selecionarcliente-arclube',
	templateUrl: './selecionar-cliente.component.html',
	styleUrls: ['./selecionar-cliente.component.css'], encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelecionarClienteArClubeComponent {
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
	innerWidth: number;

	constructor(public alertaService: AlertaService,
		public ClienteService: ClienteService,
		public router: Router) { }

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

	btnPesquisar() {

		//dá erro se não tiver nenhum dígito
		if (StringUtils.retorna_so_digitos(this.value).trim() === "") {
			this.alertaService.mostrarMensagemComLargura(`CNPJ/CPF inválido ou vazio.`, '250px', null);
			return;
		}

		//valida
		if (!CpfCnpjUtils.cnpj_cpf_ok(this.value)) {
			this.alertaService.mostrarMensagemComLargura(`CNPJ/CPF inválido.`, '250px', null);
			return;
		}

		//vamos fazer a busca
		this.carregando = true;
		this.ClienteService.buscar(this.value).toPromise()
			.then((r) => {
				this.carregando = false;
				if (r === null) {
					this.mostrarNaoCadastrado();
					return;
				}

				this.inputValue.emit(r.DadosCliente)
				//cliente já existe
				//verificar se daqui conseguimos zerar o 
				//this.router.navigate(['confirmar-cliente', StringUtils.retorna_so_digitos(r.DadosCliente.Cnpj_Cpf)], { relativeTo: this.activatedRoute, state: r })
			}).catch((r) => {
				//deu erro na busca
				//ou não achou nada...
				this.carregando = false;
				this.alertaService.mostrarErroInternet(r);
			});
	}
	mostrarNaoCadastrado() {
		if (confirm("Este CNPJ/CPF ainda não está cadastrado. Deseja cadastrá-lo agora?")) {
			// this.modalCadastrarCliente = true;
			this.router.navigate(["/cliente/cliente"])
		}

		// this.alertaService.mostrarMensagem("CPF ou CNPJ não encontrado.")
	}

	tipoPessoa_OnChange(tipoPessoa) {
		if (tipoPessoa == "PF") {
			this.mask = "999.999.999-99"
		} else {
			this.mask = "99.999.999/9999-99"
		}
	}

	getLabelStatus() {
		if (this.id == 'Login' || this.id == 'Password')
			return "color: white;"

		return this.fieldValid ? "color: black; opacity: 0.7px;" : "color: red"
	}

	returnValue() {
		this.btnPesquisar()
		// this.inputValue.emit(this.value)
	}

	ngOnInit() {
		this.innerWidth = window.innerWidth * 0.8;
	}
}