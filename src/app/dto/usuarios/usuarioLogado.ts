import { Usuario } from 'src/app/dto/usuarios/usuario';
export class UsuarioLogado {
    nameid: number = 0;
    unique_name: string = "";
    family_name:string="";
    role: string = "";
    unidade_negocio: string = "";
    TipoUsuario:string="";
    Parceiro:string="";
    Vendedor: string = "";
    Lojas: string ="";
    Permissoes:string = "";
    UsuarioLogin:Usuario;
}
/*
{
  "nameid": "PRAGMATICA",
  "unique_name": "PRAGMATICA ENG. CONS. ASSOC.",
  "family_name": "200,201,202,203,204,205,206,207,208,209,210,211,212",
  "role": "RoleOrcamentoCotacao",
  "unidade_negocio": ",AC,BS,,BS,VRF,VRF,VRF,VRF,VRF,VRF,VRF,BS",
  "TipoUsuario": "",
  "Parceiro": "",
  "Vendedor": "",
  "Lojas": "200,201,202,203,204,205,206,207,208,209,210,211,212",
  "Permissoes": "100100,100200",
  "UsuarioLogin": "{\"Apelido\":\"PRAGMATICA\",\"Senha\":null,\"Nome\":\"PRAGMATICA ENG. CONS. ASSOC.\",\"Loja\":\"200,201,202,203,204,205,206,207,208,209,210,211,212\",\"Unidade_negocio\":\",AC,BS,,BS,VRF,VRF,VRF,VRF,VRF,VRF,VRF,BS\",\"IdErro\":0,\"Email\":\"\",\"TipoUsuario\":null,\"IdParceiro\":null,\"IdVendedor\":null,\"VendedorResponsavel\":null,\"Token\":null,\"Permissoes\":[\"100100\",\"100200\"]}",
  "nbf": 1644264149,
  "exp": 1644868949,
  "iat": 1644264149
}
*/
