package com.dbserver.votacao.controller;

import com.dbserver.votacao.domain.Associado;
import com.dbserver.votacao.domain.Pauta;
import com.dbserver.votacao.domain.Voto;
import com.dbserver.votacao.domain.enums.VotoEnum;
import com.dbserver.votacao.dto.request.PautaRequestDto;
import com.dbserver.votacao.repository.AssociadoRepository;
import com.dbserver.votacao.repository.PautaRepository;
import com.dbserver.votacao.repository.VotoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.AutoConfigureJsonTesters;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureJsonTesters
@ActiveProfiles("test")
@Transactional
class PautaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JacksonTester<PautaRequestDto> pautaRequestTester;

    @Autowired
    private PautaRepository pautaRepository;

    @Autowired
    private VotoRepository votoRepository;

    @Autowired
    private AssociadoRepository associadoRepository;

    @BeforeEach
    void setUp() {
        votoRepository.deleteAll();
        pautaRepository.deleteAll();
        associadoRepository.deleteAll();
    }

    @Test
    @DisplayName("Deve cadastrar nova pauta com sucesso")
    void deveCadastrarNovaPauta() throws Exception {
        PautaRequestDto requestDto = new PautaRequestDto("Titulo da Pauta", "Descricao da Pauta");

        mockMvc.perform(post("/api/v1/pautas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pautaRequestTester.write(requestDto).getJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titulo").value("Titulo da Pauta"))
                .andExpect(jsonPath("$.descricao").value("Descricao da Pauta"));

        assertEquals(1, pautaRepository.count());
    }

    @Test
    @DisplayName("Deve lancar BadRequest quando titulo for invalido")
    void deveRetornarBadRequestTituloVazio() throws Exception {
        PautaRequestDto requestDto = new PautaRequestDto("", "Descricao");

        mockMvc.perform(post("/api/v1/pautas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pautaRequestTester.write(requestDto).getJson()))
                .andExpect(status().isBadRequest());

        assertEquals(0, pautaRepository.count());
    }

    @Test
    @DisplayName("Deve listar todas as pautas")
    void deveListarTodasPautas() throws Exception {
        Pauta pauta = Pauta.builder()
                .titulo("Pauta Listada")
                .descricao("Desc")
                .build();
        pautaRepository.save(pauta);

        mockMvc.perform(get("/api/v1/pautas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].titulo").value("Pauta Listada"));
    }

    @Test
    @DisplayName("Deve buscar pauta por ID com sucesso")
    void deveBuscarPautaPorIdComSucesso() throws Exception {
        Pauta pauta = Pauta.builder()
                .titulo("Pauta ID")
                .descricao("Desc")
                .build();
        Pauta pautaSalva = pautaRepository.save(pauta);

        mockMvc.perform(get("/api/v1/pautas/{id}", pautaSalva.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(pautaSalva.getId().toString()))
                .andExpect(jsonPath("$.titulo").value("Pauta ID"));
    }

    @Test
    @DisplayName("Deve retornar 404 quando pauta nao existir")
    void deveRetornarNotFoundQuandoPautaNaoExistir() throws Exception {
        UUID idInexistente = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/pautas/{id}", idInexistente))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("Deve retornar 404 ao buscar resultado de pauta inexistente")
    void deveRetornarNotFoundAoBuscarResultadoPautaInexistente() throws Exception {
        UUID idInexistente = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/pautas/{id}/resultado", idInexistente))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Deve retornar resultado da pauta")
    void deveRetornarResultadoDaPauta() throws Exception {
        Pauta pauta = Pauta.builder()
                .titulo("Pauta Resultado")
                .descricao("Desc")
                .build();

        pauta = pautaRepository.save(pauta);

        Associado associado = associadoRepository.save(
                Associado.builder()
                        .cpf("52998224725")
                        .build()
        );

        votoRepository.save(
                Voto.builder()
                        .pauta(pauta)
                        .associado(associado)
                        .valor(VotoEnum.SIM)
                        .build()
        );

        mockMvc.perform(get("/api/v1/pautas/{id}/resultado", pauta.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalVotosSim").value(1))
                .andExpect(jsonPath("$.totalVotosNao").value(0));
    }

    @Test
    @DisplayName("Deve retornar resultado zerado quando pauta não possuir votos")
    void deveRetornarResultadoSemVotos() throws Exception {
        Pauta pauta = Pauta.builder()
                .titulo("Pauta Sem Votos")
                .descricao("Desc")
                .build();

        pauta = pautaRepository.save(pauta);

        mockMvc.perform(get("/api/v1/pautas/{id}/resultado", pauta.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalVotosSim").value(0))
                .andExpect(jsonPath("$.totalVotosNao").value(0));
    }

    @Test
    @DisplayName("Deve retornar lista vazia quando não houver pautas")
    void deveRetornarListaVaziaQuandoNaoHouverPautas() throws Exception {
        mockMvc.perform(get("/api/v1/pautas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("Deve retornar 400 quando título for nulo")
    void deveRetornarBadRequestTituloNulo() throws Exception {
        String json = """
        {
            "titulo": null,
            "descricao": "Descricao"
        }
        """;

        mockMvc.perform(post("/api/v1/pautas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 400 quando título não for informado")
    void deveRetornarBadRequestTituloAusente() throws Exception {
        String json = """
        {
            "descricao": "Descricao"
        }
        """;

        mockMvc.perform(post("/api/v1/pautas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 400 quando body estiver vazio")
    void deveRetornarBadRequestBodyVazio() throws Exception {
        mockMvc.perform(post("/api/v1/pautas")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 400 quando JSON for inválido")
    void deveRetornarBadRequestJsonInvalido() throws Exception {
        String json = """
        {
            "titulo": "Pauta",
            "descricao": "Descricao"
        """;

        mockMvc.perform(post("/api/v1/pautas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

}