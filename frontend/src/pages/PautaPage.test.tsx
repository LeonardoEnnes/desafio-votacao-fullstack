import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PautaPage } from './PautaPage';
import { usePautaDetalhe } from '@/hooks/usePautaDetalhe';

vi.mock('@/hooks/usePautaDetalhe');

vi.mock('@/components/pauta/PautaHeader', () => ({
    PautaHeader: ({ pauta, sessaoAberta }: any) => (
        <div data-testid="pauta-header">
            <span data-testid="pauta-titulo">{pauta.titulo}</span>
            <span data-testid="sessao-aberta">{String(sessaoAberta)}</span>
        </div>
    ),
}));

vi.mock('@/components/sessao/SessaoCard', () => ({
    SessaoCard: ({ sessaoAberta, jaTeveSessao }: any) => (
        <div data-testid="sessao-card">
            <span data-testid="sessao-aberta-card">{String(sessaoAberta)}</span>
            <span data-testid="ja-teve-sessao">{String(jaTeveSessao)}</span>
        </div>
    ),
}));

vi.mock('@/components/voto/ApuracaoCard', () => ({
    ApuracaoCard: ({ resultado }: any) => (
        <div data-testid="apuracao-card">
            <span data-testid="total-votos">{resultado?.totalVotos ?? 0}</span>
        </div>
    ),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ id: 'pauta-123' }),
        useNavigate: () => mockNavigate,
    };
});

const pautaMock = {
    id: 'pauta-123',
    titulo: 'Pauta de Teste',
    descricao: 'Descrição da pauta de teste',
    dataCriacao: '2026-09-28T10:00:00',
};

const resultadoMock = {
    id: 'pauta-123',
    titulo: 'Pauta de Teste',
    totalVotos: 5,
    totalVotosSim: 3,
    totalVotosNao: 2,
};

function mockHook(overrides = {}) {
    (usePautaDetalhe as any).mockReturnValue({
        pauta: pautaMock,
        resultado: resultadoMock,
        sessaoAberta: false,
        jaTeveSessao: false,
        loading: false,
        minutosSessao: '1',
        setMinutosSessao: vi.fn(),
        feedback: null,
        abrindo: false,
        abrirSessao: vi.fn(),
        recarregar: vi.fn(),
        ...overrides,
    });
}

describe('PautaPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve mostrar "Carregando..." enquanto o hook esta em loading', () => {
        mockHook({ loading: true });

        render(<PautaPage />);

        expect(screen.getByText(/carregando/i)).toBeInTheDocument();
        expect(screen.queryByTestId('pauta-header')).not.toBeInTheDocument();
    });

    it('deve mostrar "Pauta nao encontrada" quando pauta é null', () => {
        mockHook({ pauta: null, loading: false });

        render(<PautaPage />);

        expect(screen.getByText(/pauta não encontrada/i)).toBeInTheDocument();
        expect(screen.queryByTestId('pauta-header')).not.toBeInTheDocument();
    });

    it('deve renderizar os três cards quando pauta esta carregada', () => {
        mockHook();

        render(<PautaPage />);

        expect(screen.getByTestId('pauta-header')).toBeInTheDocument();
        expect(screen.getByTestId('sessao-card')).toBeInTheDocument();
        expect(screen.getByTestId('apuracao-card')).toBeInTheDocument();
    });

    it('deve passar o título correto da pauta para o PautaHeader', () => {
        mockHook();

        render(<PautaPage />);

        expect(screen.getByTestId('pauta-titulo')).toHaveTextContent('Pauta de Teste');
    });

    it('deve passar sessaoAberta=true corretamente para os filhos', () => {
        mockHook({ sessaoAberta: true });

        render(<PautaPage />);

        expect(screen.getByTestId('sessao-aberta')).toHaveTextContent('true');
        expect(screen.getByTestId('sessao-aberta-card')).toHaveTextContent('true');
    });

    it('deve passar jaTeveSessao=true corretamente para o SessaoCard', () => {
        mockHook({ jaTeveSessao: true });

        render(<PautaPage />);

        expect(screen.getByTestId('ja-teve-sessao')).toHaveTextContent('true');
    });

    it('deve passar o resultado correto para o ApuracaoCard', () => {
        mockHook();

        render(<PautaPage />);

        expect(screen.getByTestId('total-votos')).toHaveTextContent('5');
    });

    it('deve mostrar "0" quando resultado é null', () => {
        mockHook({ resultado: null });

        render(<PautaPage />);

        expect(screen.getByTestId('total-votos')).toHaveTextContent('0');
    });

    it('deve chamar navigate("/") ao clicar em "Voltar para a listagem"', async () => {
        mockHook();

        render(<PautaPage />);
        await userEvent.click(screen.getByRole('button', { name: /voltar para a listagem/i }));

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('não deve renderizar nada de pauta durante o loading', () => {
        mockHook({ loading: true, pauta: null });

        render(<PautaPage />);

        expect(screen.queryByTestId('pauta-header')).not.toBeInTheDocument();
        expect(screen.queryByTestId('sessao-card')).not.toBeInTheDocument();
        expect(screen.queryByTestId('apuracao-card')).not.toBeInTheDocument();
    });
});