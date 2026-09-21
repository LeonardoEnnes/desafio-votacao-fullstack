package com.dbserver.votacao.client;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ValidadorDeCpfTest {
    private ValidadorDeCpf validadorDeCpf;

    @BeforeEach
    void setUp() {
        validadorDeCpf = new ValidadorDeCpf();
    }

    @Test
    @DisplayName("Deve retornar verdadeiro para um CPF válido")
    void deveRetornarVerdadeiroParaCpfValido() {
        boolean valido = validadorDeCpf.isValido("52998224725");
        assertTrue(valido);
    }

    @ParameterizedTest
    @DisplayName("Deve retornar falso para CPFs com formato inválido, nulos ou vazios")
    @NullAndEmptySource
    @ValueSource(strings = {"123", "1234567890123", "abcdefghijk", "11111111111", "00000000000"})
    void deveRetornarFalsoParaCpfsInvalidos(String cpf) {
        boolean valido = validadorDeCpf.isValido(cpf);
        assertFalse(valido);
    }

    @Test
    @DisplayName("Deve retornar falso para CPF com dígitos verificadores incorretos")
    @SuppressWarnings("SpellCheckingInspection")
    void deveRetornarFalsoParaCpfComDigitosErrados() {
        boolean valido = validadorDeCpf.isValido("52998224726");
        assertFalse(valido);
    }
}
