import type { ResultadoDto } from '@/types/pauta';

export interface PercentuaisVotacao {
    total: number;
    sim: number;
    nao: number;
    pctSim: number;
    pctNao: number;
}

export function calcularPercentuais(r: ResultadoDto | null): PercentuaisVotacao {
    const total = r?.totalVotos ?? 0;
    const sim = r?.totalVotosSim ?? 0;
    const nao = r?.totalVotosNao ?? 0;

    return {
        total,
        sim,
        nao,
        pctSim: total ? Math.round((sim / total) * 100) : 0,
        pctNao: total ? Math.round((nao / total) * 100) : 0,
    };
}