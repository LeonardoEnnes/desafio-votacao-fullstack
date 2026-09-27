import { BarChart2 } from 'lucide-react';
import { calcularPercentuais } from '@/utils/format';
import type { ResultadoDto } from '@/types/pauta';

interface VotacaoProgressoProps {
    resultado: ResultadoDto | null;
}

export function VotacaoProgresso({ resultado }: VotacaoProgressoProps) {
    const { total, sim, nao, pctSim, pctNao } = calcularPercentuais(resultado);

    if (total === 0) return null;

    return (
        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                    <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
                    Apuração Parcial
                </span>
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
    );
}