package com.dbserver.votacao.service;

import com.dbserver.votacao.domain.Pauta;
import com.dbserver.votacao.domain.enums.VotoEnum;
import com.dbserver.votacao.dto.request.PautaRequestDto;
import com.dbserver.votacao.dto.response.PautaResponseDto;
import com.dbserver.votacao.dto.response.PautaResultadoDto;
import com.dbserver.votacao.exception.ResourceNotFoundException;
import com.dbserver.votacao.repository.PautaRepository;
import com.dbserver.votacao.repository.VotoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PautaService {

    private final PautaRepository pautaRepository;
    private final VotoRepository votoRepository;

    @Transactional
    public PautaResponseDto criaPauta(PautaRequestDto dto) {
        Pauta pauta = Pauta.builder()
                .titulo(dto.titulo())
                .descricao(dto.descricao())
                .build();

        Pauta pautaSalva = pautaRepository.save(pauta);
        log.info("Nova pauta criada com sucesso. ID: {}, Título: '{}'", pautaSalva.getId(), pautaSalva.getTitulo());
        return PautaResponseDto.fromEntity(pautaSalva);
    }

    @Transactional(readOnly = true)
    public List<PautaResponseDto> listarPautas() {
        return pautaRepository.findAll()
                .stream()
                .map(PautaResponseDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public Pauta buscarPorId(UUID id) {

        return pautaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pauta não encontrada com o ID: " + id));
    }

    @Transactional(readOnly = true)
    public PautaResultadoDto obterResultadoPauta(UUID pautaId) {
        log.info("Calculando resultado para a pauta ID: {}", pautaId);
        Pauta pauta = buscarPorId(pautaId);

        long totalVotos = votoRepository.countByPautaId(pautaId);
        long totalSim = votoRepository.countByPautaIdAndValor(pautaId, VotoEnum.SIM);
        long totalNao = votoRepository.countByPautaIdAndValor(pautaId, VotoEnum.NAO);

        log.info("Resultado da pauta ID {}: Total de Votos: {} (SIM: {}, NAO: {})",
                pautaId, totalVotos, totalSim, totalNao);

        return new PautaResultadoDto(
                pauta.getId(),
                pauta.getTitulo(),
                totalVotos,
                totalSim,
                totalNao
        );
    }
}
