package com.dbserver.votacao.controller;

import com.dbserver.votacao.domain.Pauta;
import com.dbserver.votacao.domain.Sessao;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import java.time.LocalDateTime;
import java.util.UUID;

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

    @Test
    @DisplayName("Deve listar sessões abertas com sucesso")
    void deveListarSessoesAbertasComSucesso() throws Exception {
        // abre uma sessao com pauta ja cadastrada
        Sessao sessao = Sessao.builder()
                .pauta(pautaCadastrada)
                .dataAbertura(LocalDateTime.now().minusSeconds(10))
                .dataFechamento(LocalDateTime.now().plusMinutes(5))
                .build();
        sessaoRepository.save(sessao);

        mockMvc.perform(get("/api/v1/sessoes/abertas")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].pautaId").value(pautaCadastrada.getId().toString()))
                .andDo(print());
    }

    @Test
    @DisplayName("deve abrir sessao com tempo padrao quando nao informado")
    void deveAbrirSessaoComTempoPadrao() throws Exception {
        SessaoRequestDto requestDto = new SessaoRequestDto(null);

        LocalDateTime antesDaAbertura = LocalDateTime.now();

        mockMvc.perform(post("/api/v1/pautas/{pautaId}/sessoes", pautaCadastrada.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sessaoRequestTester.write(requestDto).getJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.pautaId")
                        .value(pautaCadastrada.getId().toString()))
                .andExpect(jsonPath("$.dataAbertura").exists())
                .andExpect(jsonPath("$.dataFechamento").exists())
                .andDo(print());

        Sessao sessao = sessaoRepository.findAll().get(0);

        assertEquals(pautaCadastrada.getId(), sessao.getPauta().getId());
        assertEquals(1, sessaoRepository.count());

        assertEquals(
                true,
                !sessao.getDataAbertura().isBefore(antesDaAbertura)
        );
    }

    @Test
    @DisplayName("deve retornar 404 ao tentar abrir sessao para pauta inexistente")
    void deveRetornar404AoAbrirSessaoParaPautaInexistente() throws Exception {
        UUID pautaIdInexistente = UUID.randomUUID();

        SessaoRequestDto requestDto = new SessaoRequestDto(10);

        mockMvc.perform(post("/api/v1/pautas/{pautaId}/sessoes", pautaIdInexistente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sessaoRequestTester.write(requestDto).getJson()))
                .andExpect(status().isNotFound())
                .andDo(print());

        assertEquals(0, sessaoRepository.count());
    }

    @Test
    @DisplayName("deve retornar 409 ao tentar abrir segunda sessão para a mesma pauta")
    void deveRetornar409AoAbrirSegundaSessaoParaMesmaPauta() throws Exception {
        SessaoRequestDto requestDto = new SessaoRequestDto(10);

        mockMvc.perform(post("/api/v1/pautas/{pautaId}/sessoes", pautaCadastrada.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sessaoRequestTester.write(requestDto).getJson()))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/pautas/{pautaId}/sessoes", pautaCadastrada.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sessaoRequestTester.write(requestDto).getJson()))
                .andExpect(status().isConflict())
                .andDo(print());

        assertEquals(1, sessaoRepository.count());
    }

    @Test
    @DisplayName("deve retornar lista vazia quando não existem sessões abertas")
    void deveRetornarListaVaziaQuandoNaoExistemSessoesAbertas() throws Exception {
        mockMvc.perform(get("/api/v1/sessoes/abertas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0))
                .andDo(print());
    }

    @Test
    @DisplayName("nao deve listar sessão fechada")
    void naoDeveListarSessaoFechada() throws Exception {
        Sessao sessaoFechada = Sessao.builder()
                .pauta(pautaCadastrada)
                .dataAbertura(LocalDateTime.now().minusMinutes(10))
                .dataFechamento(LocalDateTime.now().minusMinutes(5))
                .build();

        sessaoRepository.save(sessaoFechada);

        mockMvc.perform(get("/api/v1/sessoes/abertas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0))
                .andDo(print());
    }

    @Test
    @DisplayName("deve listar múltiplas sessões abertas")
    void deveListarMultiplasSessoesAbertas() throws Exception {
        Pauta segundaPauta = Pauta.builder()
                .titulo("Pauta Dois Sessao")
                .descricao("Outra descricao")
                .build();

        pautaRepository.save(segundaPauta);

        Sessao primeiraSessao = Sessao.builder()
                .pauta(pautaCadastrada)
                .dataAbertura(LocalDateTime.now().minusSeconds(10))
                .dataFechamento(LocalDateTime.now().plusMinutes(5))
                .build();

        Sessao segundaSessao = Sessao.builder()
                .pauta(segundaPauta)
                .dataAbertura(LocalDateTime.now().minusSeconds(10))
                .dataFechamento(LocalDateTime.now().plusMinutes(5))
                .build();

        sessaoRepository.save(primeiraSessao);
        sessaoRepository.save(segundaSessao);

        mockMvc.perform(get("/api/v1/sessoes/abertas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[?(@.pautaId == '%s')]"
                        .formatted(pautaCadastrada.getId())).exists())
                .andExpect(jsonPath("$[?(@.pautaId == '%s')]"
                        .formatted(segundaPauta.getId())).exists())
                .andDo(print());
    }

}