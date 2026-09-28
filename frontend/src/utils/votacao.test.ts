import { describe, it, expect } from 'vitest';
import { calcularPercentuais } from './votacao';

describe('calcularPercentuais', () => {
    it('deve retornar zeros quando resultado é null', () => {
        const r = calcularPercentuais(null);
        expect(r.total).toBe(0);
        expect(r.sim).toBe(0);
        expect(r.nao).toBe(0);
        expect(r.pctSim).toBe(0);
        expect(r.pctNao).toBe(0);
    });

    it('deve calcular percentuais corretos com votos mistos', () => {
        const r = calcularPercentuais({
            id: '1', titulo: 'Teste',
            totalVotos: 10, totalVotosSim: 6, totalVotosNao: 4,
        });
        expect(r.total).toBe(10);
        expect(r.pctSim).toBe(60);
        expect(r.pctNao).toBe(40);
    });

    it('deve retornar 100% SIM quando todos votaram SIM', () => {
        const r = calcularPercentuais({
            id: '1', titulo: 'Teste',
            totalVotos: 5, totalVotosSim: 5, totalVotosNao: 0,
        });
        expect(r.pctSim).toBe(100);
        expect(r.pctNao).toBe(0);
    });

    it('não deve dividir por zero', () => {
        const r = calcularPercentuais({
            id: '1', titulo: 'Teste',
            totalVotos: 0, totalVotosSim: 0, totalVotosNao: 0,
        });
        expect(r.pctSim).toBe(0);
        expect(r.pctNao).toBe(0);
    });
});