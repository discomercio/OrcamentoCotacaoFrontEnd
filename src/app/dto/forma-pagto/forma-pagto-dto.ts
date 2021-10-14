import { AvistaDto } from './avista-dto';
import { ParcUnicaDto } from './parc-unica-dto';
import { ParcComEntradaDto } from './parc-com-entrada-dto';
import { ParcComEntPrestacaoDto } from './parc-com-ent-prestacao-dto';
import { ParcSemEntradaPrimPrestDto } from './parc-sem-entrada-prim-prest-dto';
import { ParcSemEntPrestacaoDto } from './parc-sem-ent-prestacao-dto';

export class FormaPagtoDto {
    ListaAvista: AvistaDto[];
    ListaParcUnica: ParcUnicaDto[];
    ParcCartaoInternet: boolean;
    ParcCartaoMaquineta: boolean;
    ListaParcComEntrada: ParcComEntradaDto[];
    ListaParcComEntPrestacao: ParcComEntPrestacaoDto[];
    ListaParcSemEntPrimPrest: ParcSemEntradaPrimPrestDto[];
    ListaParcSemEntPrestacao: ParcSemEntPrestacaoDto[];
}
