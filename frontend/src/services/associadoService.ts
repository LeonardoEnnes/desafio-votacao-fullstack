import { api } from '@/lib/api';

export interface AssociadoResponse {
    id: string;
    cpf: string;
}

export const associadoService = {
    async cadastrar(cpf: string): Promise<AssociadoResponse> {
        const { data } = await api.post('/associados', { cpf });
        return data;
    },
};