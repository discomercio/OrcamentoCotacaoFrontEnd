import { TreeNode } from 'primeng/api/treenode';

export class ObterEstruturaResponse {
    Childs: TreeNode[];
    Sucesso: boolean;
    Mensagem: string;
    Mensagens: string[];
}