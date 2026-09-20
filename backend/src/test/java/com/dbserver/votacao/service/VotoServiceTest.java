package com.dbserver.votacao.service;

import com.dbserver.votacao.domain.Associado;
import com.dbserver.votacao.domain.Pauta;
import com.dbserver.votacao.domain.Sessao;
import com.dbserver.votacao.domain.Voto;
import com.dbserver.votacao.domain.enums.VotoEnum;
import com.dbserver.votacao.dto.request.VotoRequestDto;
import com.dbserver.votacao.dto.response.VotoResponseDto;
import com.dbserver.votacao.repository.AssociadoRepository;
import com.dbserver.votacao.repository.SessaoRepository;
import com.dbserver.votacao.repository.VotoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VotoServiceTest {

    @Mock
    private VotoRepository votoRepository;
    @Mock
    private SessaoRepository sessaoRepository;
    @Mock
    private AssociadoRepository associadoRepository;
    @Mock
    private PautaService pautaService;

    @InjectMocks
    private VotoService votoService;

    @Test
    @DisplayName("Deve registrar um voto com sucesso")
    void deveRegistrarVotoComSucesso() {
        UUID pautaId = UUID.randomUUID();
        String cpf = "12345678901";
        VotoRequestDto dto = new VotoRequestDto(cpf, VotoEnum.SIM);

        Pauta pauta = Pauta.builder().id(pautaId).titulo("Pauta Teste").build();
        Sessao sessao = Sessao.builder().dataFechamento(LocalDateTime.now().plusMinutes(10)).build();
        Associado associado = Associado.builder().id(UUID.randomUUID()).cpf(cpf).build();

        when(pautaService.buscarPorId(pautaId)).thenReturn(pauta);
        when(sessaoRepository.findByPautaId(pautaId)).thenReturn(Optional.of(sessao));
        when(associadoRepository.findByCpf(cpf)).thenReturn(Optional.of(associado));
        when(votoRepository.existsByPautaIdAndAssociadoId(pautaId, associado.getId())).thenReturn(false);
        when(votoRepository.save(any(Voto.class))).thenAnswer(i -> {
            Voto v = i.getArgument(0);
            v.setId(UUID.randomUUID());
            v.setDataVoto(LocalDateTime.now());
            return v;
        });

        VotoResponseDto response = votoService.registrarVoto(pautaId, dto);

        assertNotNull(response);
        assertEquals(VotoEnum.SIM, response.valor());
        assertEquals(cpf, response.associadoCpf());
        verify(votoRepository, times(1)).save(any(Voto.class));
    }

    @Test
    @DisplayName("Deve lançar exceção se a sessão estiver encerrada")
    void deveLancarExcecaoSessaoEncerrada() {
        UUID pautaId = UUID.randomUUID();
        VotoRequestDto dto = new VotoRequestDto("12345678901", VotoEnum.SIM);

        Pauta pauta = Pauta.builder().id(pautaId).build();
        // Sessão com data no passado
        Sessao sessao = Sessao.builder().dataFechamento(LocalDateTime.now().minusMinutes(5)).build();

        when(pautaService.buscarPorId(pautaId)).thenReturn(pauta);
        when(sessaoRepository.findByPautaId(pautaId)).thenReturn(Optional.of(sessao));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> votoService.registrarVoto(pautaId, dto));
        assertEquals("A sessão de votação já está encerrada.", ex.getMessage());
        verify(votoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar exceção se associado já votou na pauta")
    void deveLancarExcecaoVotoDuplicado() {
        UUID pautaId = UUID.randomUUID();
        String cpf = "12345678901";
        VotoRequestDto dto = new VotoRequestDto(cpf, VotoEnum.NAO);

        Pauta pauta = Pauta.builder().id(pautaId).build();
        Sessao sessao = Sessao.builder().dataFechamento(LocalDateTime.now().plusMinutes(10)).build();
        Associado associado = Associado.builder().id(UUID.randomUUID()).cpf(cpf).build();

        when(pautaService.buscarPorId(pautaId)).thenReturn(pauta);
        when(sessaoRepository.findByPautaId(pautaId)).thenReturn(Optional.of(sessao));
        when(associadoRepository.findByCpf(cpf)).thenReturn(Optional.of(associado));

        // Simula que o associado já votou
        when(votoRepository.existsByPautaIdAndAssociadoId(pautaId, associado.getId())).thenReturn(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> votoService.registrarVoto(pautaId, dto));
        assertEquals("O associado já votou nesta pauta.", ex.getMessage());
    }
}