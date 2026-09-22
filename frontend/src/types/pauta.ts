export interface Pauta {
    id: string;
    titulo: string;
    descricao?: string;
    dataCriacao?: string;
    sessao?: {
        id: string;
        dataEncerramento: string;
        dataFechamento?: string;
        aberta: boolean;
    };
}

export interface ResultadoDto {
    id: string;
    titulo: string;
    totalVotos: number;
    totalVotosSim: number;
    totalVotosNao: number;
}

export interface SessaoAberta {
    id: string;
    pautaId: string;
    dataAbertura?: string;
    dataFechamento?: string;
    dataEncerramento?: string;
}

export interface Feedback {
    tipo: 'sucesso' | 'erro';
    texto: string;
}

export type VotoValor = 'SIM' | 'NAO';