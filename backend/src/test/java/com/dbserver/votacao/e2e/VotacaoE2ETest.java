package com.dbserver.votacao.e2e;

import com.dbserver.votacao.client.ElegibilidadeVoto;
import com.dbserver.votacao.client.ValidadorCpfExternoClient;
import com.dbserver.votacao.repository.AssociadoRepository;
import com.dbserver.votacao.repository.PautaRepository;
import com.dbserver.votacao.repository.SessaoRepository;
import com.dbserver.votacao.repository.VotoRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import java.util.UUID;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class VotacaoE2ETest {

    private static final String CPF_VALIDO = "52998224725";

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private VotoRepository votoRepository;

    @Autowired
    private SessaoRepository sessaoRepository;

    @Autowired
    private PautaRepository pautaRepository;

    @Autowired
    private AssociadoRepository associadoRepository;

    @MockitoBean
    private ValidadorCpfExternoClient validadorCpfExternoClient;

    @BeforeEach
    void cleanDatabase() {
        votoRepository.deleteAllInBatch();
        sessaoRepository.deleteAllInBatch();
        pautaRepository.deleteAllInBatch();
        associadoRepository.deleteAllInBatch();
    }

    @Test
    void deveExecutarFluxoCompletoDeVotacaoComSucesso() throws Exception {
        // Mock do client externo permitindo o voto
        when(validadorCpfExternoClient.verificarElegibilidade(CPF_VALIDO))
                .thenReturn(ElegibilidadeVoto.ABLE_TO_VOTE);

        cadastrarAssociado(CPF_VALIDO);

        UUID pautaId = criarPauta("Pauta de Teste E2E", "Descrição da pauta");

        UUID sessaoId = abrirSessao(pautaId, 10);

        registrarVoto(pautaId, CPF_VALIDO, "SIM")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.valor").value("SIM"));

        mockMvc.perform(get("/api/v1/pautas/{id}/resultado", pautaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalVotos").value(1))
                .andExpect(jsonPath("$.totalVotosSim").value(1))
                .andExpect(jsonPath("$.totalVotosNao").value(0));
    }

    @Test
    void deveRejeitarVotoDuplicadoDoMesmoAssociado() throws Exception {
        when(validadorCpfExternoClient.verificarElegibilidade(CPF_VALIDO))
                .thenReturn(ElegibilidadeVoto.ABLE_TO_VOTE);

        cadastrarAssociado(CPF_VALIDO);
        UUID pautaId = criarPauta("Pauta Concorrência", "Teste de voto único");
        abrirSessao(pautaId, 10);

        // Primeiro voto deve passar
        registrarVoto(pautaId, CPF_VALIDO, "SIM")
                .andExpect(status().isCreated());

        // Segundo voto com o mesmo associado/pauta deve retornar 409 Conflict por causa da UniqueConstraint
        registrarVoto(pautaId, CPF_VALIDO, "NAO")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"));
    }

    private void cadastrarAssociado(String cpf) throws Exception {
        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cpf\":\"" + cpf + "\"}"))
                .andExpect(status().isCreated());
    }

    private UUID criarPauta(String titulo, String descricao) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/pautas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"" + titulo + "\", \"descricao\":\"" + descricao + "\"}"))
                .andExpect(status().isCreated())
                .andReturn();

        String jsonResponse = result.getResponse().getContentAsString();
        return UUID.fromString(JsonPath.read(jsonResponse, "$.id"));
    }

    private UUID abrirSessao(UUID pautaId, int tempoMinutos) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/pautas/{pautaId}/sessoes", pautaId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tempoEmMinutos\":" + tempoMinutos + "}"))
                .andExpect(status().isCreated())
                .andReturn();

        String jsonResponse = result.getResponse().getContentAsString();
        return UUID.fromString(JsonPath.read(jsonResponse, "$.id"));
    }

    private ResultActions registrarVoto(UUID pautaId, String cpf, String valor) throws Exception {
        return mockMvc.perform(post("/api/v1/pautas/{pautaId}/votos", pautaId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"associadoCpf\":\"" + cpf + "\", \"valor\":\"" + valor + "\"}"));
    }
}