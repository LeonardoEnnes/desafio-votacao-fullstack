import { useParams, useNavigate } from 'react-router-dom';
import { usePautaDetalhe } from '@/hooks/usePautaDetalhes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { PautaHeader } from '@/components/pauta/PautaHeader';
import { SessaoCard } from '@/components/sessao/SessaoCard';
import { ApuracaoCard } from '@/components/voto/ApuracaoCard';

export function PautaPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        pauta, resultado, sessaoAberta, loading,
        minutosSessao, setMinutosSessao,
        feedback, abrindo, abrirSessao, recarregar,
    } = usePautaDetalhe(id);

    if (loading) {
        return (
            <div className="text-center py-20 animate-pulse text-emerald-600 font-semibold">
                Carregando...
            </div>
        );
    }

    if (!pauta) {
        return <div className="text-center py-20">Pauta não encontrada.</div>;
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
            <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="text-slate-600 gap-2 px-0 hover:bg-transparent"
            >
                <ArrowLeft className="w-4 h-4" /> Voltar para a listagem
            </Button>

            <Card className="border-slate-200 shadow-sm">
                <PautaHeader pauta={pauta} sessaoAberta={sessaoAberta} feedback={feedback} />
                <SessaoCard 
                    sessaoAberta={sessaoAberta}
                    minutosSessao={minutosSessao}
                    setMinutosSessao={setMinutosSessao}
                    abrindo={abrindo}
                    abrirSessao={abrirSessao}
                />
            </Card>

            <ApuracaoCard resultado={resultado} recarregar={recarregar} />
        </div>
    );
}