package com.dbserver.votacao.client;

import org.springframework.stereotype.Component;

@Component
public class ValidadorDeCpf {
    private static final int TAMANHO_CPF = 11;

    public boolean isValido(String cpf) {
        if (cpf == null || !cpf.matches("\\d{11}") || cpf.matches("(\\d)\\1{10}")) {
            return false;
        }
        int primeiroDigito = calcularDigito(cpf, 9);
        int segundoDigito = calcularDigito(cpf, 10);
        return primeiroDigito == Character.getNumericValue(cpf.charAt(9))
                && segundoDigito == Character.getNumericValue(cpf.charAt(10));
    }

    private int calcularDigito(String cpf, int comprimento) {
        int soma = 0;
        int peso = comprimento + 1;
        for (int i = 0; i < comprimento; i++) {
            soma += Character.getNumericValue(cpf.charAt(i)) * peso--;
        }
        int resto = soma % TAMANHO_CPF;
        return resto < 2 ? 0 : TAMANHO_CPF - resto;
    }
}
