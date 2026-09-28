export function getApiErrorMessage(
    status?: number,
    defaultMessage: string = 'Ocorreu um erro inesperado.',
    responseData?: any
): string {
    if (responseData?.message) {
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
        404: 'Recurso não encontrado.',
        409: 'Conflito: o registro já existe ou a operação não é permitida.',
    };

    return status ? (mensagensPorStatus[status] ?? defaultMessage) : defaultMessage;
}