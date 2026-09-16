package com.dbserver.votacao.service;

import com.dbserver.votacao.domain.Pauta;
import com.dbserver.votacao.dto.request.PautaRequestDto;
import com.dbserver.votacao.dto.response.PautaResponseDto;
import com.dbserver.votacao.repository.PautaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PautaService {

    private final PautaRepository pautaRepository;

    @Transactional
    public PautaResponseDto criaPauta(PautaRequestDto dto) {
        Pauta pauta = Pauta.builder()
                .titulo(dto.titulo())
                .descricao(dto.descricao())
                .build();

        Pauta pautaSalva = pautaRepository.save(pauta);
        return PautaResponseDto.fromEntity(pautaSalva);
    }

}
