import { api } from '@/lib/api';
import type { Pauta, ResultadoDto } from '@/types/pauta';

export const pautaService = {
    async listarPautas(): Promise<Pauta[]> {
        const { data } = await api.get('/pautas');
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

    async listarSessoesAbertas() {
        const { data } = await api.get('/sessoes/abertas');
        return data;
    },

    async abrirSessao(pautaId: string, tempoEmMinutos: number) {
        const { data } = await api.post(`/pautas/${pautaId}/sessoes`, { tempoEmMinutos });
        return data;
    }
};