import { NovaPautaForm } from '@/components/layout/forms/NovaPautaForm';

interface NovaPautaModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function NovaPautaModal({ onClose, onSuccess }: NovaPautaModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                <h3 className="text-lg font-bold mb-2">Cadastrar Nova Pauta</h3>
                <p className="text-sm text-slate-500 mb-4">Insira a descrição do tópico a ser votado.</p>
                
                <NovaPautaForm 
                    onSuccess={() => {
                        onSuccess();
                        onClose();
                    }}
                    onCancel={onClose}
                />
            </div>
        </div>
    );
}