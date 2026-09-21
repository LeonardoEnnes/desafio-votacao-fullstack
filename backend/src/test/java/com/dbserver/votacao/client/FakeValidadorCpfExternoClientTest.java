package com.dbserver.votacao.client;

import com.dbserver.votacao.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FakeValidadorCpfExternoClientTest {

    private ValidadorDeCpf validadorDeCpf;
    private FakeValidadorCpfExternoClient client;

    @BeforeEach
    void setUp() {
        validadorDeCpf = new ValidadorDeCpf();
    }

    @Test
    @DisplayName("Deve retornar ABLE_TO_VOTE quando o supplier retornar verdadeiro e o CPF for válido")
    void deveRetornarAbleToVote() {
        // Força o supplier a retornar true (apto a votar)
        client = new FakeValidadorCpfExternoClient(validadorDeCpf, () -> true);

        // Usando o CPF matematicamente válido "52998224725"
        ElegibilidadeVoto resultado = client.verificarElegibilidade("52998224725");

        assertEquals(ElegibilidadeVoto.ABLE_TO_VOTE, resultado);
    }

    @Test
    @DisplayName("Deve retornar UNABLE_TO_VOTE quando o supplier retornar falso e o CPF for válido")
    void deveRetornarUnableToVote() {
        // Força o supplier a retornar false (inapto a votar)
        client = new FakeValidadorCpfExternoClient(validadorDeCpf, () -> false);

        ElegibilidadeVoto resultado = client.verificarElegibilidade("52998224725");

        assertEquals(ElegibilidadeVoto.UNABLE_TO_VOTE, resultado);
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException (404) quando o CPF for inválido")
    void deveLancarExcecaoParaCpfInvalido() {
        client = new FakeValidadorCpfExternoClient(validadorDeCpf, () -> true);

        // Testando com um CPF inválido (dígitos repetidos)
        assertThrows(ResourceNotFoundException.class, () -> {
            client.verificarElegibilidade("11111111111");
        });
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException (404) quando o CPF for nulo ou malformado")
    void deveLancarExcecaoParaCpfMalformado() {
        client = new FakeValidadorCpfExternoClient(validadorDeCpf, () -> true);

        assertThrows(ResourceNotFoundException.class, () -> {
            client.verificarElegibilidade("12345");
        });
    }
}