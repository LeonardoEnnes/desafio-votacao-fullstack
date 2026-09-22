import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pautaService } from '@/services/pautaService';
import { calcularPercentuais, formatarData } from '@/utils/format';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart2 } from 'lucide-react';
import type { Pauta, ResultadoDto } from '@/types/pauta';

interface PautaCardProps {
    pauta: Pauta;
    sessaoAberta: boolean;
}

export function PautaCard({ pauta, sessaoAberta }: PautaCardProps) {
    const navigate = useNavigate();
    const [resultado, setResultado] = useState<ResultadoDto | null>(null);

    useEffect(() => {
        let ativo = true;
        pautaService.obterResultado(pauta.id)
            .then((res) => {
                if (ativo && res) setResultado(res);
            })
            .catch(() => {});

        return () => { ativo = false; };
    }, [pauta.id]);

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
                            <div style={{ width: `${pctSim}%` }} className="bg-emerald-600 transition-all duration-500" />
                            <div style={{ width: `${pctNao}%` }} className="bg-rose-600 transition-all duration-500" />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                            <span className="text-emerald-700 font-semibold">SIM: {sim} ({pctSim}%)</span>
                            <span className="text-rose-700 font-semibold">NÃO: {nao} ({pctNao}%)</span>
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