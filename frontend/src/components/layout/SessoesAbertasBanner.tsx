import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, ArrowRight, Clock, AlertCircle } from 'lucide-react';

interface PautaRef {
    id: string;
    titulo: string;
}

interface SessaoAberta {
    id: string;
    pautaId: string;
    dataEncerramento?: any;
    dataFechamento?: any;
    dataFim?: any;
}

interface BannerProps {
    pautasCadastradas: PautaRef[];
}

export function SessoesAbertasBanner({ pautasCadastradas }: BannerProps) {
    const navigate = useNavigate();
    const [sessoesAbertas, setSessoesAbertas] = useState<SessaoAberta[]>([]);
    const [loading, setLoading] = useState(true);

    const carregarSessoesAbertas = async () => {
        try {
            setLoading(true);
            const response = await api.get('/sessoes/abertas');
            setSessoesAbertas(response.data);
        } catch (error) {
            console.error('Erro ao buscar sessões abertas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarSessoesAbertas();
    }, []);

    const formatarData = (sessao: SessaoAberta) => {
        const rawDate = sessao.dataEncerramento || sessao.dataFechamento || sessao.dataFim;
        if (!rawDate) return 'Data não informada';

        try {
            if (Array.isArray(rawDate)) {
                const [ano, mes, dia, hora, min, seg] = rawDate;
                const dateObj = new Date(ano, mes - 1, dia, hora || 0, min || 0, seg || 0);
                return dateObj.toLocaleString('pt-BR');
            }
            return new Date(rawDate).toLocaleString('pt-BR');
        } catch {
            return 'Data inválida';
        }
    };

    const obterTituloPauta = (pautaId: string) => {
        const pautaEncontrada = pautasCadastradas.find(p => p.id === pautaId);
        return pautaEncontrada ? pautaEncontrada.titulo : `Pauta #${pautaId.slice(0, 8)}`;
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
                                        Encerra em: {formatarData(sessao)}
                                    </span>
                                    <h4 className="font-semibold text-white text-sm line-clamp-2 leading-snug">
                                        {obterTituloPauta(sessao.pautaId)}
                                    </h4>
                                </div>

                                <Button 
                                    onClick={() => navigate(`/pauta/${sessao.pautaId}`)}
                                    size="sm"
                                    className="bg-white text-emerald-900 hover:bg-emerald-50 self-end gap-1.5 font-bold shadow-sm"
                                >
                                    Votar Agora <ArrowRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}