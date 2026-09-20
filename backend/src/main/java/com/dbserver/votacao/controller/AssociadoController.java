package com.dbserver.votacao.controller;

import com.dbserver.votacao.dto.request.AssociadoRequestDto;
import com.dbserver.votacao.dto.response.AssociadoResponseDto;
import com.dbserver.votacao.service.AssociadoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/associados")
@RequiredArgsConstructor
public class AssociadoController {
    private final AssociadoService associadoService;

    @PostMapping
    public ResponseEntity<AssociadoResponseDto> cadastrarAssociado(
            @RequestBody @Valid AssociadoRequestDto associadoRequestDto) {

        AssociadoResponseDto response = associadoService.cadastrarAssociado(associadoRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
