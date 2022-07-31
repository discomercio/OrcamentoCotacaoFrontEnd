export enum EnumTipoPagto{
    Avista = 'AV',
    ParcCartaoInternet = 'SE',
    ParcComEnt = 'CE',
    ParcSemEnt = 'SE',
    ParcUnica = 'SE',
    ParcCartaoMaquineta = 'SE'
} 

export class ProdutosCalculados{
    QtdeParcela: number;
    Valor:number;
}