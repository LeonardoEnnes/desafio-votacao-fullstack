import { useState } from 'react';
import { associadoService } from '@/services/associadoService';
import { useAuthStore } from '@/stores/authStore';

export function useIdentificarAssociado() {
    const { cpfLogado, login, logout } = useAuthStore();
    const [input, setInput] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    async function identificar(e: React.FormEvent) {
        e.preventDefault();
        setErro('');

        const cpfLimpo = input.trim();
        if (!/^\d{11}$/.test(cpfLimpo)) {
            setErro('O CPF deve conter exatamente 11 dígitos numéricos.');
            return;
        }

        setLoading(true);
        try {
            await associadoService.cadastrar(cpfLimpo);
            login(cpfLimpo);
            setInput('');
        } catch (error: any) {
            if (error.response?.status === 409) {
                login(cpfLimpo);
                setInput('');
            } else {
                setErro('Erro ao validar CPF. Verifique os dados.');
            }
        } finally {
            setLoading(false);
        }
    }

    return { cpf: cpfLogado, input, setInput, erro, loading, identificar, sair: logout };
}