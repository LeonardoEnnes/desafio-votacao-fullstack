import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { calcularPercentuais } from '@/utils/format';
import type { ResultadoDto } from '@/types/pauta';

interface ApuracaoCardProps {
    resultado: ResultadoDto | null;
    recarregar: () => void;
}

export function ApuracaoCard({ resultado, recarregar }: ApuracaoCardProps) {
    const { total, sim, nao, pctSim, pctNao } = calcularPercentuais(resultado);

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" /> Apuração de Resultados
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {resultado ? (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                            <span className="text-slate-600">Total de Votos:</span>
                            <strong className="text-slate-900">{total}</strong>
                        </div>

                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex my-2">
                            <div style={{ width: `${pctSim}%` }} className="bg-emerald-600 transition-all duration-500" />
                            <div style={{ width: `${pctNao}%` }} className="bg-rose-600 transition-all duration-500" />
                        </div>

                        <div className="flex justify-between items-center text-sm p-2 bg-emerald-50 rounded text-emerald-800">
                            <span>Votos SIM:</span>
                            <strong>{sim} ({pctSim}%)</strong>
                        </div>
                        <div className="flex justify-between items-center text-sm p-2 bg-rose-50 rounded text-rose-800">
                            <span>Votos NÃO:</span>
                            <strong>{nao} ({pctNao}%)</strong>
                        </div>
                        <div className="pt-2 text-center">
                            {total > 0 ? (
                                <Badge className={sim > nao ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}>
                                    {sim > nao ? 'Aprovada' : 'Rejeitada'}
                                </Badge>
                            ) : (
                                <Badge className="bg-slate-300 text-slate-700">Aguardando Votos</Badge>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-400 text-center py-8 italic">
                        Resultados consolidados aparecem aqui.
                    </p>
                )}
            </CardContent>
            <CardFooter>
                <Button type="button" onClick={recarregar} variant="outline" className="w-full text-xs text-slate-600">
                    Atualizar Apuração
                </Button>
            </CardFooter>
        </Card>
    );
}