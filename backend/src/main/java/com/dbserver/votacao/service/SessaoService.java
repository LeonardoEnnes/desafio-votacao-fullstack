package com.dbserver.votacao.service;

import com.dbserver.votacao.domain.Pauta;
import com.dbserver.votacao.domain.Sessao;
import com.dbserver.votacao.dto.request.SessaoRequestDto;
import com.dbserver.votacao.dto.response.SessaoResponseDto;
import com.dbserver.votacao.repository.SessaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessaoService {

    private final SessaoRepository sessaoRepository;
    private final PautaService pautaService;

    @Transactional
    public SessaoResponseDto abrirSessao(UUID pautaId, SessaoRequestDto sessaoRequestDto) {
        Pauta pauta = pautaService.buscarPorId(pautaId);

        // validando se ja tem sessao aberta para a pauta
        if (sessaoRepository.existsByPautaId(pautaId)) {
            throw new IllegalStateException("Já existe uma sessão de votação cadastrada para esta pauta.");
        }

        int minutos = Optional.ofNullable(sessaoRequestDto)
                .map(SessaoRequestDto::tempoEmMinutos)
                .orElse(1); // 1minuto

        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime fechamento = agora.plusMinutes(minutos);

        Sessao sessao = Sessao.builder()
                .pauta(pauta)
                .dataAbertura(agora)
                .dataFechamento(fechamento)
                .build();

        Sessao sessaoSalva = sessaoRepository.save(sessao);
        return SessaoResponseDto.fromEntity(sessaoSalva);
    }

    @Transactional(readOnly = true)
    public List<SessaoResponseDto> listarSessoesAbertas() {
        LocalDateTime agora = LocalDateTime.now();
        return sessaoRepository.findByDataAberturaBeforeAndDataFechamentoAfter(agora, agora)
                .stream()
                .map(SessaoResponseDto::fromEntity)
                .toList();
    }
}