export function getApiErrorMessage(
    status?: number,
    defaultMessage: string = 'Ocorreu um erro inesperado.',
    responseData?: any
): string {
    if (responseData?.message && typeof responseData.message === 'string') {
        return responseData.message;
    }

    if (responseData?.messages && typeof responseData.messages === 'object') {
        const primeiraMensagem = Object.values(responseData.messages)[0];
        if (typeof primeiraMensagem === 'string') {
            return primeiraMensagem;
        }
    }

    // fallback de msg generica
    const mensagensPorStatus: Record<number, string> = {
        400: 'Dados inválidos. Verifique os campos e tente novamente.',
        401: 'Você precisa estar identificado para realizar esta ação.',
        403: 'Você não tem permissão para realizar esta ação.',
        404: 'Recurso não encontrado.',
        409: 'Conflito: o registro já existe ou a operação não é permitida.',
        422: 'O CPF informado não está apto a votar nesta pauta.',
        500: 'Erro interno no servidor. Tente novamente mais tarde.',
    };

    return status ? (mensagensPorStatus[status] ?? defaultMessage) : defaultMessage;
}