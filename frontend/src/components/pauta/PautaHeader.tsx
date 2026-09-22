import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { formatarData } from '@/utils/format';
import type { Pauta } from '@/types/pauta';

interface PautaHeaderProps {
    pauta: Pauta;
    sessaoAberta: boolean;
    feedback?: { tipo: 'sucesso' | 'erro'; texto: string } | null;
}

export function PautaHeader({ pauta, sessaoAberta, feedback }: PautaHeaderProps) {
    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader>
                <Badge variant="outline" className="w-fit border-emerald-200 text-emerald-700 bg-emerald-50 font-mono mb-2">
                    ID: {pauta.id}
                </Badge>
                <CardTitle className="text-2xl font-bold text-slate-900 leading-tight">
                    {pauta.titulo}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {pauta.descricao && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <span className="text-xs font-semibold text-slate-400 block mb-1">
                            Descrição detalhada:
                        </span>
                        <p className="text-slate-700 text-base leading-relaxed">
                            {pauta.descricao}
                        </p>
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-emerald-600" />
                        <div>
                            <span className="text-xs text-slate-500 block">Status da Sessão:</span>
                            <strong className="text-sm text-slate-800">
                                {sessaoAberta ? 'Aberta para recebimento de votos' : 'Sessão Encerrada ou Não Iniciada'}
                            </strong>
                        </div>
                    </div>

                    {pauta.sessao?.dataEncerramento && (
                        <div className="text-xs text-slate-600">
                            Encerramento: <strong>{formatarData(pauta.sessao.dataEncerramento)}</strong>
                        </div>
                    )}
                </div>

                {feedback && (
                    <div className={`p-3 rounded-md text-sm font-medium ${
                        feedback.tipo === 'sucesso'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                        {feedback.texto}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}