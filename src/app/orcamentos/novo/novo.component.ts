import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidacaoFormularioComponent } from 'src/app/utilities/validacao-formulario/validacao-formulario.component';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { Usuarios } from 'src/app/dto/usuarios/usuarios';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';

@Component({
  selector: 'app-novo',
  templateUrl: './novo.component.html',
  styleUrls: ['./novo.component.scss']
})
export class NovoComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private readonly validacaoFormGroup: ValidacaoFormularioComponent) { }

  public mascaraTelefone: string;
  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";

  ngOnInit(): void {
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();
    this.form = this.fb.group({
      nome:['', [Validators.required]],
      vendedor:['',[Validators.required]],
      email:['',[Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"), Validators.maxLength(60)]],
      parceiro:[''],
      telefone:[''],
      concorda:[''],
      validade:['', [Validators.required]],
      instalador:[''],
      estado:['',[Validators.required]],
      tipo:['', [Validators.required]]
    })
  }

  iniciarOrcamento(){
    if (!this.validacaoFormGroup.validaForm(this.form)) return;

    console.log("passou");
  }
}
