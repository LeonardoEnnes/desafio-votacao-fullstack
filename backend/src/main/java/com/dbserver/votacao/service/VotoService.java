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
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VotoService {

    private final VotoRepository votoRepository;
    private final SessaoRepository sessaoRepository;
    private final PautaService pautaService;
    private final AssociadoService associadoService;
    private final ValidadorCpfExternoClient validadorCpfExternoClient;

    @Transactional
    public VotoResponseDto registrarVoto(UUID pautaId, VotoRequestDto dto) {
        Pauta pauta = pautaService.buscarPorId(pautaId);

        Sessao sessao = sessaoRepository.findByPautaId(pautaId)
                .orElseThrow(() -> new IllegalStateException("Não existe sessão de votação aberta para esta pauta."));

        if (LocalDateTime.now().isAfter(sessao.getDataFechamento())) {
            throw new IllegalStateException("A sessão de votação já está encerrada.");
        }

        Associado associado = associadoService.buscarPorCpf(dto.associadoCpf());

        if (votoRepository.existsByPautaIdAndAssociadoId(pautaId, associado.getId())) {
            throw new IllegalStateException("O associado já votou nesta pauta.");
        }

        ElegibilidadeVoto elegibilidade = validadorCpfExternoClient.verificarElegibilidade(dto.associadoCpf());

        if (elegibilidade == ElegibilidadeVoto.UNABLE_TO_VOTE) {
            throw new IllegalStateException("O associado não está apto a votar nesta pauta (UNABLE_TO_VOTE).");
        }

        Voto voto = Voto.builder()
                .pauta(pauta)
                .associado(associado)
                .valor(dto.valor())
                .build();

        Voto votoSalvo = votoRepository.save(voto);
        return VotoResponseDto.fromEntity(votoSalvo);
    }
}
