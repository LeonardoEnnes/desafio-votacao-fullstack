import { useEffect, useState } from 'react';
import { pautaService } from '@/services/pautaService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, ArrowRight, Clock, AlertCircle, ArrowDown } from 'lucide-react';
import type { Pauta, SessaoAberta } from '@/types/pauta';

interface BannerProps {
    pautasCadastradas: Pauta[];
}

export function SessoesAbertasBanner({ pautasCadastradas }: BannerProps) {
    const [sessoesAbertas, setSessoesAbertas] = useState<SessaoAberta[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ativo = true;
        (async () => {
            try {
                setLoading(true);
                const data = await pautaService.listarSessoesAbertas();
                if (ativo) setSessoesAbertas(data);
            } catch (error) {
                console.error('Erro ao buscar sessões abertas:', error);
                if (ativo) setSessoesAbertas([]);
            } finally {
                if (ativo) setLoading(false);
            }
        })();
        return () => {
            ativo = false;
        };
    }, []);

    function formatarDataSessao(sessao: SessaoAberta): string {
        const raw =
            sessao.dataEncerramento ??
            sessao.dataFechamento ??
            sessao.dataAbertura;

        if (!raw) return 'Data não informada';

        try {
            if (Array.isArray(raw)) {
                const [ano, mes, dia, hora = 0, min = 0, seg = 0] = raw;
                return new Date(ano, mes - 1, dia, hora, min, seg).toLocaleString('pt-BR');
            }
            return new Date(raw).toLocaleString('pt-BR');
        } catch {
            return 'Data inválida';
        }
    }

    function obterTituloPauta(pautaId: string): string {
        const pauta = pautasCadastradas.find((p) => p.id === pautaId);
        return pauta?.titulo ?? `Pauta #${pautaId.slice(0, 8)}`;
    }

    function irParaPauta(pautaId: string) {
        const el = document.getElementById(`pauta-${pautaId}`);
        if (!el) return;

        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Highlight temporário
        el.classList.add('ring-2', 'ring-emerald-400', 'ring-offset-2', 'transition-all');
        setTimeout(() => {
            el.classList.remove('ring-2', 'ring-emerald-400', 'ring-offset-2');
        }, 1600);
    }

    return (
        <Card className="border-emerald-200 bg-emerald-900 text-white shadow-md mb-8">
            <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-emerald-800 pb-3">
                    <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <h3 className="font-bold text-lg tracking-tight">
                        Assembleias com Votação Aberta
                    </h3>
                </div>

                {loading ? (
                    <div className="text-sm text-emerald-300 py-4 text-center">
                        Carregando sessões...
                    </div>
                ) : sessoesAbertas.length === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-300/80 text-sm py-2">
                        <AlertCircle className="w-4 h-4 text-emerald-400" />
                        <span>Não há nenhuma sessão de votação aberta no momento.</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sessoesAbertas.map((sessao) => (
                            <div
                                key={sessao.id}
                                className="bg-emerald-800/80 border border-emerald-700 p-4 rounded-lg flex flex-col justify-between gap-3 shadow-inner"
                            >
                                <div>
                                    <span className="flex items-center gap-1.5 text-xs text-emerald-300 font-mono mb-2 bg-emerald-950/50 w-fit px-2 py-1 rounded">
                                        <Clock className="w-3.5 h-3.5" />
                                        Encerra em: {formatarDataSessao(sessao)}
                                    </span>
                                    <h4 className="font-semibold text-white text-sm line-clamp-2 leading-snug">
                                        {obterTituloPauta(sessao.pautaId)}
                                    </h4>
                                </div>

                                <Button
                                    type="button"
                                    onClick={() => irParaPauta(sessao.pautaId)}
                                    size="sm"
                                    className="bg-white text-emerald-900 hover:bg-emerald-50 self-end gap-1.5 font-bold shadow-sm"
                                >
                                    Votar Agora <ArrowDown className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}