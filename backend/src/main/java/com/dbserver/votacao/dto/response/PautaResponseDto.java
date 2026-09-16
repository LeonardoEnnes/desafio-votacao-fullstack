package com.dbserver.votacao.dto.response;

import com.dbserver.votacao.domain.Pauta;

import java.time.LocalDateTime;
import java.util.UUID;

public record PautaResponseDto(
        UUID id,
        String titulo,
        String descricao,
        LocalDateTime dataCriacao
) {
    public static PautaResponseDto fromEntity(Pauta pauta) {
        return new PautaResponseDto(
                pauta.getId(),
                pauta.getTitulo(),
                pauta.getDescricao(),
                pauta.getDataCriacao()
        );
    }
}
