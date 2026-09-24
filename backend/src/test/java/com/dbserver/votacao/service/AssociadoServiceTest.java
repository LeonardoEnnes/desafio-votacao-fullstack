package com.dbserver.votacao.service;

import com.dbserver.votacao.domain.Associado;
import com.dbserver.votacao.dto.request.AssociadoRequestDto;
import com.dbserver.votacao.dto.response.AssociadoResponseDto;
import com.dbserver.votacao.exception.ResourceNotFoundException;
import com.dbserver.votacao.repository.AssociadoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssociadoServiceTest {

    @Mock
    private AssociadoRepository associadoRepository;

    @InjectMocks
    private AssociadoService associadoService;

    @Test
    @DisplayName("Deve cadastrar um associado com sucesso")
    void deveCadastrarNovoAssociado() {
        AssociadoRequestDto dto = new AssociadoRequestDto("12345678901");

        Associado associadoSalvo = Associado.builder()
                .id(UUID.randomUUID())
                .cpf(dto.cpf())
                .build();

        when(associadoRepository.findByCpf(dto.cpf()))
                .thenReturn(Optional.empty());

        when(associadoRepository.save(any(Associado.class)))
                .thenReturn(associadoSalvo);

        AssociadoResponseDto response =
                associadoService.cadastrarAssociado(dto);

        assertNotNull(response);
        assertEquals(dto.cpf(), response.cpf());

        verify(associadoRepository, times(1))
                .findByCpf(dto.cpf());

        verify(associadoRepository, times(1))
                .save(any(Associado.class));
    }

    @Test
    @DisplayName("Deve cadastrar associado utilizando o CPF informado no DTO")
    void deveCadastrarAssociadoComCpfInformado() {
        AssociadoRequestDto dto = new AssociadoRequestDto("12345678901");

        Associado associadoSalvo = Associado.builder()
                .id(UUID.randomUUID())
                .cpf(dto.cpf())
                .build();

        when(associadoRepository.findByCpf(dto.cpf()))
                .thenReturn(Optional.empty());

        when(associadoRepository.save(any(Associado.class)))
                .thenReturn(associadoSalvo);

        ArgumentCaptor<Associado> captor =
                ArgumentCaptor.forClass(Associado.class);

        associadoService.cadastrarAssociado(dto);

        verify(associadoRepository).save(captor.capture());

        Associado associadoEnviado = captor.getValue();

        assertNotNull(associadoEnviado);
        assertEquals(dto.cpf(), associadoEnviado.getCpf());
    }

    @Test
    @DisplayName("Deve lançar exceção se CPF já estiver cadastrado")
    void deveLancarExcecaoCpfDuplicado() {
        AssociadoRequestDto dto =
                new AssociadoRequestDto("12345678901");

        Associado existente = Associado.builder()
                .id(UUID.randomUUID())
                .cpf(dto.cpf())
                .build();

        when(associadoRepository.findByCpf(dto.cpf()))
                .thenReturn(Optional.of(existente));

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> associadoService.cadastrarAssociado(dto)
        );

        assertEquals(
                "Associado já cadastrado com este CPF.",
                exception.getMessage()
        );

        verify(associadoRepository)
                .findByCpf(dto.cpf());

        verify(associadoRepository, never())
                .save(any(Associado.class));
    }

    @Test
    @DisplayName("Deve propagar DataIntegrityViolationException ao salvar")
    void devePropagarExcecaoDeIntegridadeAoSalvar() {
        AssociadoRequestDto dto =
                new AssociadoRequestDto("12345678901");

        when(associadoRepository.findByCpf(dto.cpf()))
                .thenReturn(Optional.empty());

        when(associadoRepository.save(any(Associado.class)))
                .thenThrow(new DataIntegrityViolationException(
                        "CPF duplicado"
                ));

        assertThrows(
                DataIntegrityViolationException.class,
                () -> associadoService.cadastrarAssociado(dto)
        );

        verify(associadoRepository)
                .findByCpf(dto.cpf());

        verify(associadoRepository)
                .save(any(Associado.class));
    }

    @Test
    @DisplayName("Deve buscar associado por CPF com sucesso")
    void deveBuscarPorCpf() {
        String cpf = "12345678901";

        Associado existente = Associado.builder()
                .id(UUID.randomUUID())
                .cpf(cpf)
                .build();

        when(associadoRepository.findByCpf(cpf))
                .thenReturn(Optional.of(existente));

        Associado resultado =
                associadoService.buscarPorCpf(cpf);

        assertNotNull(resultado);
        assertEquals(cpf, resultado.getCpf());
        assertEquals(existente.getId(), resultado.getId());

        verify(associadoRepository)
                .findByCpf(cpf);
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException se CPF não existir")
    void deveLancarExcecaoCpfNaoEncontrado() {
        String cpf = "00000000000";

        when(associadoRepository.findByCpf(cpf))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> associadoService.buscarPorCpf(cpf)
        );

        assertEquals(
                "Associado não encontrado com o CPF informado.",
                exception.getMessage()
        );

        verify(associadoRepository)
                .findByCpf(cpf);
    }
}
