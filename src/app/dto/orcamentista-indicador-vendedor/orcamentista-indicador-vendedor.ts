export class OrcamentistaIndicadorVendedorDto {
    static arrayJSONtoConcret(res: OrcamentistaIndicadorVendedorDto[]): OrcamentistaIndicadorVendedorDto[] {
        return res.map(x=>this.JSONtoConcret(x));
    }

    static JSONtoConcret(x: OrcamentistaIndicadorVendedorDto): OrcamentistaIndicadorVendedorDto {
        const result = new OrcamentistaIndicadorVendedorDto();
        Object.assign(result, x);
        x.ativoLabel = !!x.ativo? "SIM": "NÃO";
        return x;
    }
    id: number = 0;
    nome: string = "";
    indicador: number;
    ativo: boolean = false;
    email: string = "";
    ativoLabel: string = "NÂO";
    parceiro: string;
    stringBusca:string;
    vendedorResponsavel:string;
}
