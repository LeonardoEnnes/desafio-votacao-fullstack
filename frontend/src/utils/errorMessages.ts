export function getApiErrorMessage(status?: number, defaultMessage: string = 'Ocorreu um erro inesperado.'): string {
    const mensagens: Record<number, string> = {
        404: 'CPF não encontrado ou inválido no sistema.',
        409: 'Você já votou nesta pauta ou o CPF está inapto a votar.',
    };

    return status ? (mensagens[status] ?? defaultMessage) : defaultMessage;
}