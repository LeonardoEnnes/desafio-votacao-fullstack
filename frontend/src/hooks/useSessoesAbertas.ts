import { useState, useEffect, useCallback } from 'react';
import { pautaService } from '@/services/pautaService';

export function useSessoesAbertas() {
    const [sessoes, setSessoes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const carregarSessoes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await pautaService.listarSessoesAbertas();
            setSessoes(data);
        } catch {
            setSessoes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarSessoes();
    }, [carregarSessoes]);

    return { sessoes, loading, recarregar: carregarSessoes };
}