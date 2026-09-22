import { api } from '@/lib/api';
import type { VotoValor } from '@/types/pauta';

export interface VotoPayload {
    associadoCpf: string;
    valor: VotoValor;
}

export interface VotoResponse {
    id: string;
    pautaId: string;
    associadoCpf: string;
    valor: VotoValor;
    dataVoto: string;
}

export const votoService = {
    async registrarVoto(pautaId: string, payload: VotoPayload): Promise<VotoResponse> {
        const { data } = await api.post(`/pautas/${pautaId}/votos`, payload);
        return data;
    },
};