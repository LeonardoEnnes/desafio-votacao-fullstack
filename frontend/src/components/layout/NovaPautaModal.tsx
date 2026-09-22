import { useEffect } from 'react';
import { NovaPautaForm } from '@/components/layout/forms/NovaPautaForm';

interface NovaPautaModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function NovaPautaModal({ onClose, onSuccess }: NovaPautaModalProps) {
    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onEsc);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onEsc);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="nova-pauta-titulo"
        >
            <div
                className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 id="nova-pauta-titulo" className="text-lg font-bold mb-2 text-slate-900">Cadastrar Nova Pauta</h3>
                <p className="text-sm text-slate-500 mb-4">Insira as informações do tópico a ser deliberado.</p>
                
                <NovaPautaForm
                    onSuccess={() => { onSuccess(); onClose(); }}
                    onCancel={onClose}
                />
            </div>
        </div>
    );
}