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
        if (!!!nro)
            return "";
        return this.formatter.format(nro);
    }
}
