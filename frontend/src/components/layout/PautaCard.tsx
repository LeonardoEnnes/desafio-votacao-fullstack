import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Calendar, BarChart2 } from 'lucide-react';

interface Pauta {
    id: string;
    titulo: string;
    descricao?: string;
    dataCriacao?: string;
}

interface PautaCardProps {
    pauta: Pauta;
}

export function PautaCard({ pauta }: PautaCardProps) {
    const navigate = useNavigate();
    const [copiado, setCopiado] = useState(false);
    const [sessaoAberta, setSessaoAberta] = useState(false);
    const [resultado, setResultado] = useState<{ totalVotos: number; votosSim: number; votosNao: number } | null>(null);

    const verificarStatusESessao = async () => {
        try {
            const resSessoes = await api.get('/sessoes/abertas');
            const aberta = resSessoes.data.some((s: any) => s.pautaId === pauta.id);
            setSessaoAberta(aberta);

            const resResultado = await api.get(`/pautas/${pauta.id}/resultado`);
            if (resResultado.data) {
                setResultado(resResultado.data);
            }
        } catch {
            // Silenciando erro
        }
    };

    useEffect(() => {
        verificarStatusESessao();
    }, [pauta.id]);

    function copiarId(e: React.MouseEvent) {
        e.stopPropagation();
        navigator.clipboard.writeText(pauta.id);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    }

    const formatarData = (dataStr?: string) => {
        if (!dataStr) return null;
        try {
            return new Intl.DateTimeFormat('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
            }).format(new Date(dataStr));
        } catch {
            return dataStr;
        }
    };

    const total = resultado?.totalVotos || 0;
    const pctSim = total > 0 ? Math.round(((resultado?.votosSim || 0) / total) * 100) : 0;
    const pctNao = total > 0 ? Math.round(((resultado?.votosNao || 0) / total) * 100) : 0;

    return (
        <Card className="hover:shadow-md transition-all duration-200 border-slate-200 flex flex-col h-full group">
            <CardHeader className="pb-2 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 transition-colors px-2 py-0.5 rounded-md text-xs font-mono text-slate-600">
                        <span>#{pauta.id.slice(0, 8)}...</span>
                        <button 
                            onClick={copiarId}
                            title="Copiar ID completo"
                            className="text-slate-400 hover:text-slate-700 focus:outline-none"
                        >
                            {copiado ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                                <Copy className="w-3.5 h-3.5" />
                            )}
                        </button>
                    </div>

                    {sessaoAberta ? (
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            Sessão Aberta
                        </span>
                    ) : (
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            Sessão Fechada
                        </span>
                    )}
                </div>
                
                <CardTitle className="text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                    {pauta.titulo}
                </CardTitle>
            </CardHeader>

            <CardContent className="py-2 flex-grow flex flex-col gap-3">
                {pauta.descricao && (
                    <p className="text-base text-slate-800 line-clamp-3 leading-relaxed">
                        {pauta.descricao}
                    </p>
                )}

                {total > 0 && (
                    <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 space-y-1.5 mt-1">
                        <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                            <span className="flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5 text-emerald-600" /> Apuração Parcial</span>
                            <span>{total} voto(s)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                            <div style={{ width: `${pctSim}%` }} className="bg-emerald-600 transition-all duration-500" title={`Sim: ${pctSim}%`} />
                            <div style={{ width: `${pctNao}%` }} className="bg-rose-600 transition-all duration-500" title={`Não: ${pctNao}%`} />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                            <span className="text-emerald-700 font-semibold">SIM: {resultado?.votosSim} ({pctSim}%)</span>
                            <span className="text-rose-700 font-semibold">NÃO: {resultado?.votosNao} ({pctNao}%)</span>
                        </div>
                    </div>
                )}

                <div className="text-xs text-slate-500 space-y-1 mt-auto pt-2 border-t border-slate-100">
                    {pauta.dataCriacao && (
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Criada em: {formatarData(pauta.dataCriacao)}</span>
                        </div>
                    )}
                </div>
                
                <p className="text-[10px] italic text-slate-400 pt-1">
                    Abra a sessão para registar o seu voto ou conferir a apuração.
                </p>
            </CardContent>

            <CardFooter className="pt-3 mt-auto">
                <Button 
                    onClick={() => navigate(`/pauta/${pauta.id}`)}
                    variant="outline"
                    className="w-full border-slate-300 hover:bg-slate-50 hover:text-emerald-700 text-sm font-medium"
                >
                    Acesse o Painel
                </Button>
            </CardFooter>
        </Card>
    );
}