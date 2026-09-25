package com.dbserver.votacao.repository;
import com.dbserver.votacao.domain.Pauta;
import com.dbserver.votacao.domain.Sessao;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class SessaoRepositoryTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private SessaoRepository sessaoRepository;

    @Autowired
    private PautaRepository pautaRepository;

    @BeforeEach
    void setUp() {
        sessaoRepository.deleteAllInBatch();
        pautaRepository.deleteAllInBatch();
    }

    @Test
    @DisplayName("Deve encontrar apenas sessoes em que os horários estejam no momento atual")
    void deveEncontrarSessoesAbertasCorretamente() {
        Pauta pauta1 = pautaRepository.save(Pauta.builder().titulo("Pauta 1").build());
        Pauta pauta2 = pautaRepository.save(Pauta.builder().titulo("Pauta 2").build());

        LocalDateTime agora = LocalDateTime.now();

        Sessao sessaoAberta = sessaoRepository.save(Sessao.builder()
                .pauta(pauta1)
                .dataAbertura(agora.minusMinutes(5))
                .dataFechamento(agora.plusMinutes(5))
                .build());

        sessaoRepository.save(Sessao.builder()
                .pauta(pauta2)
                .dataAbertura(agora.minusMinutes(20))
                .dataFechamento(agora.minusMinutes(10))
                .build());

        List<Sessao> sessoesAbertas = sessaoRepository.findSessoesAbertas(agora);

        assertThat(sessoesAbertas)
                .hasSize(1)
                .extracting(Sessao::getId)
                .containsExactly(sessaoAberta.getId());
    }
}