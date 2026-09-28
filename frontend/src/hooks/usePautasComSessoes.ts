import { useCallback, useEffect, useState } from 'react';
import { pautaService } from '@/services/pautaService';
import type { Pauta } from '@/types/pauta';

export function usePautasComSessoes() {
    const [pautas, setPautas] = useState<Pauta[]>([]);
    const [sessoesAbertasIds, setSessoesAbertasIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const carregar = useCallback(async () => {
        setLoading(true);
        setErro(null);
        try {
            const [pautasData, sessoesData] = await Promise.all([
                pautaService.listarPautas(),
                pautaService.listarSessoesAbertas().catch(() => []),
            ]);

            const pautasOrdenadas = pautasData.sort((a, b) => {
                const dataA = new Date(a.dataCriacao || 0).getTime();
                const dataB = new Date(b.dataCriacao || 0).getTime();
                return dataB - dataA;
            });

            setPautas(pautasOrdenadas);
            setSessoesAbertasIds(sessoesData.map((s) => s.pautaId));
        } catch (e) {
            console.error('Erro ao buscar dados:', e);
            setErro('Não foi possível carregar as pautas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    return { pautas, sessoesAbertasIds, loading, erro, recarregar: carregar };
}