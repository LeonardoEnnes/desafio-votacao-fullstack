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
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Transactional
    public VotoResponseDto registrarVoto(UUID pautaId, VotoRequestDto dto) {
        log.info("iniciando registro de voto na pauta ID: {}", pautaId);

        Pauta pauta = pautaService.buscarPorId(pautaId);

        Sessao sessao = sessaoRepository.findByPautaId(pautaId)
                .orElseThrow(() -> {
                    log.warn("Voto negado: Nenhuma sessão aberta para a pauta ID: {}", pautaId);
                    return new IllegalStateException("Não existe sessão de votação aberta para esta pauta.");
                });

        if (LocalDateTime.now().isAfter(sessao.getDataFechamento())) {
            log.warn("Voto negado: Sessão já encerrada para a pauta ID: {}", pautaId);
            throw new IllegalStateException("A sessão de votação já está encerrada.");
        }

        Associado associado = associadoService.buscarPorCpf(dto.associadoCpf());

        if (votoRepository.existsByPautaIdAndAssociadoId(pautaId, associado.getId())) {
            log.warn("voto negado: Associado ID {} já votou na pauta ID: {}", associado.getId(), pautaId);
            throw new IllegalStateException("O associado já votou nesta pauta.");
        }

        ElegibilidadeVoto elegibilidade = validadorCpfExternoClient.verificarElegibilidade(dto.associadoCpf());

        if (elegibilidade == ElegibilidadeVoto.UNABLE_TO_VOTE) {
            log.warn("voto negado: Associado ID {} foi classificado como impedido de votar", associado.getId());
            throw new IllegalStateException("O associado não está apto a votar nesta pauta (UNABLE_TO_VOTE).");
        }

        Voto voto = Voto.builder()
                .pauta(pauta)
                .associado(associado)
                .valor(dto.valor())
                .build();

        Voto votoSalvo = votoRepository.save(voto);
        log.info("Voto registrado com sucesso: ID do Voto: {}, Associado ID: {}, Pauta ID: {}", votoSalvo.getId(), associado.getId(), pautaId);

        return VotoResponseDto.fromEntity(votoSalvo);
    }

}
