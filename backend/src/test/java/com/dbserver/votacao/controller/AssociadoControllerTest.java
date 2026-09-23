package com.dbserver.votacao.controller;

import com.dbserver.votacao.domain.Associado;
import com.dbserver.votacao.dto.request.AssociadoRequestDto;
import com.dbserver.votacao.repository.AssociadoRepository;
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
class AssociadoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JacksonTester<AssociadoRequestDto> associadoRequestTester;

    @Autowired
    private AssociadoRepository associadoRepository;

    @BeforeEach
    void setUp() {
        associadoRepository.deleteAll();
    }

    @Test
    @DisplayName("deve cadastrar associado com sucesso")
    void deveCadastrarAssociado() throws Exception {
        AssociadoRequestDto request =
                new AssociadoRequestDto("12345678901");

        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(associadoRequestTester.write(request).getJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cpf").value("12345678901"))
                .andExpect(jsonPath("$.uuid").isString())
                .andExpect(jsonPath("$.uuid").isNotEmpty());

        assertEquals(1, associadoRepository.count());
    }

    @Test
    @DisplayName("não deve criar associado quando CPF já estiver cadastrado")
    void naoDeveCriarAssociadoCpfDuplicado() throws Exception {
        associadoRepository.save(
                Associado.builder()
                        .cpf("12345678901")
                        .build()
        );

        AssociadoRequestDto request =
                new AssociadoRequestDto("12345678901");

        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(associadoRequestTester.write(request).getJson()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("Associado já cadastrado com este CPF."));

        assertEquals(1, associadoRepository.count());
    }


    @Test
    @DisplayName("deve retornar 400 Bad Request se CPF for invalido")
    void deveRetornarBadRequestCpfInvalido() throws Exception {
        AssociadoRequestDto request = new AssociadoRequestDto("123456789XX");

        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(associadoRequestTester.write(request).getJson()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.messages.cpf").exists())
                .andDo(print());
    }

    @Test
    @DisplayName("deve retornar 400 quando CPF possuir caracteres especiais")
    void deveRetornarBadRequestCpfComCaracteresEspeciais() throws Exception {
        AssociadoRequestDto request =
                new AssociadoRequestDto("123.456.789-01");

        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(associadoRequestTester.write(request).getJson()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.messages.cpf").exists());
    }

    @Test
    @DisplayName("Deve retornar 400 se CPF estiver vazio")
    void deveRetornarBadRequestCpfVazio() throws Exception {
        AssociadoRequestDto request = new AssociadoRequestDto("");

        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(associadoRequestTester.write(request).getJson()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.messages.cpf").exists());
    }

    @Test
    @DisplayName("deve retornar 400 se CPF tiver menos de 11 dígitos")
    void deveRetornarBadRequestCpfCurto() throws Exception {
        AssociadoRequestDto request = new AssociadoRequestDto("123456789"); // cpf curto

        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(associadoRequestTester.write(request).getJson()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.messages.cpf").exists());
    }

    @Test
    @DisplayName("deve retornar 400 se CPF for nulo")
    void deveRetornarBadRequestCpfNulo() throws Exception {
        String json = """
            {
                "cpf": null
            }
            """;

        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.messages.cpf").exists());
    }

    @Test
    @DisplayName("deve retornar 400 se CPF tiver mais de 11 dígitos")
    void deveRetornarBadRequestCpfLongo() throws Exception {
        AssociadoRequestDto request =
                new AssociadoRequestDto("123456789012");

        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(associadoRequestTester.write(request).getJson()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.messages.cpf").exists());
    }

    @Test
    @DisplayName("deve retornar 400 quando body estiver vazio")
    void deveRetornarBadRequestBodyVazio() throws Exception {
        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("deve retornar 400 quando JSON for inválido")
    void deveRetornarBadRequestJsonInvalido() throws Exception {
        String jsonInvalido = """
        {
            "cpf": "12345678901"
        """;

        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonInvalido))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("deve retornar 400 quando CPF não for informado")
    void deveRetornarBadRequestCpfAusente() throws Exception {
        String json = """
        {
        }
        """;

        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.messages.cpf").exists());
    }

    @Test
    @DisplayName("deve retornar 400 quando CPF possuir espaços")
    void deveRetornarBadRequestCpfComEspacos() throws Exception {
        AssociadoRequestDto request =
                new AssociadoRequestDto("123 456 789 01");

        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(associadoRequestTester.write(request).getJson()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.messages.cpf").exists());
    }

}