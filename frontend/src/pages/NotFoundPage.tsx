import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-full">
                <AlertCircle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Página não encontrada</h1>
            <p className="text-slate-500 max-w-sm text-sm">
                A página que estás a procurar não existe ou foi removida.
            </p>
            <Button
                onClick={() => navigate('/')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 mt-2"
            >
                <Home className="w-4 h-4" /> Voltar para a Início
            </Button>
        </div>
    );
}