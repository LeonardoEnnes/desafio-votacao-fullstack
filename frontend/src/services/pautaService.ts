import { api } from '@/lib/api';
import type { Pauta, ResultadoDto, SessaoAberta } from '@/types/pauta';

export interface CriarPautaPayload {
    titulo: string;
    descricao?: string;
}

export const pautaService = {
    async listarPautas(): Promise<Pauta[]> {
        const { data } = await api.get('/pautas');
        return data;
    },

    async criarPauta(payload: CriarPautaPayload): Promise<Pauta> {
        const { data } = await api.post('/pautas', payload);
        return data;
    },

    async buscarPorId(id: string): Promise<Pauta> {
        const { data } = await api.get(`/pautas/${id}`);
        return data;
    },

    async obterResultado(id: string): Promise<ResultadoDto> {
        const { data } = await api.get(`/pautas/${id}/resultado`);
        return data;
    },

    async listarSessoesAbertas(): Promise<SessaoAberta[]> {
        const { data } = await api.get('/sessoes/abertas');
        return data;
    },

    async abrirSessao(pautaId: string, tempoEmMinutos: number): Promise<SessaoAberta> {
        const { data } = await api.post(`/pautas/${pautaId}/sessoes`, { tempoEmMinutos });
        return data;
    },
};