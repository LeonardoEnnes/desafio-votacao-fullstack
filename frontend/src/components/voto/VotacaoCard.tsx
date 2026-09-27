import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pautaService } from '@/services/pautaService';
import { votoService } from '@/services/votoService';
import { getApiErrorMessage } from '@/utils/errorMessages';
import { formatarData } from '@/utils/date';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { VotacaoProgresso } from './VotacaoProgresso';
import type { Pauta, ResultadoDto } from '@/types/pauta';

interface PautaVotacaoCardProps {
    pauta: Pauta;
    sessaoAberta: boolean;
    onVotoRealizado: () => void;
}

export function VotacaoCard({ pauta, sessaoAberta, onVotoRealizado }: PautaVotacaoCardProps) {
    const navigate = useNavigate();
    const { cpfLogado } = useAuthStore();
    const [resultado, setResultado] = useState<ResultadoDto | null>(null);
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
        if (votando || !cpfLogado) return;

        try {
            setVotando(true);
            setFeedback(null);
            await votoService.registrarVoto(pauta.id, { associadoCpf: cpfLogado, valor: opcao });
            setFeedback({ tipo: 'sucesso', texto: `Voto "${opcao}" registrado com sucesso!` });
            await carregarResultado();
            onVotoRealizado();
        } catch (error: any) {
            setFeedback({
                tipo: 'erro',
                texto: getApiErrorMessage(error.response?.status, 'Erro ao registrar voto.'),
            });
        } finally {
            setVotando(false);
        }
    };

    return (
        <Card 
            id={`pauta-${pauta.id}`}  
            className="hover:shadow-md transition-all duration-200 border-slate-200 flex flex-col h-full group">
            <CardHeader className="pb-2 flex flex-col gap-2">
                <div className="flex justify-between items-center">
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

                <VotacaoProgresso resultado={resultado} />

                {sessaoAberta ? (
                    <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-100 space-y-2 mt-auto">
                        {!cpfLogado ? (
                            <div className="flex flex-col items-center justify-center text-center py-2 gap-2 text-slate-500">
                                <AlertCircle className="w-5 h-5 text-emerald-600/50" />
                                <span className="text-xs">Identifique-se na Área do Associado para votar.</span>
                            </div>
                        ) : (
                            <>
                                <span className="text-xs font-semibold text-emerald-900 block text-center mb-2">Registrar Voto</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button onClick={() => handleVotar('SIM')} disabled={votando} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> SIM
                                    </Button>
                                    <Button onClick={() => handleVotar('NAO')} disabled={votando} size="sm" className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-9 gap-1">
                                        <XCircle className="w-3.5 h-3.5" /> NÃO
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <p className="text-[11px] italic text-slate-400 mt-auto pt-1">Sessão encerrada ou não iniciada.</p>
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
                            <span>Criada a: {formatarData(pauta.dataCriacao)}</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-2 mt-auto">
                <Button onClick={() => navigate(`/pauta/${pauta.id}`)} variant="outline" className="w-full border-slate-300 hover:bg-slate-50 hover:text-emerald-700 text-xs font-medium h-8">
                    Gerir Sessão
                </Button>
            </CardFooter>
        </Card>
    );
}