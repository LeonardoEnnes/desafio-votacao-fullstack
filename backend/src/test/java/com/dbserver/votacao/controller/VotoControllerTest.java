package com.dbserver.votacao.controller;

import com.dbserver.votacao.domain.Associado;
import com.dbserver.votacao.domain.Pauta;
import com.dbserver.votacao.domain.Sessao;
import com.dbserver.votacao.domain.enums.VotoEnum;
import com.dbserver.votacao.dto.request.VotoRequestDto;
import com.dbserver.votacao.repository.AssociadoRepository;
import com.dbserver.votacao.repository.PautaRepository;
import com.dbserver.votacao.repository.SessaoRepository;
import com.dbserver.votacao.repository.VotoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.AutoConfigureJsonTesters;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureJsonTesters
@ActiveProfiles("test")
@Transactional
class VotoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JacksonTester<VotoRequestDto> votoRequestTester;

    @Autowired
    private PautaRepository pautaRepository;
    @Autowired
    private SessaoRepository sessaoRepository;
    @Autowired
    private AssociadoRepository associadoRepository;
    @Autowired
    private VotoRepository votoRepository;

    private Pauta pautaAtiva;

    @BeforeEach
    void setUp() {
        votoRepository.deleteAll();
        sessaoRepository.deleteAll();
        associadoRepository.deleteAll();
        pautaRepository.deleteAll();

        associadoRepository.save(Associado.builder().cpf("12345678901").build());

        Pauta pauta = Pauta.builder().titulo("Pauta Votação").descricao("Desc").build();
        pautaAtiva = pautaRepository.save(pauta);

        Sessao sessao = Sessao.builder()
                .pauta(pautaAtiva)
                .dataAbertura(LocalDateTime.now().minusMinutes(1))
                .dataFechamento(LocalDateTime.now().plusMinutes(10))
                .build();
        sessaoRepository.save(sessao);
    }

    @Test
    @DisplayName("POST /api/v1/pautas/{pautaId}/votos - Deve registrar voto com sucesso")
    void deveRegistrarVoto() throws Exception {
        VotoRequestDto request = new VotoRequestDto("12345678901", VotoEnum.SIM);

        mockMvc.perform(post("/api/v1/pautas/{pautaId}/votos", pautaAtiva.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(votoRequestTester.write(request).getJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.valor").value("SIM"))
                .andExpect(jsonPath("$.associadoCpf").value("12345678901"))
                .andDo(print());

        assertEquals(1, votoRepository.count());
    }

    @Test
    @DisplayName("POST /api/v1/pautas/{pautaId}/votos - Deve retornar 409 se tentar votar duas vezes")
    void deveRetornarConflictAoVotarDuasVezes() throws Exception {
        VotoRequestDto request = new VotoRequestDto("12345678901", VotoEnum.NAO);

        // Primeiro voto
        mockMvc.perform(post("/api/v1/pautas/{pautaId}/votos", pautaAtiva.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(votoRequestTester.write(request).getJson()))
                .andExpect(status().isCreated());

        // Segundo voto do mesmo CPF na mesma pauta
        mockMvc.perform(post("/api/v1/pautas/{pautaId}/votos", pautaAtiva.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(votoRequestTester.write(request).getJson()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("O associado já votou nesta pauta."))
                .andDo(print());
    }

    @Test
    @DisplayName("POST /api/v1/pautas/{pautaId}/votos - Deve retornar 400 se CPF for inválido (Validação DTO)")
    void deveRetornarBadRequestCpfInvalido() throws Exception {
        // CPF com letras para falhar na validação do @Pattern
        VotoRequestDto request = new VotoRequestDto("12345ABC890", VotoEnum.SIM);

        mockMvc.perform(post("/api/v1/pautas/{pautaId}/votos", pautaAtiva.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(votoRequestTester.write(request).getJson()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.messages.associadoCpf").exists())
                .andDo(print());
    }
}