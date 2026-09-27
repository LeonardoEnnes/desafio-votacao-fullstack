import { create } from 'zustand';

interface AuthState {
    cpfLogado: string | null;
    login: (cpf: string) => void;
    logout: () => void;
}

const STORAGE_KEY = '@votacao:cpf';

export const useAuthStore = create<AuthState>((set) => ({
    cpfLogado: localStorage.getItem(STORAGE_KEY),
    login: (cpf: string) => {
        localStorage.setItem(STORAGE_KEY, cpf);
        set({ cpfLogado: cpf });
    },
    logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        set({ cpfLogado: null });
    }
}));