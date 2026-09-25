package com.dbserver.votacao.service;

import com.dbserver.votacao.client.ElegibilidadeVoto;
import com.dbserver.votacao.client.ValidadorCpfExternoClient;
import com.dbserver.votacao.domain.Associado;
import com.dbserver.votacao.domain.Pauta;
import com.dbserver.votacao.domain.Sessao;
import com.dbserver.votacao.domain.Voto;
import com.dbserver.votacao.dto.request.VotoRequestDto;
import com.dbserver.votacao.dto.response.VotoResponseDto;
import com.dbserver.votacao.repository.SessaoRepository;
import com.dbserver.votacao.repository.VotoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class VotoService {

    private final VotoRepository votoRepository;
    private final SessaoRepository sessaoRepository;
    private final PautaService pautaService;
    private final AssociadoService associadoService;
    private final ValidadorCpfExternoClient validadorCpfExternoClient;

    public VotoResponseDto registrarVoto(UUID pautaId, VotoRequestDto dto) {
        log.info("iniciando registro de voto na pauta ID: {}", pautaId);

        Pauta pauta = pautaService.buscarPorId(pautaId);

        Sessao sessao = sessaoRepository.findByPautaId(pautaId)
                .orElseThrow(() -> {
                    log.warn("Voto negado: Nenhuma sessão aberta para a pauta ID: {}", pautaId);
                    return new IllegalStateException("Não existe sessão de votação aberta para esta pauta.");
                });

        if (LocalDateTime.now().isAfter(sessao.getDataFechamento())) {
            throw new IllegalStateException("A sessão de votação já está encerrada.");
        }

        ElegibilidadeVoto elegibilidade = validadorCpfExternoClient.verificarElegibilidade(dto.associadoCpf());
        if (elegibilidade == ElegibilidadeVoto.UNABLE_TO_VOTE) {
            throw new IllegalStateException("O associado não está apto a votar nesta pauta (UNABLE_TO_VOTE).");
        }

        Associado associado = associadoService.buscarPorCpf(dto.associadoCpf());

        Voto voto = Voto.builder()
                .pauta(pauta)
                .associado(associado)
                .valor(dto.valor())
                .build();

        try {
            Voto votoSalvo = votoRepository.saveAndFlush(voto);
            log.info("Voto registrado com sucesso: ID do Voto: {}", votoSalvo.getId());
            return VotoResponseDto.fromEntity(votoSalvo);

        } catch (DataIntegrityViolationException e) {
            log.warn("Voto negado por duplicidade estrutural (Constraint): Associado ID {} já votou na pauta ID: {}", associado.getId(), pautaId);
            throw new IllegalStateException("O associado já votou nesta pauta.");
        }
    }
}