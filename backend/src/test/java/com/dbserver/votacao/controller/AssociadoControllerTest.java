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
    @DisplayName("POST /api/v1/associados - Deve cadastrar associado com sucesso")
    void deveCadastrarAssociado() throws Exception {
        AssociadoRequestDto request = new AssociadoRequestDto("12345678901");

        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(associadoRequestTester.write(request).getJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cpf").value("12345678901"))
                .andExpect(jsonPath("$.uuid").exists())
                .andDo(print());

        assertEquals(1, associadoRepository.count());
    }

    @Test
    @DisplayName("POST /api/v1/associados - Deve retornar 409 Conflict se CPF já existir")
    void deveRetornarConflictCpfDuplicado() throws Exception {
        AssociadoRequestDto request = new AssociadoRequestDto("12345678901");

        // Cadastra direto no banco para simular duplicidade
        associadoRepository.save(Associado.builder().cpf("12345678901").build());

        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(associadoRequestTester.write(request).getJson()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Associado já cadastrado com este CPF."))
                .andDo(print());
    }

    @Test
    @DisplayName("POST /api/v1/associados - Deve retornar 400 Bad Request se CPF for inválido")
    void deveRetornarBadRequestCpfInvalido() throws Exception {
        // CPF com letras (deve ter 11 dígitos numéricos)
        AssociadoRequestDto request = new AssociadoRequestDto("123456789XX");

        mockMvc.perform(post("/api/v1/associados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(associadoRequestTester.write(request).getJson()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.messages.cpf").exists())
                .andDo(print());
    }
}