package com.dbserver.votacao.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AssociadoRequestDto(
        @NotBlank(message = "O CPF é obrigatorio")
        @Pattern(regexp = "\\d{11}", message = "O CPF deve conter 11 digitos numericos")
        String cpf
) {
}
