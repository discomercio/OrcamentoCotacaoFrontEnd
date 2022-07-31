import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoComboCpfcnpjService {

  constructor(private readonly http: HttpClient) { }
  public obter(): Observable<string[]> {
    return this.http.get<string[]>(environment.apiUrl + 'pedido/listarCpfCnpjPedidosCombo');
  }
}
