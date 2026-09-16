package com.dbserver.votacao.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PautaRequestDto(
        @NotBlank(message = "O título da pauta é obrigatório")
        @Size(min = 3, max = 255, message = "O título deve ter entre 3 e 255 caracteres")
        String titulo,

        String descricao
) { }
