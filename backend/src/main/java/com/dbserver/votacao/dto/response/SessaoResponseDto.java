package com.dbserver.votacao.dto.response;

import com.dbserver.votacao.domain.Sessao;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.UUID;

public record SessaoResponseDto(
        UUID id,
        UUID pautaId,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime dataAbertura,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime dataFechamento
) {
    public static SessaoResponseDto fromEntity(Sessao sessao) {
        return new SessaoResponseDto(
                sessao.getId(),
                sessao.getPauta().getId(),
                sessao.getDataAbertura(),
                sessao.getDataFechamento()
        );
    }
}
