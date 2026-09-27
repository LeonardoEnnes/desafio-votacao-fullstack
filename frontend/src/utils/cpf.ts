export function mascararCpf(cpf: string): string {
    if (!cpf || cpf.length !== 11) return '***.***.***-**';
    return `***.***.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
}