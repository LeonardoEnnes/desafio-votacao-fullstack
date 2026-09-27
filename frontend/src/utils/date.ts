export function parseDataApi(raw?: string | number[] | Date | null): Date | null {
    if (raw === null || raw === undefined) return null;

    if (Array.isArray(raw)) {
        const [ano, mes, dia, hora = 0, min = 0, seg = 0] = raw;
        const d = new Date(ano, mes - 1, dia, hora, min, seg);
        return isNaN(d.getTime()) ? null : d;
    }

    if (raw instanceof Date) {
        return isNaN(raw.getTime()) ? null : raw;
    }

    if (typeof raw !== 'string') return null;

    const temTimezone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(raw);
    if (temTimezone) {
        const d = new Date(raw);
        return isNaN(d.getTime()) ? null : d;
    }

    const match = raw.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/
    );
    if (match) {
        const [, ano, mes, dia, hora = '0', min = '0', seg = '0'] = match;
        const d = new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia),
            Number(hora),
            Number(min),
            Number(seg)
        );
        return isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
}

export function formatarData(raw?: string | number[] | Date | null): string | null {
    const data = parseDataApi(raw);
    if (!data) return null;

    try {
        return new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(data);
    } catch {
        return null;
    }
}