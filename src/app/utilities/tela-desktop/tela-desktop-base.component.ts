import { TelaDesktopService } from './tela-desktop.service';

export class TelaDesktopBaseComponent {
    public telaDesktop: boolean = true;
    constructor(telaDesktopService: TelaDesktopService) {        
        telaDesktopService.telaAtual$.subscribe(r => this.telaDesktop = r);
    }
}