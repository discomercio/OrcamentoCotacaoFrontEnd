export class StringUtils {
    public static retorna_so_digitos(msg: string): string {
        return msg.replace(/\D/g, "");
    }

    public static formatarDescricao(fabricante: string, fabricanteNome: string, produto: string, descricao_html: string) {
        return fabricante + "/" + produto + " - " + fabricanteNome + " - " + descricao_html;
    }

    public static TextoDeHtml(html: string): string {
        if (!html)
            return "";
        return html.replace(/<[^>]*>?/gm, '');
    }
}
