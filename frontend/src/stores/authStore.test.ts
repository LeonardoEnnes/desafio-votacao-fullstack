import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
    beforeEach(() => {
        localStorage.clear();
        useAuthStore.setState({ cpfLogado: null });
    });

    it('deve logar e persistir o CPF no localStorage', () => {
        useAuthStore.getState().login('12345678901');
        expect(useAuthStore.getState().cpfLogado).toBe('12345678901');
        expect(localStorage.getItem('@votacao:cpf')).toBe('12345678901');
    });

    it('deve deslogar e remover o CPF do localStorage', () => {
        useAuthStore.getState().login('12345678901');
        useAuthStore.getState().logout();
        expect(useAuthStore.getState().cpfLogado).toBeNull();
        expect(localStorage.getItem('@votacao:cpf')).toBeNull();
    });

    it('deve limpar chaves de voto/inapto ao deslogar', () => {
        localStorage.setItem('voto_pauta1_123', 'true');
        localStorage.setItem('inapto_pauta2_123', 'true');
        localStorage.setItem('outra_coisa', 'mantem');

        useAuthStore.getState().logout();

        expect(localStorage.getItem('voto_pauta1_123')).toBeNull();
        expect(localStorage.getItem('inapto_pauta2_123')).toBeNull();
        expect(localStorage.getItem('outra_coisa')).toBe('mantem');
    });
});