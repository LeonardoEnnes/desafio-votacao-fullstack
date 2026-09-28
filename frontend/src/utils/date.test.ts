import { describe, it, expect } from 'vitest';
import { parseDataApi, formatarData } from './date';

describe('parseDataApi', () => {
    it('deve parsear string ISO sem timezone', () => {
        const d = parseDataApi('2026-09-27T23:00:00');
        expect(d).not.toBeNull();
        expect(d!.getFullYear()).toBe(2026);
        expect(d!.getMonth()).toBe(8); // setembr
        expect(d!.getDate()).toBe(27);
        expect(d!.getHours()).toBe(23);
        expect(d!.getMinutes()).toBe(0);
    });

    it('deve parsear string ISO com timezone Z', () => {
        const d = parseDataApi('2026-09-27T23:00:00Z');
        expect(d).not.toBeNull();
        expect(d!.getTime()).toBe(Date.UTC(2026, 8, 27, 23, 0, 0));
    });

    it('deve parsear array de números (formato Jackson)', () => {
        const d = parseDataApi([2026, 9, 27, 23, 0, 0]);
        expect(d).not.toBeNull();
        expect(d!.getFullYear()).toBe(2026);
        expect(d!.getMinutes()).toBe(0);
    });

    it('deve retornar null para valor inválido', () => {
        expect(parseDataApi('nao-e-data')).toBeNull();
        expect(parseDataApi(null)).toBeNull();
        expect(parseDataApi(undefined)).toBeNull();
    });
});

describe('formatarData', () => {

    it('deve formatar no padrão pt-BR', () => {
        const result = formatarData('2026-09-27T23:00:00');
        expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('deve retornar null para valor inválido', () => {
        expect(formatarData(null)).toBeNull();
        expect(formatarData('xxx')).toBeNull();
    });
});