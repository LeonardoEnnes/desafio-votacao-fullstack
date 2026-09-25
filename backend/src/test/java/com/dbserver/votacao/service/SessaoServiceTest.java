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

import java.time.LocalDateTime;
import java.util.List;
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
    @DisplayName("Deve listar apenas sessões abertas com sucesso")
    void deveListarSessoesAbertas() {
        Pauta pauta = Pauta.builder().id(UUID.randomUUID()).titulo("Pauta Teste").build();
        Sessao sessaoAberta = Sessao.builder()
                .id(UUID.randomUUID())
                .pauta(pauta)
                .dataAbertura(LocalDateTime.now().minusMinutes(2))
                .dataFechamento(LocalDateTime.now().plusMinutes(2))
                .build();

        when(sessaoRepository.findSessoesAbertas(any(LocalDateTime.class)))
                .thenReturn(List.of(sessaoAberta));

        List<SessaoResponseDto> resultado = sessaoService.listarSessoesAbertas();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(sessaoRepository, times(1)).findSessoesAbertas(any());
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

    @Test
    @DisplayName("Deve criar sessão com fechamento 5 minutos após abertura")
    void deveCriarSessaoComTempoCustomizadoCorreto() {
        UUID pautaId = UUID.randomUUID();

        Pauta pauta = Pauta.builder()
                .id(pautaId)
                .titulo("Pauta Teste")
                .build();

        SessaoRequestDto requestDto = new SessaoRequestDto(5);

        when(pautaService.buscarPorId(pautaId)).thenReturn(pauta);

        when(sessaoRepository.existsByPautaId(pautaId)).thenReturn(false);

        when(sessaoRepository.save(any(Sessao.class)))
                .thenAnswer(invocation -> {
                    Sessao sessao = invocation.getArgument(0);

                    return Sessao.builder()
                            .id(UUID.randomUUID())
                            .pauta(sessao.getPauta())
                            .dataAbertura(sessao.getDataAbertura())
                            .dataFechamento(sessao.getDataFechamento())
                            .build();
                });

        LocalDateTime inicio = LocalDateTime.now();

        SessaoResponseDto response =
                sessaoService.abrirSessao(pautaId, requestDto);

        LocalDateTime fim = LocalDateTime.now();

        assertNotNull(response);
        assertFalse(response.dataAbertura().isBefore(inicio));
        assertFalse(response.dataAbertura().isAfter(fim));

        long segundos = java.time.Duration.between(
                response.dataAbertura(),
                response.dataFechamento()
        ).getSeconds();

        assertEquals(300, segundos);

        verify(pautaService, times(1))
                .buscarPorId(pautaId);

        verify(sessaoRepository, times(1))
                .existsByPautaId(pautaId);

        verify(sessaoRepository, times(1))
                .save(any(Sessao.class));
    }

    @Test
    @DisplayName("Deve usar 1 minuto como tempo padraao quando request for nulo")
    void deveUsarUmMinutoComoTempoPadrao() {
        UUID pautaId = UUID.randomUUID();

        Pauta pauta = Pauta.builder()
                .id(pautaId)
                .titulo("Pauta Teste")
                .build();

        when(pautaService.buscarPorId(pautaId))
                .thenReturn(pauta);

        when(sessaoRepository.existsByPautaId(pautaId))
                .thenReturn(false);

        when(sessaoRepository.save(any(Sessao.class)))
                .thenAnswer(invocation -> {
                    Sessao sessao = invocation.getArgument(0);

                    return Sessao.builder()
                            .id(UUID.randomUUID())
                            .pauta(sessao.getPauta())
                            .dataAbertura(sessao.getDataAbertura())
                            .dataFechamento(sessao.getDataFechamento())
                            .build();
                });

        SessaoResponseDto response =
                sessaoService.abrirSessao(pautaId, null);

        assertNotNull(response);

        long segundos = java.time.Duration.between(
                response.dataAbertura(),
                response.dataFechamento()
        ).getSeconds();

        assertEquals(60, segundos);

        verify(pautaService, times(1))
                .buscarPorId(pautaId);

        verify(sessaoRepository, times(1))
                .existsByPautaId(pautaId);

        verify(sessaoRepository, times(1))
                .save(any(Sessao.class));
    }

    @Test
    @DisplayName("Deve propagar excecao quando a pauta nao existir")
    void deveLancarExcecaoQuandoPautaNaoExistir() {
        UUID pautaId = UUID.randomUUID();

        RuntimeException excecao = new RuntimeException("Pauta não encontrada");

        when(pautaService.buscarPorId(pautaId)).thenThrow(excecao);

        RuntimeException resultado = assertThrows(
                RuntimeException.class,
                () -> sessaoService.abrirSessao(pautaId, null)
        );

        assertEquals(
                "Pauta não encontrada",
                resultado.getMessage()
        );

        verify(pautaService, times(1)).buscarPorId(pautaId);
        verify(sessaoRepository, never()).existsByPautaId(any());
        verify(sessaoRepository, never()).save(any(Sessao.class));
    }

    @Test
    @DisplayName("Deve retornar lista vazia quando não existirem sessões abertas")
    void deveRetornarListaVaziaQuandoNaoExistiremSessoesAbertas() {
        when(sessaoRepository.findSessoesAbertas(any(LocalDateTime.class)))
                .thenReturn(List.of());

        List<SessaoResponseDto> resultado =
                sessaoService.listarSessoesAbertas();

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());

        verify(sessaoRepository, times(1))
                .findSessoesAbertas(any(LocalDateTime.class));
    }

    @Test
    @DisplayName("Não deve salvar sessão quando já existir sessão para a pauta")
    void naoDeveSalvarQuandoSessaoJaExistir() {
        UUID pautaId = UUID.randomUUID();

        Pauta pauta = Pauta.builder()
                .id(pautaId)
                .titulo("Pauta Teste")
                .build();

        SessaoRequestDto requestDto =
                new SessaoRequestDto(5);

        when(pautaService.buscarPorId(pautaId)).thenReturn(pauta);
        when(sessaoRepository.existsByPautaId(pautaId)).thenReturn(true);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> sessaoService.abrirSessao(
                        pautaId,
                        requestDto
                )
        );

        assertEquals(
                "Já existe uma sessão de votação cadastrada para esta pauta.",
                exception.getMessage()
        );

        verify(pautaService, times(1))
                .buscarPorId(pautaId);

        verify(sessaoRepository, times(1))
                .existsByPautaId(pautaId);

        verify(sessaoRepository, never())
                .save(any(Sessao.class));
    }
}