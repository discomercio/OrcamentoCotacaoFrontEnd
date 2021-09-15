export class StringUtils {
    public static retorna_so_digitos(msg: string): string {
        return msg.replace(/\D/g, "");
    }
}
