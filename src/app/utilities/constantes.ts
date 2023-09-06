export class Constantes {
    public COD_FORMA_PAGTO_A_VISTA = 1;
    public COD_FORMA_PAGTO_PARCELADO_CARTAO = 2;
    public COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA = 3;
    public COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA = 4;
    public COD_FORMA_PAGTO_PARCELA_UNICA = 5;
    public COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA = 6;

    public COD_MEIO_PAGTO_ENTRADA = 3;
    public COD_MEIO_PAGTO_DEMAIS_PRESTACOES = 5;
    public COD_MEIO_PAGTO_PRIM_PRESTACOES = 4;

    public COD_MEIO_TIPO_PAGTO_DINHEIRO = 1;
    public COD_MEIO_TIPO_PAGTO_DEPOSITO = 2;
    public COD_MEIO_TIPO_PAGTO_CHEQUE = 3;
    public COD_MEIO_TIPO_PAGTO_BOLETO = 4;
    public COD_MEIO_TIPO_PAGTO_CARTAO_INTERNET = 5;
    public COD_MEIO_TIPO_PAGTO_BOLETOAV = 6;
    public COD_MEIO_TIPO_PAGTO_CARTAO_MAQUINETA = 7;

    public COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__COM_ENTRADA = "CE";
    public COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__SEM_ENTRADA = "SE";

    public ID_PF = "PF";
    public ID_PJ = "PJ";

    public GESTOR = 0;
    public VENDEDOR_UNIS = 1;
    public PARCEIRO = 2;
    public PARCEIRO_VENDEDOR = 3;

    public AcessoAoModulo = "100100";
    public AdministradorDoModulo = "100200";
    public ParceiroIndicadorUsuarioMaster = "100300";
    public SelecionarQualquerIndicadorDaLoja = "100400";

    public SEM_INDICADOR = "*_SEM_INDICADOR_*";

    public USUARIO_PERFIL_CENTRAL = 1;
    public USUARIO_PERFIL_VENDEDOR = 2;
    public USUARIO_PERFIL_PARCEIRO_INDICADOR = 3;

    public STATUS_ORCAMENTO_COTACAO_ENVIADO = 1;
    public STATUS_ORCAMENTO_COTACAO_CANCELADO = 2;
    public STATUS_ORCAMENTO_COTACAO_APROVADO = 3;
    public STATUS_ORCAMENTO_COTACAO_EXPIRADO = 4;
    public STATUS_ORCAMENTO_COTACAO_EXCLUIDO = 5;

    //PREPEDIDO

    //' CÓDIGOS P/ STATUS QUE INDICA SE CLIENTE É OU NÃO CONTRIBUINTE DO ICMS
    public COD_ST_CLIENTE_CONTRIBUINTE_ICMS_INICIAL = 0;
    public COD_ST_CLIENTE_CONTRIBUINTE_ICMS_NAO = 1;
    public COD_ST_CLIENTE_CONTRIBUINTE_ICMS_SIM = 2;
    public COD_ST_CLIENTE_CONTRIBUINTE_ICMS_ISENTO = 3;

    //' CÓDIGOS P/ STATUS QUE INDICA SE CLIENTE É OU NÃO PRODUTOR RURAL
    public COD_ST_CLIENTE_PRODUTOR_RURAL_INICIAL = 0;
    public COD_ST_CLIENTE_PRODUTOR_RURAL_NAO = 1;
    public COD_ST_CLIENTE_PRODUTOR_RURAL_SIM = 2;

    public USUARIO_CADASTRO_CLIENTE = "[4] Cliente";

    public COD_INSTALADOR_INSTALA_NAO_DEFINIDO = 0;
    public COD_INSTALADOR_INSTALA_NAO = 1;
    public COD_INSTALADOR_INSTALA_SIM = 2;

    public ModuloOrcamentoCotacao_CalculadoraVrf_LogoPdf = 21;
    public ModuloOrcamentoCotacao_CalculadoraVrf_TextoDisclaimer = 22;
    public ModuloOrcamentoCotacao_CalculadoraVrf_FaixaSimultaneidade = 23;
    public ModuloOrcamentoCotacao_Cliente_AceitePoliticaCredito = 27;
    public ModuloOrcamentoCotacao_Cliente_AceitePoliticaPrivacidadeDados = 28;
    public ModuloOrcamentoCotacao_Cliente_PF_AvisoPreenchimentoDadosCadastrais = 29;
    public ModuloOrcamentoCotacao_Cliente_PJ_AvisoPreenchimentoDadosCadastrais = 30;
    public ModuloOrcamentoCotacao_EntregaImediata_PrazoMaxPrevisaoEntrega = 37;
    public ModuloOrcamentoCotacao_TextoFixo_CondicoesGerais = 12;
    public ModuloOrcamentoCotacao_Orcamento_LogoPdf = 41;
    public ModuloOrcamentoCotacao_Disclaimer_MedianteConfirmacaoEstoque = 39;
    public ModuloOrcamentoCotacao_Disclaimer_Frete = 40;


    //Utilizando somente para calculadoraVRF
    public fFabr = "fFabr:";
    public fProd = "fProd:";
    public fDesc = "fDesc:";
    public fVolt = "fVolt:";
    public fDescar = "fDescar:";
    public fKw = "fKw:";
    public fKcal = "fKcal:";
    public fHp = "fHp:";
    public fCiclo = "fCiclo:"
    public fProp = "fProp:";
}