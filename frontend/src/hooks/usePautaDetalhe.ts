import { useCallback, useEffect, useState } from 'react';
import { pautaService } from '@/services/pautaService';
import { votoService } from '@/services/votoService';
import { getApiErrorMessage } from '@/utils/errorMessages';
import type { Pauta, ResultadoDto, Feedback, VotoValor } from '@/types/pauta';

export function usePautaDetalhe(id?: string) {
    const [pauta, setPauta] = useState<Pauta | null>(null);
    const [resultado, setResultado] = useState<ResultadoDto | null>(null);
    const [sessaoAberta, setSessaoAberta] = useState(false);
    const [loading, setLoading] = useState(true);
    const [minutosSessao, setMinutosSessao] = useState('1');
    const [cpfVoto, setCpfVoto] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [votando, setVotando] = useState(false);
    const [abrindo, setAbrindo] = useState(false);
    const [jaTeveSessao, setJaTeveSessao] = useState(false);

    const carregarDados = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const [p, res] = await Promise.all([
                pautaService.buscarPorId(id),
                pautaService.obterResultado(id).catch(() => null),
            ]);

            setPauta(p);
            setResultado(res);

            if (p.sessao) {
                setJaTeveSessao(true);
                setSessaoAberta(Boolean(p.sessao.aberta));
            } else {
                const sessoes = await pautaService.listarSessoesAbertas().catch(() => []);
                setSessaoAberta(sessoes.some((s) => s.pautaId === id));
            }
        } catch (error: any) {
            const status = error.response?.status;
            if (status === 409) setJaTeveSessao(true);
            setFeedback({
                tipo: 'erro',
                texto: getApiErrorMessage(
                    status,
                    'Erro ao abrir sessão.',
                    error.response?.data
                ),
            });
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    async function abrirSessao() {
        if (!id || abrindo) return;
        setAbrindo(true);
        try {
            setFeedback(null);
            const minutos = Math.max(1, parseInt(minutosSessao) || 1);
            await pautaService.abrirSessao(id, minutos);
            setFeedback({ tipo: 'sucesso', texto: 'Sessão aberta com sucesso!' });
            setJaTeveSessao(true);
            await carregarDados();
        } catch (error: any) {
            const status = error.response?.status;
            if (status === 409) setJaTeveSessao(true);
            setFeedback({
                tipo: 'erro',
                texto: getApiErrorMessage(status, 'Erro ao abrir sessão.'),
            });
        } finally {
            setAbrindo(false);
        }
    }

    async function votar(opcao: VotoValor) {
        if (!id || votando) return;

        if (!cpfVoto.trim()) {
            setFeedback({ tipo: 'erro', texto: 'Por favor, informe o CPF.' });
            return;
        }

        setVotando(true);
        try {
            setFeedback(null);
            await votoService.registrarVoto(id, { associadoCpf: cpfVoto.trim(), valor: opcao });
            setFeedback({ tipo: 'sucesso', texto: `Voto "${opcao}" registrado com sucesso!` });
            setCpfVoto('');
            await carregarDados();
        } catch (error: any) {
            setFeedback({
            tipo: 'erro',
            texto: getApiErrorMessage(
                error.response?.status,
                'Erro ao registrar voto.',
                error.response?.data
            ),
        });
        } finally {
            setVotando(false);
        }
    }

    return {
        pauta, resultado, sessaoAberta, jaTeveSessao, loading,
        minutosSessao, setMinutosSessao, cpfVoto, setCpfVoto,
        feedback, votando, abrindo, abrirSessao, votar, recarregar: carregarDados,
    };
}