package com.dbserver.votacao.controller;

import com.dbserver.votacao.dto.request.PautaRequestDto;
import com.dbserver.votacao.dto.response.PautaResponseDto;
import com.dbserver.votacao.service.PautaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/pautas")
public class PautaController {
    private final PautaService pautaService;

    @PostMapping
    public ResponseEntity<PautaResponseDto> criarNovaPauta(@RequestBody @Valid PautaRequestDto dto) {
        PautaResponseDto response = pautaService.criaPauta(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
