import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidacaoFormularioComponent } from 'src/app/utilities/validacao-formulario/validacao-formulario.component';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { UsuarioXLoja } from 'src/app/dto/usuarios/usuario_x_loja';
import { Parceiro } from 'src/app/dto/parceiros/parceiro';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { Estado } from 'src/app/dto/ceps/estado';
import { CepsService } from 'src/app/service/ceps/ceps.service';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-novo',
  templateUrl: './novo.component.html',
  styleUrls: ['./novo.component.scss']
})
export class NovoComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private readonly validacaoFormGroup: ValidacaoFormularioComponent,
    private readonly usuarioService: UsuariosService,
    private readonly alertaService: AlertaService,
    private readonly cepService:CepsService) { }

  public mascaraTelefone: string;
  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public lstVendedores: Array<UsuarioXLoja>;
  public lstParceiro: Array<Parceiro>;
  public lstEstado:Array<Estado>;

  ngOnInit(): void {
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();
    this.criarForm();
    this.buscarVendedores();
    this.buscarEstados();
    this.selectTipo();
  }

  buscarVendedores() {
    this.usuarioService.buscarVendedores().toPromise().then((r) => {
      if (r != null) {
        // debugger;
        this.lstVendedores = r.filter((item, i, arr) => arr.findIndex((f) => f.usuario === item.usuario) === i);
      }
    });
  }

  buscarParceiros() {
    let vendedor: string = this.form.controls.vendedor.value.usuario;
    if (!vendedor) {
      this.alertaService.mostrarMensagem('Selecione um vendedor para o orçamento!');
      return;
    }
    this.usuarioService.buscarParceiros().toPromise().then((r) => {
      if (r != null) {
        this.lstParceiro = r.filter(parca => parca.vendedor === vendedor);
      }
    });
  }

  buscarEstados(){
    this.cepService.buscarEstados().toPromise().then((r) =>{
      if(r != null){
        this.lstEstado = r;
      }
    })
  }

  lstTipo: SelectItem[];
  selectTipo() {
    this.lstTipo = [
      { label: "PF", value: { id: 1, name: "PF" } },
      { label: "PJ", value: { id: 2, name: "PJ" } }
    ]
  }

  criarForm() {
    this.form = this.fb.group({
      nome: ['', [Validators.required]],
      nomeObra:[''],
      vendedor: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"), Validators.maxLength(60)]],
      parceiro: [''],
      telefone: [''],
      concorda: [''],
      validade: ['', [Validators.required]],//A validade está estipulada em um valor fixo de 7 dias corridos
      vendedorParceiro: [''],
      estado: ['', [Validators.required]],
      tipo: ['', [Validators.required]]
    })
  }

  iniciarOrcamento() {
    if (!this.validacaoFormGroup.validaForm(this.form)) return;

    console.log("passou");
  }
}
