import { useState, useEffect, useCallback } from 'react';
import { pautaService } from '@/services/pautaService';
import { votoService } from '@/services/votoService';
import type { Pauta, ResultadoDto, Feedback } from '@/types/pauta';

export function usePautaDetalhe(id?: string) {
    const [pauta, setPauta] = useState<Pauta | null>(null);
    const [resultado, setResultado] = useState<ResultadoDto | null>(null);
    const [sessaoAberta, setSessaoAberta] = useState(false);
    const [loading, setLoading] = useState(true);
    const [minutosSessao, setMinutosSessao] = useState('1');
    const [cpfVoto, setCpfVoto] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const carregarDados = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const [p, sessoes, res] = await Promise.all([
                pautaService.buscarPorId(id),
                pautaService.listarSessoesAbertas().catch(() => []),
                pautaService.obterResultado(id).catch(() => null),
            ]);

            setPauta(p);
            const aberta = sessoes.some((s: any) => s.pautaId === id || s.id === p.sessao?.id);
            setSessaoAberta(aberta || Boolean(p.sessao?.aberta));
            setResultado(res);
        } catch (error) {
            console.error('Erro ao carregar pauta:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    async function abrirSessao() {
        if (!id) return;
        try {
            setFeedback(null);
            await pautaService.abrirSessao(id, parseInt(minutosSessao) || 1);
            setFeedback({ tipo: 'sucesso', texto: 'Sessão aberta com sucesso!' });
            await carregarDados();
        } catch (error: any) {
            const status = error.response?.status;
            setFeedback({
                tipo: 'erro',
                texto: status === 409 ? 'Já existe uma sessão aberta para esta pauta.' : 'Erro ao abrir sessão.',
            });
        }
    }

    async function votar(opcao: 'SIM' | 'NAO') {
        if (!id || !cpfVoto.trim()) {
            setFeedback({ tipo: 'erro', texto: 'Por favor, informe o CPF.' });
            return;
        }

        try {
            setFeedback(null);
            await votoService.registrarVoto(id, { associadoCpf: cpfVoto.trim(), valor: opcao });
            setFeedback({ tipo: 'sucesso', texto: `Voto "${opcao}" registrado com sucesso!` });
            setCpfVoto('');
            await carregarDados();
        } catch (error: any) {
            const status = error.response?.status;
            const mensagens: Record<number, string> = {
                404: 'CPF não encontrado ou inválido no sistema.',
                409: 'Conflito: Você já votou ou CPF inapto a votar.',
            };
            setFeedback({
                tipo: 'erro',
                texto: mensagens[status] ?? 'Erro ao registrar voto.',
            });
        }
    }

    return {
        pauta,
        resultado,
        sessaoAberta,
        loading,
        minutosSessao,
        setMinutosSessao,
        cpfVoto,
        setCpfVoto,
        feedback,
        abrirSessao,
        votar,
        recarregar: carregarDados,
    };
}