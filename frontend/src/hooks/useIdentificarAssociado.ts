import { useState } from 'react';
import { associadoService } from '@/services/associadoService';

const STORAGE_KEY = '@votacao:cpf';

export function useIdentificarAssociado() {
    const [cpf, setCpf] = useState(localStorage.getItem(STORAGE_KEY) ?? '');
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
            salvar(cpfLimpo);
        } catch (error: any) {
            // 409 = já cadastrado → considera logado
            if (error.response?.status === 409) {
                salvar(cpfLimpo);
            } else {
                setErro('Erro ao validar CPF. Verifique os dados.');
            }
        } finally {
            setLoading(false);
        }
    }

    function salvar(novoCpf: string) {
        setCpf(novoCpf);
        localStorage.setItem(STORAGE_KEY, novoCpf);
        setInput('');
    }

    function sair() {
        setCpf('');
        localStorage.removeItem(STORAGE_KEY);
    }

    return { cpf, input, setInput, erro, loading, identificar, sair };
}