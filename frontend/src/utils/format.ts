import type { ResultadoDto } from '@/types/pauta';

export function formatarData(dataStr?: string): string | null {
    if (!dataStr) return null;
    try {
        return new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(new Date(dataStr));
    } catch {
        return dataStr;
    }
}

export function calcularPercentuais(r: ResultadoDto | null) {
    const total = r?.totalVotos || 0;
    const sim = r?.totalVotosSim || 0;
    const nao = r?.totalVotosNao || 0;

    return {
        total,
        sim,
        nao,
        pctSim: total ? Math.round((sim / total) * 100) : 0,
        pctNao: total ? Math.round((nao / total) * 100) : 0,
    };
}

export function mascararCpf(cpf: string): string {
    if (!cpf || cpf.length !== 11) return '***.***.***-**';
    return `***.***.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
}