export class Constantes {
	//' CÓDIGOS QUE IDENTIFICAM SE É PESSOA FÍSICA OU JURÍDICA
	public ID_PF = "PF";
	public ID_PJ = "PJ"

	//'	NÚMERO DE LINHAS DO CAMPO "OBS I" DO PEDIDO
	public MAX_LINHAS_OBS1 = 5;

	//'   NÚMERO DE LINHAS DO CAMPO "TEXTO CONSTAR NF" DO PEDIDO
	public MAX_LINHAS_NF_TEXTO_CONSTAR = 2;

	//' CÓDIGOS P/ ENTREGA IMEDIATA
	public COD_ETG_IMEDIATA_ST_INICIAL = 0;
	public COD_ETG_IMEDIATA_NAO = 1;
	public COD_ETG_IMEDIATA_SIM = 2;
	public COD_ETG_IMEDIATA_NAO_DEFINIDO = 10;  //' PEDIDOS ANTIGOS QUE JÁ ESTAVAM NA BASE

	// ' CÓDIGOS P/ FLAG "BEM DE USO/CONSUMO"
	public COD_ST_BEM_USO_CONSUMO_NAO = 0;
	public COD_ST_BEM_USO_CONSUMO_SIM = 1;
	public COD_ST_BEM_USO_CONSUMO_NAO_DEFINIDO = 10;//  ' PEDIDOS ANTIGOS QUE JÁ ESTAVAM NA BASE


	// '	CÓDIGOS PARA O CAMPO "INSTALADOR INSTALA"
	public COD_INSTALADOR_INSTALA_NAO_DEFINIDO = 0;
	public COD_INSTALADOR_INSTALA_NAO = 1;
	public COD_INSTALADOR_INSTALA_SIM = 2;

	//' CÓDIGOS P/ STATUS QUE INDICA SE CLIENTE É OU NÃO CONTRIBUINTE DO ICMS
	public COD_ST_CLIENTE_CONTRIBUINTE_ICMS_INICIAL = 0;
	public COD_ST_CLIENTE_CONTRIBUINTE_ICMS_NAO = 1;
	public COD_ST_CLIENTE_CONTRIBUINTE_ICMS_SIM = 2;
	public COD_ST_CLIENTE_CONTRIBUINTE_ICMS_ISENTO = 3;

	//' CÓDIGOS P/ STATUS QUE INDICA SE CLIENTE É OU NÃO PRODUTOR RURAL
	public COD_ST_CLIENTE_PRODUTOR_RURAL_INICIAL = 0;
	public COD_ST_CLIENTE_PRODUTOR_RURAL_NAO = 1;
	public COD_ST_CLIENTE_PRODUTOR_RURAL_SIM = 2;

	//'	NÚMERO DE LINHAS DO CAMPO "FORMA DE PAGAMENTO" DO PEDIDO
	public MAX_LINHAS_FORMA_PAGTO = 5;

	//' CÓDIGOS P/ FLAG "GarantiaIndicadorStatus"
	public COD_GARANTIA_INDICADOR_STATUS__NAO = 0;
	public COD_GARANTIA_INDICADOR_STATUS__SIM = 1;
	public COD_GARANTIA_INDICADOR_STATUS__NAO_DEFINIDO = 10; //  ' PEDIDOS ANTIGOS QUE JÁ ESTAVAM NA BASE

	// QUANTIDADE MÁXIMA DE REGISTROS COM OPÇÕES DE PARCELAMENTO P/ CADA FORNECEDOR
	public MAX_LINHAS_TABELA_CUSTO_FINANCEIRO_FORNECEDOR = 24;
	public MAX_DECIMAIS_COEFICIENTE_CUSTO_FINANCEIRO_FORNECEDOR = 6;
	public COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__SEM_ENTRADA = "SE";
	public COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__COM_ENTRADA = "CE";
	public COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__A_VISTA = "AV";

	//FORMA DE PAGAMENTO
	public COD_FORMA_PAGTO_A_VISTA = "1";
	public COD_FORMA_PAGTO_PARCELADO_CARTAO = "2";
	public COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA = "3";
	public COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA = "4";
	public COD_FORMA_PAGTO_PARCELA_UNICA = "5";
	public COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA = "6";


	//Usuário erros
	public ERR_USUARIO_BLOQUEADO = "7";
	public ERR_IDENTIFICACAO_LOJA = "3";
	public ERR_SENHA_EXPIRADA = "4";

	public COD_ST_PEDIDO_RECEBIDO_SIM = "1";

	//Referências
	public MAX_REF_BANCARIA_CLIENTE_PJ = 1;
	public MAX_REF_COMERCIAL_CLIENTE_PJ = 3;

}

