package com.dbserver.votacao.dto.response;

import com.dbserver.votacao.domain.Voto;
import com.dbserver.votacao.domain.enums.VotoEnum;
import java.time.LocalDateTime;
import java.util.UUID;

public record VotoResponseDto(
        UUID id,
        UUID pautaId,
        String associadoCpf,
        VotoEnum valor,
        LocalDateTime dataVoto
) {
    public static VotoResponseDto fromEntity(Voto voto) {
        return new VotoResponseDto(
                voto.getId(),
                voto.getPauta().getId(),
                voto.getAssociado().getCpf(),
                voto.getValor(),
                voto.getDataVoto()
        );
    }
}