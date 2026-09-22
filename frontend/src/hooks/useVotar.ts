import { useState } from 'react';
import { votoService } from '@/services/votoService';
import type { Feedback, VotoValor } from '@/types/pauta';

export function useVotar(pautaId: string, onSuccess: () => void) {
    const [cpf, setCpf] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [votando, setVotando] = useState(false);

    function limparFeedback() {
        setFeedback(null);
    }

    async function votar(valor: VotoValor) {
        if (votando) return;

        const cpfLimpo = cpf.trim();
        if (!/^\d{11}$/.test(cpfLimpo)) {
            setFeedback({ tipo: 'erro', texto: 'Informe um CPF com 11 dígitos.' });
            return;
        }

        setVotando(true);
        setFeedback(null);
        try {
            await votoService.registrarVoto(pautaId, {
                associadoCpf: cpfLimpo,
                valor,
            });
            setFeedback({ tipo: 'sucesso', texto: `Voto "${valor}" registrado!` });
            setCpf('');
            onSuccess();
        } catch (error: any) {
            const status = error.response?.status;
            const mensagens: Record<number, string> = {
                404: 'CPF inválido ou inapto a votar.',
                409: 'Você já votou nesta pauta.',
            };
            setFeedback({
                tipo: 'erro',
                texto: mensagens[status] ?? 'Erro ao registrar voto.',
            });
        } finally {
            setVotando(false);
        }
    }

    return {
        cpf,
        setCpf,
        feedback,
        votando,
        votar,
        limparFeedback,
    };
}