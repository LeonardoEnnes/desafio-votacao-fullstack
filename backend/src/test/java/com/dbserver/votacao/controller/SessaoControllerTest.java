package com.dbserver.votacao.controller;

import com.dbserver.votacao.domain.Pauta;
import com.dbserver.votacao.dto.request.SessaoRequestDto;
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
public class SessaoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JacksonTester<SessaoRequestDto> sessaoRequestTester;

    @Autowired
    private PautaRepository pautaRepository;

    @Autowired
    private SessaoRepository sessaoRepository;

    @Autowired
    private VotoRepository votoRepository;

    private Pauta pautaCadastrada;

    @BeforeEach
    public void setup() {
        votoRepository.deleteAll();
        sessaoRepository.deleteAll();
        pautaRepository.deleteAll();

        Pauta pauta = Pauta.builder()
                .titulo("Pauta Um Sessao")
                .descricao("Algum texto generico")
                .build();

        pautaCadastrada = pautaRepository.save(pauta);
    }

    @Test
    @DisplayName("deve abrir sessão com tempo customizado")
    void deveAbrirSessaoComTempoCustomizado() throws Exception {
        SessaoRequestDto requestDto = new SessaoRequestDto(10); // 10 minutos

        mockMvc.perform(post("/api/v1/pautas/{pautaId}/sessoes", pautaCadastrada.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sessaoRequestTester.write(requestDto).getJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.pautaId").value(pautaCadastrada.getId().toString()))
                .andExpect(jsonPath("$.dataAbertura").exists())
                .andExpect(jsonPath("$.dataFechamento").exists())
                .andDo(print());

        assertEquals(1, sessaoRepository.count());
    }
}