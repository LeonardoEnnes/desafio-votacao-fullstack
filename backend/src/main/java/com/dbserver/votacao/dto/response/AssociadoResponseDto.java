package com.dbserver.votacao.dto.response;

import com.dbserver.votacao.domain.Associado;

import java.util.UUID;

public record AssociadoResponseDto(
        UUID uuid,
        String cpf
) {
    public static AssociadoResponseDto from(Associado associado) {
        return new AssociadoResponseDto(
                associado.getId(),
                associado.getCpf()
        );
    }
}
