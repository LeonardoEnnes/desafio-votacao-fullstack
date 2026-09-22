export interface Pauta {
    id: string;
    titulo: string;
    descricao?: string;
    dataCriacao?: string;
    sessao?: {
        id: string;
        dataEncerramento: string;
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

export interface Feedback {
    tipo: 'sucesso' | 'erro';
    texto: string;
}