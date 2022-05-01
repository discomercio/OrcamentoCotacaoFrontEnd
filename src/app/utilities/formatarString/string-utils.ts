export class StringUtils {
    public static retorna_so_digitos(msg: string): string {
        return msg.replace(/\D/g, "");
    }

    public static formatarDescricao(fabricante: string, fabricanteNome: string, produto: string, descricao_html: string) {
        let descricao: string = "";
        descricao += !!fabricante ? fabricante : "";
        descricao += !!produto ? "/" + produto : "";
        descricao += !!fabricanteNome ? " - " + fabricanteNome : "";
        descricao += !!descricao_html ? " - " + descricao_html : "";
        // return fabricante + "/" + produto + " - " + fabricanteNome + " - " + descricao_html;
        return descricao;
    }

    public static TextoDeHtml(html: string): string {
        if (!html)
            return "";
        return html.replace(/<[^>]*>?/gm, '');
    }
}
