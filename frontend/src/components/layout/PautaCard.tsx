import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

    return (
        <Card className="hover:shadow-md transition-all duration-200 border-slate-200 flex flex-col h-full group">
            <CardHeader className="pb-2 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                        #{pauta.id}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">
                    </span>
                </div>
                
                <CardTitle className="text-lg font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                    {pauta.titulo}
                </CardTitle>
            </CardHeader>

            <CardContent className="py-2 flex-grow flex flex-col gap-3">
                {pauta.descricao && (
                    <p className="text-sm text-slate-700 line-clamp-3">
                        {pauta.descricao}
                    </p>
                )}
                
                <p className="text-xs text-slate-500 mt-auto pt-2 border-t border-slate-100">
                    Abra a sessão para registar o seu voto ou conferir a apuração.
                </p>
            </CardContent>

            <CardFooter className="pt-3 mt-auto">
                <Button 
                    onClick={() => navigate(`/pauta/${pauta.id}`)}
                    variant="outline"
                    className="w-full border-slate-300 hover:bg-slate-50 hover:text-emerald-700"
                >
                    Aceder ao Painel
                </Button>
            </CardFooter>
        </Card>
    );
}