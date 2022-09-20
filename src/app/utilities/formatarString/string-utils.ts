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

    public static formataTextoTelefone(tel: string): string {
        if (tel != undefined) {
            let ddd: string = "(" + tel.slice(0, 2) + ")"
            if (tel.length == 11) {
                let inicio = " " + tel.substring(2, 7);
                let fim = "-" + tel.substring(7);
                return ddd + inicio + fim;
            }
            else {
                let inicio = " " + tel.substring(2, 6);
                let fim = "-" + tel.substring(6);
                return ddd + inicio + fim;
            }
        }
    }

    static mascaraCep(): string {
        return "99999-999";
    }

    static inputMaskCPF(): string {
        return "999.999.999-99";
    }

    static inputMaskCNPJ(): string {
        return "99.999.999/9999-99";
    }
}
