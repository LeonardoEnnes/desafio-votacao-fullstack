import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlayCircle } from 'lucide-react';

interface SessaoCardProps {
    sessaoAberta: boolean;
    minutosSessao: string;
    setMinutosSessao: (v: string) => void;
    abrindo: boolean;
    abrirSessao: () => void;
}

export function SessaoCard({ sessaoAberta, minutosSessao, setMinutosSessao, abrindo, abrirSessao }: SessaoCardProps) {
    return (
        <CardFooter className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex justify-between items-center rounded-b-lg">
            {!sessaoAberta ? (
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Tempo (min):</span>
                        <Input
                            type="number"
                            value={minutosSessao}
                            onChange={(e) => setMinutosSessao(e.target.value)}
                            className="w-20 h-9 bg-white"
                            min="1"
                            disabled={abrindo}
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={abrirSessao}
                        disabled={abrindo}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    >
                        <PlayCircle className="w-4 h-4" />
                        {abrindo ? 'Abrindo...' : 'Abrir Sessão'}
                    </Button>
                </div>
            ) : (
                <span className="text-xs font-semibold text-emerald-700">
                    Sessão ativa. Os votos podem ser realizados diretamente na página inicial.
                </span>
            )}
        </CardFooter>
    );
}