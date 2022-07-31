import { AvistaDto } from './AvistaDto';
import { ParcUnicaDto } from './ParcUnicaDto';
import { ParcComEntradaDto } from './ParcComEntradaDto';
import { ParcComEntPrestacaoDto } from './ParcComEntPrestacaoDto';
import { ParcSemEntPrestacaoDto } from './ParcSemEntPrestacaoDto';
import { ParcSemEntradaPrimPrestDto } from './ParcSemEntradaPrimPrestDto';

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