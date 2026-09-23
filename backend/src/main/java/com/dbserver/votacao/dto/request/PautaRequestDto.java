package com.dbserver.votacao.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PautaRequestDto(
        @NotBlank(message = "O título da pauta é obrigatório")
        @Size(min = 3, max = 255, message = "O título deve ter entre 3 e 255 caracteres")
        String titulo,

        @NotBlank(message = "Descrição é obrigatória")
        @Size(
                min = 3,
                max = 500,
                message = "A descrição deve ter entre 3 e 500 caracteres"
        )
        String descricao
) { }