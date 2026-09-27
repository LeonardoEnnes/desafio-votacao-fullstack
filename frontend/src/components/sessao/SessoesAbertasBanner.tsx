import { useSessoesAbertas } from '@/hooks/useSessoesAbertas';
import { Card, CardContent } from '@/components/ui/card';
import { Radio, AlertCircle } from 'lucide-react';
import { SessaoAbertaCard } from './SessaoAbertaCard';
import type { Pauta } from '@/types/pauta';

interface BannerProps {
    pautasCadastradas: Pauta[];
}

export function SessoesAbertasBanner({ pautasCadastradas }: BannerProps) {
    const { sessoes, loading } = useSessoesAbertas();

    const obterTituloPauta = (pautaId: string) => {
        return pautasCadastradas.find((p) => p.id === pautaId)?.titulo ?? `Pauta #${pautaId.slice(0, 8)}`;
    };

    const irParaPauta = (pautaId: string) => {
        const el = document.getElementById(`pauta-${pautaId}`);

        if (!el) {
            console.warn(`Pauta ${pautaId} não encontrada no DOM.`);
            return;
        }

        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        el.classList.add('ring-2', 'ring-emerald-400', 'transition-all');
        setTimeout(() => {
            el.classList.remove('ring-2', 'ring-emerald-400');
        }, 1600);
    };

    return (
        <Card className="border-emerald-200 bg-emerald-900 text-white shadow-md mb-8">
            <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-emerald-800 pb-3">
                    <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <h3 className="font-bold text-lg tracking-tight">Assembleias com Votação Aberta</h3>
                </div>

                {loading ? (
                    <div className="text-sm text-emerald-300 py-4 text-center">Carregando sessões...</div>
                ) : sessoes.length === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-300/80 text-sm py-2">
                        <AlertCircle className="w-4 h-4 text-emerald-400" />
                        <span>Não há nenhuma sessão de votação aberta no momento.</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sessoes.map((sessao) => (
                            <SessaoAbertaCard
                                key={sessao.id}
                                sessao={sessao}
                                pautaTitulo={obterTituloPauta(sessao.pautaId)}
                                onIrParaPauta={irParaPauta}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}