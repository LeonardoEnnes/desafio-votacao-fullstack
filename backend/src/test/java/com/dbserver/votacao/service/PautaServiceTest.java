package com.dbserver.votacao.service;

import com.dbserver.votacao.domain.Pauta;
import com.dbserver.votacao.domain.enums.VotoEnum;
import com.dbserver.votacao.dto.request.PautaRequestDto;
import com.dbserver.votacao.dto.response.PautaResponseDto;
import com.dbserver.votacao.dto.response.PautaResultadoDto;
import com.dbserver.votacao.exception.ResourceNotFoundException;
import com.dbserver.votacao.repository.PautaRepository;
import com.dbserver.votacao.repository.VotoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PautaServiceTest {

    @Mock
    PautaRepository pautaRepository;

    @Mock
    private VotoRepository votoRepository;

    @InjectMocks
    PautaService pautaService;

    @Test
    @DisplayName("Deve criar pauta com sucesso quando dados sao validos")
    void deveCriarPautaComSucesso() {

        PautaRequestDto requestDto = new PautaRequestDto("Pauta Teste", "Descrição da pauta");
        Pauta pautaSalva = Pauta.builder()
                .id(UUID.randomUUID())
                .titulo("Pauta Teste")
                .descricao("Descrição da pauta")
                .build();

        when(pautaRepository.save(any(Pauta.class))).thenReturn(pautaSalva);

        PautaResponseDto response = pautaService.criaPauta(requestDto);

        assertNotNull(response);
        assertEquals(pautaSalva.getId(), response.id());
        assertEquals("Pauta Teste", response.titulo());
        verify(pautaRepository, times(1)).save(any(Pauta.class));
    }

    @Test
    @DisplayName("Deve lançar NotFoundException quando a pauta não for encontrada por ID")
    void deveLancarNotFoundQuandoPautaNaoEncontrada() {
        UUID idInexistente = UUID.randomUUID();
        when(pautaRepository.findById(idInexistente)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            pautaService.buscarPorId(idInexistente);
        });

        verify(pautaRepository, times(1)).findById(idInexistente);
    }

    @Test
    @DisplayName("deve retornar lista vazia quando nao tiver pautas no banco de dados")
    void deveRetornarListaVaziaQuandoNaoExistirPautas() {
        when(pautaRepository.findAll()).thenReturn(java.util.Collections.emptyList());

        List<PautaResponseDto> response = pautaService.listarPautas();

        assertNotNull(response);
        assertTrue(response.isEmpty());
        verify(pautaRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("deve retornar zero votos quando nao obtiver pautas ainda")
    void deveRetornarZeroVotosQuandoNaoExistirPautas() {
        UUID pautaId = UUID.randomUUID();
        Pauta pauta = Pauta.builder()
                .id(pautaId)
                .titulo("Pauta Sem Votos")
                .build();

        when(pautaRepository.findById(pautaId)).thenReturn(Optional.of(pauta));
        when(votoRepository.countByPautaId(pautaId)).thenReturn(0L);
        when(votoRepository.countByPautaIdAndValor(pautaId, VotoEnum.SIM)).thenReturn(0L);
        when(votoRepository.countByPautaIdAndValor(pautaId, VotoEnum.NAO)).thenReturn(0L);

        PautaResultadoDto resultado = pautaService.obterResultadoPauta(pautaId);

        assertNotNull(resultado);
        assertEquals(pautaId, resultado.id());
        assertEquals(0L, resultado.totalVotos());
        assertEquals(0L, resultado.totalVotosSim());
        assertEquals(0L, resultado.totalVotosNao());

        verify(pautaRepository, times(1)).findById(pautaId);
        verify(votoRepository, times(1)).countByPautaId(pautaId);
    }
}
