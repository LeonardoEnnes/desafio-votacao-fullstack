package com.dbserver.votacao.dto.response;

import java.util.UUID;

public record PautaResultadoDto(
        UUID id,
        String titulo,
        Long totalVotos,
        Long totalVotosSim,
        Long totalVotosNao
) {
}
