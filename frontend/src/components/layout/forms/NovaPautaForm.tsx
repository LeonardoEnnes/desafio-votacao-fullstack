import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface NovaPautaFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function NovaPautaForm({ onSuccess, onCancel }: NovaPautaFormProps) {
    const [descricao, setDescricao] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleCriarPauta(e: React.FormEvent) {
        e.preventDefault();
        if (!descricao.trim()) return;
        
        try {
            setLoading(true);
            await api.post('/pautas', { descricao: descricao.trim() });
            onSuccess();
        } catch (error) {
            alert('Erro ao criar pauta.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleCriarPauta}>
            <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Aprovação de novas políticas internas..."
                className="w-full border border-slate-300 rounded-md p-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[100px]"
                required
            />
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Pauta'}
                </Button>
            </div>
        </form>
    );
}