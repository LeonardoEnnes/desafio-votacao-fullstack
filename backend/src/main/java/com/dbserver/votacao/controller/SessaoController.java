package com.dbserver.votacao.controller;

import com.dbserver.votacao.dto.request.SessaoRequestDto;
import com.dbserver.votacao.dto.response.SessaoResponseDto;
import com.dbserver.votacao.service.SessaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SessaoController {

    private final SessaoService sessaoService;

    @PostMapping("pautas/{pautaId}/sessoes")
    public ResponseEntity<SessaoResponseDto> abrirSessao(@PathVariable UUID pautaId, @RequestBody SessaoRequestDto sessaoRequestDto) {

        SessaoResponseDto response = sessaoService.abrirSessao(pautaId, sessaoRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/sessoes/abertas")
    public ResponseEntity<List<SessaoResponseDto>> listarSessoesAbertas() {
        List<SessaoResponseDto> sessoes = sessaoService.listarSessoesAbertas();
        return ResponseEntity.ok(sessoes);
    }
}
