package com.dbserver.votacao.service;

import com.dbserver.votacao.domain.Pauta;
import com.dbserver.votacao.domain.Sessao;
import com.dbserver.votacao.dto.request.SessaoRequestDto;
import com.dbserver.votacao.dto.response.SessaoResponseDto;
import com.dbserver.votacao.repository.SessaoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessaoServiceTest {

    @Mock
    private SessaoRepository sessaoRepository;

    @Mock
    private PautaService pautaService;

    @InjectMocks
    private SessaoService sessaoService;

    @Test
    @DisplayName("Deve abrir sessão com sucesso usando tempo customizado")
    void deveAbrirSessaoComSucesso() {
        UUID pautaId = UUID.randomUUID();
        Pauta pauta = Pauta.builder().id(pautaId).titulo("Pauta Teste").build();
        SessaoRequestDto requestDto = new SessaoRequestDto(5);

        when(pautaService.buscarPorId(pautaId)).thenReturn(pauta);
        when(sessaoRepository.existsByPautaId(pautaId)).thenReturn(false);

        // Simula o save retornando a sessai cm um ID gerado
        when(sessaoRepository.save(any(Sessao.class))).thenAnswer(invocation -> {
            Sessao s = invocation.getArgument(0);
            return Sessao.builder()
                    .id(UUID.randomUUID())
                    .pauta(s.getPauta())
                    .dataAbertura(s.getDataAbertura())
                    .dataFechamento(s.getDataFechamento())
                    .build();
        });

        SessaoResponseDto response = sessaoService.abrirSessao(pautaId, requestDto);

        assertNotNull(response);
        assertEquals(pautaId, response.pautaId());
        assertNotNull(response.dataAbertura());
        assertNotNull(response.dataFechamento());
        verify(sessaoRepository, times(1)).save(any(Sessao.class));
    }

    @Test
    @DisplayName("Deve abrir sessão com tempo padrão de 1 minuto quando request for nulo")
    void deveAbrirSessaoComTempoPadraoQuandoRequestNulo() {
        UUID pautaId = UUID.randomUUID();
        Pauta pauta = Pauta.builder().id(pautaId).titulo("Pauta Teste").build();

        when(pautaService.buscarPorId(pautaId)).thenReturn(pauta);
        when(sessaoRepository.existsByPautaId(pautaId)).thenReturn(false);

        when(sessaoRepository.save(any(Sessao.class))).thenAnswer(invocation -> {
            Sessao s = invocation.getArgument(0);
            return Sessao.builder()
                    .id(UUID.randomUUID())
                    .pauta(s.getPauta())
                    .dataAbertura(s.getDataAbertura())
                    .dataFechamento(s.getDataFechamento())
                    .build();
        });

        SessaoResponseDto response = sessaoService.abrirSessao(pautaId, null);

        assertNotNull(response);
        assertEquals(pautaId, response.pautaId());
        verify(sessaoRepository, times(1)).save(any(Sessao.class));
    }

    @Test
    @DisplayName("Deve lançar IllegalStateException quando já existir sessão para a pauta")
    void deveLancarExcecaoQuandoSessaoJaExistir() {
        UUID pautaId = UUID.randomUUID();
        Pauta pauta = Pauta.builder().id(pautaId).titulo("Pauta Teste").build();
        SessaoRequestDto requestDto = new SessaoRequestDto(2);

        when(pautaService.buscarPorId(pautaId)).thenReturn(pauta);
        // true se a sessao já existir
        when(sessaoRepository.existsByPautaId(pautaId)).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> {
            sessaoService.abrirSessao(pautaId, requestDto);
        });

        verify(sessaoRepository, never()).save(any(Sessao.class));
    }
}