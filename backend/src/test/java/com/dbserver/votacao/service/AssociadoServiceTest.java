package com.dbserver.votacao.service;

import com.dbserver.votacao.domain.Associado;
import com.dbserver.votacao.dto.request.AssociadoRequestDto;
import com.dbserver.votacao.dto.response.AssociadoResponseDto;
import com.dbserver.votacao.exception.ResourceNotFoundException;
import com.dbserver.votacao.repository.AssociadoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import java.util.UUID;

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
        Associado associadoSalvo = Associado.builder().id(UUID.randomUUID()).cpf(dto.cpf()).build();

        when(associadoRepository.findByCpf(dto.cpf())).thenReturn(Optional.empty());
        when(associadoRepository.save(any(Associado.class))).thenReturn(associadoSalvo);

        AssociadoResponseDto response = associadoService.cadastrarAssociado(dto);

        assertNotNull(response);
        assertEquals(dto.cpf(), response.cpf());
        verify(associadoRepository, times(1)).save(any(Associado.class));
    }

    @Test
    @DisplayName("Deve lançar exceção se CPF já estiver cadastrado (Validação prévia)")
    void deveLancarExcecaoCpfDuplicado() {
        AssociadoRequestDto dto = new AssociadoRequestDto("12345678901");
        Associado existente = Associado.builder().id(UUID.randomUUID()).cpf(dto.cpf()).build();

        when(associadoRepository.findByCpf(dto.cpf())).thenReturn(Optional.of(existente));

        assertThrows(IllegalStateException.class, () -> associadoService.cadastrarAssociado(dto));
        verify(associadoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar exceção ao capturar DataIntegrityViolationException (Concorrência)")
    void deveLancarExcecaoNaConcorrencia() {
        AssociadoRequestDto dto = new AssociadoRequestDto("12345678901");

        when(associadoRepository.findByCpf(dto.cpf())).thenReturn(Optional.empty());
        when(associadoRepository.save(any(Associado.class))).thenThrow(DataIntegrityViolationException.class);

        assertThrows(DataIntegrityViolationException.class, () -> associadoService.cadastrarAssociado(dto));
    }

    @Test
    @DisplayName("Deve buscar associado por CPF com sucesso")
    void deveBuscarPorCpf() {
        String cpf = "12345678901";
        Associado existente = Associado.builder().id(UUID.randomUUID()).cpf(cpf).build();

        when(associadoRepository.findByCpf(cpf)).thenReturn(Optional.of(existente));

        Associado resultado = associadoService.buscarPorCpf(cpf);

        assertNotNull(resultado);
        assertEquals(cpf, resultado.getCpf());
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException se CPF não existir")
    void deveLancarExcecaoCpfNaoEncontrado() {
        when(associadoRepository.findByCpf("00000000000")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> associadoService.buscarPorCpf("00000000000"));
    }
}