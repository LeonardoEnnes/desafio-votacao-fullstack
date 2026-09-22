import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pautaService } from '@/services/pautaService';
import { votoService } from '@/services/votoService';
import { calcularPercentuais, formatarData } from '@/utils/format';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, BarChart2, CheckCircle2, XCircle } from 'lucide-react';
import type { Pauta, ResultadoDto } from '@/types/pauta';

interface PautaVotacaoCardProps {
    pauta: Pauta;
    sessaoAberta: boolean;
    onVotoRealizado: () => void;
}

export function PautaVotacaoCard({ pauta, sessaoAberta, onVotoRealizado }: PautaVotacaoCardProps) {
    const navigate = useNavigate();
    const [resultado, setResultado] = useState<ResultadoDto | null>(null);
    const [cpfVoto, setCpfVoto] = useState('');
    const [votando, setVotando] = useState(false);
    const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

    const carregarResultado = async () => {
        try {
            const res = await pautaService.obterResultado(pauta.id);
            if (res) setResultado(res);
        } catch {
            // Silencia caso não tenha votos
        }
    };

    useEffect(() => {
        carregarResultado();
    }, [pauta.id]);

    const handleVotar = async (opcao: 'SIM' | 'NAO') => {
        if (votando) return;
        if (!cpfVoto.trim()) {
            setFeedback({ tipo: 'erro', texto: 'Informe o CPF para votar.' });
            return;
        }

        try {
            setVotando(true);
            setFeedback(null);
            await votoService.registrarVoto(pauta.id, {
                associadoCpf: cpfVoto.trim(),
                valor: opcao,
            });
            setFeedback({ tipo: 'sucesso', texto: `Voto "${opcao}" registrado com sucesso!` });
            setCpfVoto('');
            await carregarResultado();
            onVotoRealizado();
        } catch (error: any) {
            const status = error.response?.status;
            const mensagens: Record<number, string> = {
                404: 'CPF inválido ou não cadastrado.',
                409: 'Conflito: Voto já registrado ou CPF inapto.',
            };
            setFeedback({
                tipo: 'erro',
                texto: mensagens[status] ?? 'Erro ao registrar voto.',
            });
        } finally {
            setVotando(false);
        }
    };

    const { total, sim, nao, pctSim, pctNao } = calcularPercentuais(resultado);

    return (
        <Card className="hover:shadow-md transition-all duration-200 border-slate-200 flex flex-col h-full group">
            <CardHeader className="pb-2 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-xs">
                        Pauta
                    </Badge>

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
                    <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                        {pauta.descricao}
                    </p>
                )}

                {/* Bloco de Apuração Parcial */}
                {total > 0 && (
                    <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 space-y-1.5">
                        <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                            <span className="flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5 text-emerald-600" /> Apuração</span>
                            <span>{total} voto(s)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                            <div style={{ width: `${pctSim}%` }} className="bg-emerald-600 transition-all duration-500" />
                            <div style={{ width: `${pctNao}%` }} className="bg-rose-600 transition-all duration-500" />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                            <span className="text-emerald-700 font-semibold">SIM: {sim} ({pctSim}%)</span>
                            <span className="text-rose-700 font-semibold">NÃO: {nao} ({pctNao}%)</span>
                        </div>
                    </div>
                )}

                {/* Terminal de Votação Rápido (Aparece apenas se a sessão estiver aberta) */}
                {sessaoAberta ? (
                    <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-100 space-y-2 mt-auto">
                        <span className="text-xs font-semibold text-emerald-900 block">Terminal de Votação Rápida</span>
                        <Input
                            placeholder="Seu CPF (apenas números)"
                            value={cpfVoto}
                            onChange={(e) => setCpfVoto(e.target.value.replace(/\D/g, ''))}
                            maxLength={11}
                            disabled={votando}
                            className="bg-white h-8 text-xs border-emerald-200"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={() => handleVotar('SIM')}
                                disabled={!cpfVoto || votando}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 gap-1"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" /> SIM
                            </Button>
                            <Button
                                onClick={() => handleVotar('NAO')}
                                disabled={!cpfVoto || votando}
                                size="sm"
                                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-9 gap-1"
                            >
                                <XCircle className="w-3.5 h-3.5" /> NÃO
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-[11px] italic text-slate-400 mt-auto pt-1">
                        Sessão encerrada ou não iniciada para votação.
                    </p>
                )}

                {feedback && (
                    <div className={`p-2 rounded text-[11px] font-medium ${feedback.tipo === 'sucesso' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {feedback.texto}
                    </div>
                )}

                <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                    {pauta.dataCriacao && (
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Criada em: {formatarData(pauta.dataCriacao)}</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-2 mt-auto">
                <Button 
                    onClick={() => navigate(`/pauta/${pauta.id}`)}
                    variant="outline"
                    className="w-full border-slate-300 hover:bg-slate-50 hover:text-emerald-700 text-xs font-medium h-8"
                >
                    Gerenciar Sessão & Detalhes
                </Button>
            </CardFooter>
        </Card>
    );
}