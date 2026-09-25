package com.dbserver.votacao.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class SessaoTest {

    @Test
    @DisplayName("Deve retornar verdadeiro quando a sessão já estiver encerrada")
    void deveRetornarVerdadeiroQuandoSessaoEncerrada() {
        Sessao sessao = Sessao.builder()
                .dataAbertura(LocalDateTime.now().minusMinutes(10))
                .dataFechamento(LocalDateTime.now().minusMinutes(1))
                .build();

        assertTrue(sessao.estaEncerrada());
    }

    @Test
    @DisplayName("Deve retornar falso quando a sessão ainda estiver aberta")
    void deveRetornarFalsoQuandoSessaoAberta() {
        Sessao sessao = Sessao.builder()
                .dataAbertura(LocalDateTime.now())
                .dataFechamento(LocalDateTime.now().plusMinutes(10))
                .build();

        assertFalse(sessao.estaEncerrada());
    }
}