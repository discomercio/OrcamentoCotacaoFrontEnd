import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Observable } from 'rxjs';
import { ClienteCadastroDto } from 'src/app/dto/clientes/ClienteCadastroDto';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { DadosClienteCadastroDto } from 'src/app/dto/clientes/DadosClienteCadastroDto';
import { ListaBancoDto } from 'src/app/dto/clientes/ListaBancoDto';
import { EnderecoEntregaJustificativaDto } from 'src/app/dto/clientes/EnderecoEntregaJustificativaDto';


@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(private readonly http: HttpClient, private env: environment) { }

  public buscar(cpfCnpj: string): Observable<ClienteCadastroDto> {
    //adiciona todos os parametros por nome
    let params = new HttpParams();
    params = params.append('cnpj_cpf', cpfCnpj);

    return this.http.get<ClienteCadastroDto>(this.env.apiUrl() + 'api/cliente/buscarCliente/' + StringUtils.retorna_so_digitos(cpfCnpj));
  }

  public cadastrarCliente(clienteCadastroDto: ClienteCadastroDto) {
    return this.http.post<string[]>(this.env.apiUrl() + 'api/cliente/cadastrarCliente', clienteCadastroDto);
  }

  public buscarClienteOrcamento(cpfCnpj: any): Observable<any> {
    return this.http.get(this.env.apiUrl() + '/buscarCliente/' + cpfCnpj);
  }

  public cadastrarClienteOrcamento(body: any): Observable<any> {
    return this.http.post<any>(this.env.apiUrl() + '/cadastrarCliente', body);
  }

  public atualizarCliente(dadosClienteCadastroDto: DadosClienteCadastroDto) {
    return this.http.post<string[]>(this.env.apiUrl() + 'api/cliente/atualizarClienteparcial', dadosClienteCadastroDto);
  }

  public listaBancosCombo(): Observable<ListaBancoDto[]> {
    return this.http.get<ListaBancoDto[]>(this.env.apiUrl() + 'api/cliente/listarBancosCombo');
  }

  public JustificativaEndEntregaComboTemporario(): Observable<EnderecoEntregaJustificativaDto[]> {
    return this.http.get<EnderecoEntregaJustificativaDto[]>(this.env.apiUrl() + 'api/cliente/listarComboJustificaEndereco');
  }

}

export class JustificativaEndEntregaComboDto {
  public Codigo: string;
  public Descricao: string;
}
