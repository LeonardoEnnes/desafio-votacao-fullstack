package com.dbserver.votacao.dto.request;

import jakarta.validation.constraints.Min;

public record SessaoRequestDto(
        @Min(value = 1, message = "O tempo da sessão deve ser de no mínimo 1 minuto")
        Integer tempoEmMinutos
) {
}
