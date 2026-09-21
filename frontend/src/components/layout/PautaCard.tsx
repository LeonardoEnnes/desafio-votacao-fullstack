import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface Pauta {
    id: string;
    titulo: string;
    descricao?: string;
}

interface PautaCardProps {
    pauta: Pauta;
}

export function PautaCard({ pauta }: PautaCardProps) {
    const navigate = useNavigate();
    const [copiado, setCopiado] = useState(false);

    function copiarId(e: React.MouseEvent) {
        e.stopPropagation();
        navigator.clipboard.writeText(pauta.id);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    }

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
                
                <p className="text-[11px] italic text-slate-400 mt-auto pt-2 border-t border-slate-100">
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