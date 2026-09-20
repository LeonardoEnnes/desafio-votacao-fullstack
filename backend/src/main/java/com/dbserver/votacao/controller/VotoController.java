package com.dbserver.votacao.controller;

import com.dbserver.votacao.dto.request.VotoRequestDto;
import com.dbserver.votacao.dto.response.VotoResponseDto;
import com.dbserver.votacao.service.VotoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pautas")
@RequiredArgsConstructor
public class VotoController {

    private final VotoService votoService;

    @PostMapping("/{pautaId}/votos")
    public ResponseEntity<VotoResponseDto> registrarVoto(@PathVariable UUID pautaId, @RequestBody @Valid VotoRequestDto votoRequestDto) {

        VotoResponseDto response = votoService.registrarVoto(pautaId, votoRequestDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
