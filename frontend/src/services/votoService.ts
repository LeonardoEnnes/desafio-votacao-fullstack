import { api } from '@/lib/api';

export interface VotoPayload {
    associadoCpf: string;
    valor: 'SIM' | 'NAO';
}

export const votoService = {
    async registrarVoto(pautaId: string, payload: VotoPayload) {
        const { data } = await api.post(`/pautas/${pautaId}/votos`, payload);
        return data;
    }
};