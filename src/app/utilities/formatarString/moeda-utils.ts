export class MoedaUtils {
    formatter = new Intl.NumberFormat('pt-br', {
        style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2
    });
    formatter1casa = new Intl.NumberFormat('pt-br', {
        style: 'decimal', minimumFractionDigits: 1, maximumFractionDigits: 1
    });
    public formatarMoedaComPrefixo(nro: number) {
        if (!!!nro)
            return "";
        return "R$ " + this.formatter.format(nro);
    }

    public formatarMoedaSemPrefixo(nro: number) {
        if (!!!nro) {
            return "";
        }
        return this.formatter.format(nro);
    }

    public formatarDecimal(valor: number): number {
        return Number.parseFloat(valor.toFixed(2));
    }

    public formatarValorDuasCasaReturnZero(nro: number) {
        
        if (!!!nro)
            return "0,00";
        return this.formatter.format(nro);
    }

    public formatarPorcentagemUmaCasa(nro: number) {
        
        if (!!!nro)
            return "";
        // return this.formatter1casa.format(nro);
        let teste = this.formatter1casa.format(nro);
        return teste;
    }    

    public formatarPorcentagemUmaCasaReturnZero(nro: number) {
        if (!!!nro)
            return "0,0";
        return this.formatter1casa.format(nro);
    }    

    public formatarParaFloatUmaCasaReturnZero(nro: number) {

        if (!!!nro)
            return "0.00";
        return this.formatter1casa.format(nro).replace(",", ".");
    }

    naoArredondar(num, precisao) {
        let casas = Math.pow(10, precisao);
        return Math.floor(num * casas) / casas;
    }
}
