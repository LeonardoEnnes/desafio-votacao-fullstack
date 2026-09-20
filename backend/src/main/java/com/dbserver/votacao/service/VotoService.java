package com.dbserver.votacao.service;

import com.dbserver.votacao.domain.Associado;
import com.dbserver.votacao.domain.Pauta;
import com.dbserver.votacao.domain.Sessao;
import com.dbserver.votacao.domain.Voto;
import com.dbserver.votacao.dto.request.VotoRequestDto;
import com.dbserver.votacao.dto.response.VotoResponseDto;
import com.dbserver.votacao.repository.AssociadoRepository;
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
    private final AssociadoRepository associadoRepository;
    private final PautaService pautaService;

    @Transactional
    public VotoResponseDto registrarVoto(UUID pautaId, VotoRequestDto dto) {
        Pauta pauta = pautaService.buscarPorId(pautaId);

        Sessao sessao = sessaoRepository.findByPautaId(pautaId)
                .orElseThrow(() -> new IllegalStateException("Não existe sessão de votação aberta para esta pauta."));

        LocalDateTime tempoAtual = LocalDateTime.now();

        if (tempoAtual.isAfter(sessao.getDataFechamento())) {
            String msg = "A sessão de votação já está encerrada.";
            throw new IllegalStateException(msg);
        }

        Associado associado = associadoRepository.findByCpf(dto.associadoCpf())
                .orElseGet(() -> associadoRepository.save(
                        Associado.builder().cpf(dto.associadoCpf()).build()
                ));

        if (votoRepository.existsByPautaIdAndAssociadoId(pautaId, associado.getId())) {
            throw new IllegalStateException("O associado já votou nesta pauta.");
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
