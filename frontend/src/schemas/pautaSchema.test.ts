import { describe, it, expect } from 'vitest';
import { pautaSchema } from './pautaSchema';

describe('pautaSchema', () => {
    it('deve aceitar pauta válida com descrição', () => {
        const r = pautaSchema.safeParse({ titulo: 'Pauta Teste', descricao: 'Descrição válida' });
        expect(r.success).toBe(true);
    });

    it('deve REJEITAR pauta sem descrição (obrigatória)', () => {
        const r = pautaSchema.safeParse({ titulo: 'Pauta Teste' });
        expect(r.success).toBe(false);
    });

    it('deve REJEITAR descrição com menos de 3 caracteres', () => {
        const r = pautaSchema.safeParse({ titulo: 'Pauta Teste', descricao: 'AB' });
        expect(r.success).toBe(false);
    });

    it('deve REJEITAR descrição com mais de 500 caracteres', () => {
        const r = pautaSchema.safeParse({ titulo: 'Pauta Teste', descricao: 'A'.repeat(501) });
        expect(r.success).toBe(false);
    });

    it('deve rejeitar título com menos de 3 caracteres', () => {
        const r = pautaSchema.safeParse({ titulo: 'AB', descricao: 'Descrição válida' });
        expect(r.success).toBe(false);
    });

    it('deve rejeitar título com mais de 255 caracteres', () => {
        const r = pautaSchema.safeParse({ titulo: 'A'.repeat(256), descricao: 'Descrição válida' });
        expect(r.success).toBe(false);
    });
});