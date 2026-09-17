package com.dbserver.votacao.dto.request;

import com.dbserver.votacao.domain.enums.VotoEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record VotoRequestDto(
        @NotBlank(message = "O CPF do associado é obrigatório")
        @Pattern(regexp = "\\d{11}", message = "O CPF deve conter exatamente 11 dígitos numéricos")
        String associadoCpf,

        @NotNull(message = "O valor do voto (SIM ou NAO) é obrigatório")
        VotoEnum valor
) {
}
