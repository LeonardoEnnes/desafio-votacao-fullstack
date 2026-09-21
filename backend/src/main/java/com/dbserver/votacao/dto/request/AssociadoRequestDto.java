package com.dbserver.votacao.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AssociadoRequestDto(
        @NotBlank(message = "O CPF é obrigatorio")
        @Pattern(regexp = "\\d{11}", message = "O CPF deve conter 11 digitos numericos")
        @Schema(description = "CPF do associado (apenas números)", example = "52998224725") // cpf valido apenas para facilitar teste
        String cpf
) {
}
