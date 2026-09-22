import { useCallback, useEffect, useState } from 'react';
import { pautaService } from '@/services/pautaService';
import { votoService } from '@/services/votoService';
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
                setSessaoAberta(Boolean(p.sessao.aberta));
            } else {
                const sessoes = await pautaService.listarSessoesAbertas().catch(() => []);
                setSessaoAberta(sessoes.some((s) => s.pautaId === id));
            }
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
        if (!id || abrindo) return;
        setAbrindo(true);
        try {
            setFeedback(null);
            const minutos = Math.max(1, parseInt(minutosSessao) || 1);
            await pautaService.abrirSessao(id, minutos);
            setFeedback({ tipo: 'sucesso', texto: 'Sessão aberta com sucesso!' });
            await carregarDados();
        } catch (error: any) {
            const status = error.response?.status;
            setFeedback({
                tipo: 'erro',
                texto: status === 409
                    ? 'Já existe uma sessão aberta para esta pauta.'
                    : 'Erro ao abrir sessão.',
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
            const status = error.response?.status;
            const mensagens: Record<number, string> = {
                404: 'CPF não encontrado ou inválido no sistema.',
                409: 'Você já votou nesta pauta ou o CPF está inapto a votar.',
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
        pauta,
        resultado,
        sessaoAberta,
        loading,
        minutosSessao,
        setMinutosSessao,
        cpfVoto,
        setCpfVoto,
        feedback,
        votando,
        abrindo,
        abrirSessao,
        votar,
        recarregar: carregarDados,
    };
}