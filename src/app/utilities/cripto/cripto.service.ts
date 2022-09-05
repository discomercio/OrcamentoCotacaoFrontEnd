import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CriptoService {

  constructor() { }

  public gerarChave() {
    // gerar chave
    const fator: number = 1209;
    const cod_min: number = 35;
    const cod_max: number = 96;
    const tamanhoChave: number = 128;

    let chave: string = "";

    for (let i: number = 1; i < tamanhoChave; i++) {
      let k: number = (cod_max - cod_min) + 1;
      k *= fator;
      k = (k * i) + cod_min;
      k %= 128;
      chave += String.fromCharCode(k);
    }

    return chave;
  }

  public CodificaSenha(origem: string, chave: string): string {

    let i: number = 0;
    let i_chave: number = 0;
    let i_dado: number = 0;
    let s_origem: string = origem;
    let letra: string = "";
    let s_destino: string = "";

    if (s_origem.length > 15) {
      s_origem = s_origem.substr(0, 15);
    }

    for (i = 0; i < s_origem.length; i++) {
      letra = chave.substr(i, 1);
      i_chave = (letra.charCodeAt(0) * 2) + 1;
      i_dado = s_origem.substr(i, 1).charCodeAt(0) * 2;
      let contaMod = i_chave ^ i_dado;
      s_destino += String.fromCharCode(contaMod);
    }

    s_origem = s_destino;
    s_destino = "";
    let destino = "";

    for (i = 0; i < s_origem.length; i++) {
      letra = s_origem.substr(i, 1);
      i_chave = letra.charCodeAt(0);
      let hexNumber = i_chave.toString(16);

      while (hexNumber.length < 2) {
        hexNumber = hexNumber.padStart(2, '0');
      }
      destino += hexNumber;
    }
    while (destino.length < 30) {
      destino = "0" + destino;
    }
    s_destino = "0x" + destino;
    return s_destino;
  }

  decodificaDado(strOrigem: string, fator: number) {
    let i: number = 0;
    let i_chave: number = 0;
    let i_dado: number = 0;
    let k: number = 0;
    let s_origem: string = "";
    let s_destino: string = "";
    let s: string = "";
    let chave: string = "";

    let strDestino: string = "";

    if (strOrigem == null) return strDestino;
    if (strOrigem.trim().length == 0) return strDestino;
    chave = this.gera_chave_codificacao(fator);

    s_destino = "";
    s_origem = strOrigem.trim();
    
    // Possui prefixo '0x'?
    if (s_origem.substr(0, 2) != "0x") return strDestino;
    
    // Retira prefixo '0x' da máscara (imita formato timestamp)
    s_origem = s_origem.substr(2, s_origem.length - 2);
    s_origem = s_origem.toUpperCase();
    
    // Retira caracteres de preenchimento (imita formato timestamp)
    s = s_origem.substr(0, 2);
    s = "0x" + s;
    i = s.charCodeAt(16);
    
    if (!isNaN(i)) {
      s_origem = s_origem.substr(s_origem.length - i, i)
    }
    else {
      while (s_origem.substr(0, 2) == "00") {
        s_origem = s_origem.replace("00", "");
      }
    }
    
    // Hexadecimal -> ASCII
    for (i = 1; i <= s_origem.length; i += 2) {
      s = s_origem.substr(i - 1, 2);
      s = "0x" + s;
      s_destino += String.fromCharCode(parseInt(s, 16));
    }
    
    // Descriptografa pela chave
    s_origem = s_destino;
    s_destino = "";
    for (i = 1; i <= s_origem.length; i++) {
      let letra = chave.substr(i - 1, 1);
      i_chave = (letra.charCodeAt(0) * 2) + 1;
      letra = s_origem.substr(i -1, 1);
      i_dado = letra.charCodeAt(0);
      let contaMod = i_chave ^ i_dado;
      s_destino += String.fromCharCode(contaMod /2);
    }

    return s_destino;
  }

  private gera_chave_codificacao(fator: number) {
    let COD_MINIMO: number = 35;
    let COD_MAXIMO: number = 96;
    let TAMANHO_CHAVE: number = 128;
    let i: number = 0;
    let k: number = 0;
    let s: string = "";

    for (i = 1; i <= TAMANHO_CHAVE; i++) {
      k = COD_MAXIMO - COD_MINIMO + 1;
      k *= fator;
      k = (k * i) + COD_MINIMO;
      k %= 128;
      s += String.fromCharCode(k);
    }
    let chave_gerada = s.toString();

    return chave_gerada
  }
}
