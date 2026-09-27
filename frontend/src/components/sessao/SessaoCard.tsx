import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlayCircle, AlertCircle, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface SessaoCardProps {
    sessaoAberta: boolean;
    jaTeveSessao: boolean;
    minutosSessao: string;
    setMinutosSessao: (v: string) => void;
    abrindo: boolean;
    abrirSessao: () => void;
}

export function SessaoCard({ 
    sessaoAberta, 
    jaTeveSessao,
    minutosSessao, 
    setMinutosSessao, 
    abrindo, 
    abrirSessao 
}: SessaoCardProps) {
    const { cpfLogado } = useAuthStore();

    return (
        <div className="bg-slate-50/80 border-t border-slate-100 px-6 py-4 flex flex-wrap justify-between items-center gap-4 mt-auto rounded-b-xl">
            
            {jaTeveSessao && !sessaoAberta ? (
                <div className="flex items-center gap-2 text-slate-500 text-xs w-full justify-center py-1">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Sessão já realizada e encerrada. Não é possível reabrir.</span>
                </div>
            ) 
            
            : sessaoAberta ? (
                <span className="text-xs font-semibold text-emerald-700 w-full text-center sm:text-left">
                    Sessão ativa. Os votos podem ser realizados diretamente na página inicial.
                </span>
            ) 
            
            : !cpfLogado ? (
                <div className="flex items-center gap-2 text-slate-500 text-xs w-full justify-center py-1">
                    <AlertCircle className="w-4 h-4 text-emerald-600" />
                    <span>Identifique-se na Área do Associado para poder abrir esta sessão.</span>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 font-medium">Tempo da Sessão (min):</span>
                        <Input
                            type="number"
                            value={minutosSessao}
                            onChange={(e) => setMinutosSessao(e.target.value)}
                            className="w-24 h-9 bg-white border-slate-300"
                            min="1"
                            disabled={abrindo}
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={abrirSessao}
                        disabled={abrindo}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
                    >
                        <PlayCircle className="w-4 h-4" />
                        {abrindo ? 'Abrindo...' : 'Abrir Sessão'}
                    </Button>
                </div>
            )}
        </div>
    );
}