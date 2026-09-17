package com.dbserver.votacao.controller;

import com.dbserver.votacao.domain.Pauta;
import com.dbserver.votacao.dto.request.PautaRequestDto;
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

    @BeforeEach
    void setUp() {
        votoRepository.deleteAll();
        pautaRepository.deleteAll();
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
                .andExpect(jsonPath("$.descricao").value("Descricao da Pauta"))
                .andDo(print());

        assertEquals(1, pautaRepository.count());
    }

    @Test
    @DisplayName("Deve lancar BadRequest quando titulo for invalido")
    void deveLancarExceptionTituloNulo() throws Exception {
        PautaRequestDto requestDto = new PautaRequestDto("", "Descricao");

        mockMvc.perform(post("/api/v1/pautas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pautaRequestTester.write(requestDto).getJson()))
                .andExpect(status().isBadRequest())
                .andDo(print());

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
                .andExpect(jsonPath("$[0].titulo").value("Pauta Listada"))
                .andDo(print());
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
                .andExpect(jsonPath("$.titulo").value("Pauta ID"))
                .andDo(print());
    }

    @Test
    @DisplayName("Deve retornar 404 quando pauta nao existir")
    void deveRetornarNotFoundQuandoPautaNaoExistir() throws Exception {
        UUID idInexistente = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/pautas/{id}", idInexistente))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andDo(print());
    }
}