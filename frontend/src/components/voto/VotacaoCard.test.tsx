import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { VotacaoCard } from './VotacaoCard';
import { votoService } from '@/services/votoService';
import { pautaService } from '@/services/pautaService';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/services/votoService');
vi.mock('@/services/pautaService');
vi.mock('@/stores/authStore', () => ({
    useAuthStore: vi.fn(),
}));

const pautaMock = {
    id: 'pauta-1',
    titulo: 'Pauta de Teste',
    descricao: 'Descrição de teste',
    dataCriacao: '2026-09-28T10:00:00',
};

function renderCard(sessaoAberta = true) {
    return render(
        <MemoryRouter>
            <VotacaoCard
                pauta={pautaMock}
                sessaoAberta={sessaoAberta}
                onVotoRealizado={vi.fn()}
            />
        </MemoryRouter>
    );
}

describe('VotacaoCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // o padrao é o resultado como vazio
        (pautaService.obterResultado as any).mockResolvedValue({
            id: 'pauta-1',
            titulo: 'Pauta de Teste',
            totalVotos: 0,
            totalVotosSim: 0,
            totalVotosNao: 0,
        });
    });

    it('deve mostrar mensagem para se identificar quando nao ha CPF logado', () => {
        (useAuthStore as any).mockReturnValue({ cpfLogado: null });

        renderCard();

        expect(screen.getByText(/identifique-se na área do associado/i)).toBeInTheDocument();
    });

    it('deve mostrar botoes SIM e NAO quando sessao está aberta e cpf logado', () => {
        (useAuthStore as any).mockReturnValue({ cpfLogado: '12345678901' });

        renderCard();

        expect(screen.getByRole('button', { name: /sim/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /não/i })).toBeInTheDocument();
    });

    it('nao deve mostrar botoes quando a sessao esta fechada', () => {
        (useAuthStore as any).mockReturnValue({ cpfLogado: '12345678901' });

        renderCard(false);

        expect(screen.queryByRole('button', { name: /sim/i })).not.toBeInTheDocument();
        expect(screen.getByText(/sessão encerrada ou não iniciada/i)).toBeInTheDocument();
    });

    it('deve registrar voto e mostrar feedback de sucesso', async () => {
        (useAuthStore as any).mockReturnValue({ cpfLogado: '12345678901' });
        (votoService.registrarVoto as any).mockResolvedValue({ id: 'voto-1' });

        renderCard();
        await userEvent.click(screen.getByRole('button', { name: /sim/i }));

        await waitFor(() => {
            expect(screen.getByText(/voto "sim" registrado com sucesso/i)).toBeInTheDocument();
        });
        expect(votoService.registrarVoto).toHaveBeenCalledWith('pauta-1', {
            associadoCpf: '12345678901',
            valor: 'SIM',
        });
    });

    it('deve mostrar "Voce ja votou" quando backend retorna 409', async () => {
        (useAuthStore as any).mockReturnValue({ cpfLogado: '12345678901' });
        (votoService.registrarVoto as any).mockRejectedValue({
            response: { status: 409, data: { message: 'O associado já votou nesta pauta.' } },
        });

        renderCard();
        await userEvent.click(screen.getByRole('button', { name: /sim/i }));

        await waitFor(() => {
            expect(screen.getByText(/você já votou nesta pauta/i)).toBeInTheDocument();
        });
    });

    it('deve mostrar feedback temporário quando backend retorna 422 (inapto)', async () => {
        (useAuthStore as any).mockReturnValue({ cpfLogado: '12345678901' });
        
        (votoService.registrarVoto as any).mockRejectedValue({
            response: { status: 422, data: {
                 message: 'CPF não está apto a votar.' 
            } },
        });

        renderCard();
        await userEvent.click(screen.getByRole('button', { name: /sim/i }));

        await waitFor(() => {
            expect(screen.getByText(/cpf não está apto a votar/i)).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: /sim/i })).toBeInTheDocument();
    });

    it('deve carregar badge "Você já votou" do localStorage ao montar', () => {
        (useAuthStore as any).mockReturnValue({ cpfLogado: '12345678901' });
        localStorage.setItem('voto_pauta-1_12345678901', 'true');

        renderCard();

        expect(screen.getByText(/você já votou nesta pauta/i)).toBeInTheDocument();
    });
});