package com.dbserver.votacao.service;

import com.dbserver.votacao.domain.Associado;
import com.dbserver.votacao.dto.request.AssociadoRequestDto;
import com.dbserver.votacao.dto.response.AssociadoResponseDto;
import com.dbserver.votacao.exception.ResourceNotFoundException;
import com.dbserver.votacao.repository.AssociadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AssociadoService {
    private final AssociadoRepository associadoRepository;

    @Transactional
    public AssociadoResponseDto cadastrarAssociado(AssociadoRequestDto associadoRequestDto) {
        if (associadoRepository.findByCpf(associadoRequestDto.cpf()).isPresent()) {
            throw new IllegalStateException("Associado já cadastrado com este CPF.");
        }

        Associado associado = Associado.builder()
                .cpf(associadoRequestDto.cpf())
                .build();

        Associado salvo = associadoRepository.save(associado);
        return AssociadoResponseDto.from(salvo);
    }

    @Transactional(readOnly = true)
    public Associado buscarPorCpf(String cpf) {
        return associadoRepository.findByCpf(cpf)
                .orElseThrow(() -> new ResourceNotFoundException("Associado não encontrado com o CPF informado."));
    }

}
