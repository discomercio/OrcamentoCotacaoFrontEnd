import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteCadastroDto } from 'src/app/dto/prepedido/ClienteCadastro/ClienteCadastroDto';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { DadosClienteCadastroDto } from 'src/app/dto/prepedido/ClienteCadastro/DadosClienteCadastroDto';
import { ListaBancoDto } from 'src/app/dto/prepedido/ClienteCadastro/ListaBancoDto';
import { EnderecoEntregaJustificativaDto } from 'src/app/dto/prepedido/ClienteCadastro/EnderecoEntregaJustificativaDto';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class BuscarClienteService {

  constructor(
    private readonly http: HttpClient, 
    private appSettingsService: AppSettingsService) { }

  public buscar(cpfCnpj: string): Observable<ClienteCadastroDto> {
    //adiciona todos os parametros por nome
    let params = new HttpParams();
    params = params.append('cnpj_cpf', cpfCnpj);

    return this.http.get<ClienteCadastroDto>(this.appSettingsService.config.apiUrl + 'api/cliente/buscarCliente/' + StringUtils.retorna_so_digitos(cpfCnpj));
  }

  public cadastrarCliente(clienteCadastroDto: ClienteCadastroDto) {
    return this.http.post<string[]>(this.appSettingsService.config.apiUrl + 'api/cliente/cadastrarCliente', clienteCadastroDto);
  }

  public atualizarCliente(dadosClienteCadastroDto: DadosClienteCadastroDto) {
    return this.http.post<string[]>(this.appSettingsService.config.apiUrl + 'api/cliente/atualizarClienteparcial', dadosClienteCadastroDto);
  }

  public listaBancosCombo(): Observable<ListaBancoDto[]> {
    return this.http.get<ListaBancoDto[]>(this.appSettingsService.config.apiUrl + 'api/cliente/listarBancosCombo');
  }

  public JustificativaEndEntregaComboTemporario(origem: string = null, loja: string = null): Observable<EnderecoEntregaJustificativaDto[]> {
    
    if (origem == "publico") {
      let params = new HttpParams();
      params = params.append('loja', loja);
      return this.http.get<EnderecoEntregaJustificativaDto[]>(`${this.appSettingsService.config.apiUrl}publico/listarComboJustificaEndereco/${loja}`);
    }

    return this.http.get<EnderecoEntregaJustificativaDto[]>(this.appSettingsService.config.apiUrl + 'api/cliente/listarComboJustificaEndereco');
  }

}

export class JustificativaEndEntregaComboDto {
  public Codigo: string;
  public Descricao: string;
}
