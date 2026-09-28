import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';
import { usePautasComSessoes } from '@/hooks/usePautasComSessoes';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/hooks/usePautasComSessoes');
vi.mock('@/stores/authStore');

vi.mock('@/components/associado/AreaAssociado', () => ({
    AreaAssociado: () => <div data-testid="area-associado">Área do Associado</div>,
}));
vi.mock('@/components/sessao/SessoesAbertasBanner', () => ({
    SessoesAbertasBanner: () => <div data-testid="banner-sessoes">Banner</div>,
}));
vi.mock('@/components/voto/VotacaoCard', () => ({
    VotacaoCard: ({ pauta }: any) => <div data-testid={`card-${pauta.id}`}>{pauta.titulo}</div>,
}));
vi.mock('@/components/pauta/NovaPautaModal', () => ({
    NovaPautaModal: () => <div data-testid="modal">Modal</div>,
}));

describe('HomePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAuthStore as any).mockReturnValue({ cpfLogado: null });
    });

    function renderPage() {
        return render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );
    }

    it('deve mostrar loading enquanto carrega', () => {
        (usePautasComSessoes as any).mockReturnValue({
            pautas: [],
            sessoesAbertasIds: [],
            loading: true,
            erro: null,
            recarregar: vi.fn(),
        });

        renderPage();

        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('deve mostrar mensagem de erro quando falha ao carregar', () => {
        (usePautasComSessoes as any).mockReturnValue({
            pautas: [],
            sessoesAbertasIds: [],
            loading: false,
            erro: 'Não foi possível carregar as pautas.',
            recarregar: vi.fn(),
        });

        renderPage();

        expect(screen.getByText(/não foi possível carregar as pautas/i)).toBeInTheDocument();
    });

    it('deve mostrar mensagem de lista vazia quando não há pautas', () => {
        (usePautasComSessoes as any).mockReturnValue({
            pautas: [],
            sessoesAbertasIds: [],
            loading: false,
            erro: null,
            recarregar: vi.fn(),
        });

        renderPage();

        expect(screen.getByText(/nenhuma pauta cadastrada/i)).toBeInTheDocument();
    });

    it('deve renderizar um card por pauta', () => {
        (usePautasComSessoes as any).mockReturnValue({
            pautas: [
                { id: 'p1', titulo: 'Pauta 1' },
                { id: 'p2', titulo: 'Pauta 2' },
            ],
            sessoesAbertasIds: ['p1'],
            loading: false,
            erro: null,
            recarregar: vi.fn(),
        });

        renderPage();

        expect(screen.getByTestId('card-p1')).toHaveTextContent('Pauta 1');
        expect(screen.getByTestId('card-p2')).toHaveTextContent('Pauta 2');
    });

    it('deve mostrar botão "Nova Pauta" apenas quando há CPF logado', () => {
        (usePautasComSessoes as any).mockReturnValue({
            pautas: [],
            sessoesAbertasIds: [],
            loading: false,
            erro: null,
            recarregar: vi.fn(),
        });
        (useAuthStore as any).mockReturnValue({ cpfLogado: '12345678901' });

        renderPage();

        expect(screen.getByRole('button', { name: /nova pauta/i })).toBeInTheDocument();
    });
});