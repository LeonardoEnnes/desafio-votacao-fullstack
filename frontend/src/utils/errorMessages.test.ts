import { describe, it, expect } from 'vitest';
import { getApiErrorMessage } from './errorMessages';

describe('getApiErrorMessage', () => {
    it('deve priorizar a mensagem única do backend quando existir', () => {
        const result = getApiErrorMessage(409, 'fallback', { message: 'O associado já votou nesta pauta.' });
        expect(result).toBe('O associado já votou nesta pauta.');
    });

    it('deve extrair a primeira mensagem de validação (campo messages)', () => {
        const result = getApiErrorMessage(400, 'fallback', {
            messages: { titulo: 'O título é obrigatório', descricao: 'Descrição muito curta' },
        });
        expect(result).toBe('O título é obrigatório');
    });

    it('deve retornar mensagem padrão do 422 quando o backend não enviar message', () => {
        const result = getApiErrorMessage(422);
        expect(result).toBe('O CPF informado não está apto a votar nesta pauta.');
    });

    it('deve retornar mensagem padrão do 409 quando o backend não enviar message', () => {
        const result = getApiErrorMessage(409);
        expect(result).toBe('Conflito: o registro já existe ou a operação não é permitida.');
    });

    it('deve retornar defaultMessage quando status é desconhecido', () => {
        const result = getApiErrorMessage(418, 'Sou um bule de chá');
        expect(result).toBe('Sou um bule de chá');
    });

    it('deve retornar defaultMessage quando status não é informado', () => {
        const result = getApiErrorMessage(undefined, 'Fallback customizado');
        expect(result).toBe('Fallback customizado');
    });

    it('deve ignorar message do backend se não for string', () => {
        const result = getApiErrorMessage(400, 'fallback', { message: { foo: 'bar' } });
        expect(result).toBe('Dados inválidos. Verifique os campos e tente novamente.');
    });
});