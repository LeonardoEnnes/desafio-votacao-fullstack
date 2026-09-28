import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NovaPautaForm } from './NovaPautaForm';
import { pautaService } from '@/services/pautaService';

vi.mock('@/services/pautaService');

describe('NovaPautaForm', () => {
    const onSuccess = vi.fn();
    const onCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    function renderForm() {
        return render(<NovaPautaForm onSuccess={onSuccess} onCancel={onCancel} />);
    }

    it('deve mostrar erro de validação quando título é muito curto', async () => {
        renderForm();

        await userEvent.type(screen.getByLabelText(/título/i), 'AB');
        await userEvent.type(screen.getByLabelText(/descrição/i), 'Descrição válida');
        await userEvent.click(screen.getByRole('button', { name: /salvar/i }));

        expect(await screen.findByText(/pelo menos 3 caracteres/i)).toBeInTheDocument();
        expect(pautaService.criarPauta).not.toHaveBeenCalled();
    });

    it('deve mostrar erro do backend quando retornar 400 com messages', async () => {
        (pautaService.criarPauta as any).mockRejectedValue({
            response: {
                status: 400,
                data: { messages: { titulo: 'O título deve ter entre 3 e 255 caracteres' } },
            },
        });

        renderForm();

        await userEvent.type(screen.getByLabelText(/título/i), 'Pauta válida');
        await userEvent.type(screen.getByLabelText(/descrição/i), 'Descrição válida');
        await userEvent.click(screen.getByRole('button', { name: /salvar/i }));

        await waitFor(() => {
            expect(screen.getByText(/o título deve ter entre 3 e 255 caracteres/i)).toBeInTheDocument();
        });
    });

    it('deve chamar onSuccess quando criar pauta com sucesso', async () => {
        (pautaService.criarPauta as any).mockResolvedValue({ id: 'nova-pauta' });

        renderForm();

        await userEvent.type(screen.getByLabelText(/título/i), 'Pauta válida');
        await userEvent.type(screen.getByLabelText(/descrição/i), 'Descrição válida');
        await userEvent.click(screen.getByRole('button', { name: /salvar/i }));

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });
    });

    it('deve chamar onCancel ao clicar em Cancelar', async () => {
        renderForm();

        await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

        expect(onCancel).toHaveBeenCalled();
    });
});