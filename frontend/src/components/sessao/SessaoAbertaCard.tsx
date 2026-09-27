import { Clock, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SessaoAberta } from '@/types/pauta';

interface SessaoAbertaCardProps {
    sessao: SessaoAberta;
    pautaTitulo: string;
    onIrParaPauta: (id: string) => void;
}

export function SessaoAbertaCard({ sessao, pautaTitulo, onIrParaPauta }: SessaoAbertaCardProps) {
    const formatarDataSessao = (s: SessaoAberta) => {
        const raw = s.dataEncerramento ?? s.dataFechamento ?? s.dataAbertura;
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
    };

    return (
        <div className="bg-emerald-800/80 border border-emerald-700 p-4 rounded-lg flex flex-col justify-between gap-3 shadow-inner">
            <div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-300 font-mono mb-2 bg-emerald-950/50 w-fit px-2 py-1 rounded">
                    <Clock className="w-3.5 h-3.5" />
                    Encerra em: {formatarDataSessao(sessao)}
                </span>
                <h4 className="font-semibold text-white text-sm line-clamp-2 leading-snug">
                    {pautaTitulo}
                </h4>
            </div>
            <Button type="button" onClick={() => onIrParaPauta(sessao.pautaId)} size="sm" className="bg-white text-emerald-900 hover:bg-emerald-50 self-end gap-1.5 font-bold shadow-sm">
                Votar Agora <ArrowDown className="w-3.5 h-3.5" />
            </Button>
        </div>
    );
}