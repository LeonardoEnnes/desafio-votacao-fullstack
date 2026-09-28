import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePautaDetalhe } from './usePautaDetalhe';
import { pautaService } from '@/services/pautaService';
import { votoService } from '@/services/votoService';

vi.mock('@/services/pautaService');
vi.mock('@/services/votoService');

describe('usePautaDetalhe', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        (pautaService.buscarPorId as any).mockResolvedValue({
            id: 'p1',
            titulo: 'Pauta Teste',
        });
        (pautaService.obterResultado as any).mockResolvedValue({
            id: 'p1',
            titulo: 'Pauta Teste',
            totalVotos: 0,
            totalVotosSim: 0,
            totalVotosNao: 0,
        });
        (pautaService.listarSessoesAbertas as any).mockResolvedValue([]);
    });

    it('deve carregar pauta e resultado ao montar', async () => {
        const { result } = renderHook(() => usePautaDetalhe('p1'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        expect(result.current.pauta).toEqual({ id: 'p1', titulo: 'Pauta Teste' });
    });

    it('deve abrir sessão com sucesso', async () => {
        (pautaService.abrirSessao as any).mockResolvedValue({});

        const { result } = renderHook(() => usePautaDetalhe('p1'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.abrirSessao();
        });

        expect(result.current.feedback?.tipo).toBe('sucesso');
        expect(result.current.jaTeveSessao).toBe(true);
    });

    it('deve registrar voto e atualizar feedback', async () => {
        (votoService.registrarVoto as any).mockResolvedValue({ id: 'voto-1' });

        const { result } = renderHook(() => usePautaDetalhe('p1'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => result.current.setCpfVoto('12345678901'));

        await act(async () => {
            await result.current.votar('SIM');
        });

        expect(result.current.feedback?.tipo).toBe('sucesso');
        expect(votoService.registrarVoto).toHaveBeenCalledWith('p1', {
            associadoCpf: '12345678901',
            valor: 'SIM',
        });
    });

    it('deve tratar erro 409 (já votou)', async () => {
        (votoService.registrarVoto as any).mockRejectedValue({
            response: { status: 409, data: { message: 'Já votou' } },
        });

        const { result } = renderHook(() => usePautaDetalhe('p1'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => result.current.setCpfVoto('12345678901'));

        await act(async () => {
            await result.current.votar('SIM');
        });

        expect(result.current.feedback?.tipo).toBe('erro');
    });
});