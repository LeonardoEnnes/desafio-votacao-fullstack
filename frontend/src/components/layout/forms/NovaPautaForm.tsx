import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pautaSchema, type PautaFormData } from '@/schemas/pautaSchema';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NovaPautaFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function NovaPautaForm({ onSuccess, onCancel }: NovaPautaFormProps) {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PautaFormData>({
        resolver: zodResolver(pautaSchema),
    });

    async function onSubmit(data: PautaFormData) {
        try {
            setLoading(true);
            await api.post('/pautas', {
                titulo: data.titulo,
                descricao: data.descricao || null,
            });
            onSuccess();
        } catch (error) {
            alert('Erro ao criar pauta.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título da Pauta *</label>
                <Input
                    {...register('titulo')}
                    placeholder="Ex: Aprovação de contas anuais"
                    className="border-slate-300 focus-visible:ring-emerald-600"
                />
                {errors.titulo && (
                    <span className="text-xs text-rose-600 font-medium mt-1 block">
                        {errors.titulo.message}
                    </span>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição (Opcional)</label>
                <textarea
                    {...register('descricao')}
                    placeholder="Detalhes adicionais sobre a pauta..."
                    className="w-full border border-slate-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[90px]"
                />
            </div>

            <div className="flex justify-end gap-2 pt-2">
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