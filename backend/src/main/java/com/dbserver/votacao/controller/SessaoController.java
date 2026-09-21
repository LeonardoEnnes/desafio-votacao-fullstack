package com.dbserver.votacao.controller;

import com.dbserver.votacao.dto.request.SessaoRequestDto;
import com.dbserver.votacao.dto.response.SessaoResponseDto;
import com.dbserver.votacao.service.SessaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Sessoes", description = "Endpoints para gerenciamento de sessões de votacao")
public class SessaoController {

    private final SessaoService sessaoService;

    @Operation(summary = "Abrir uma sessão de votacao", description = "Abre uma sessao para uma pauta específica. Tempo default é 1 minuto se não informado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Sessao aberta com sucesso"),
            @ApiResponse(responseCode = "404", description = "Pauta não encontrada"),
            @ApiResponse(responseCode = "409", description = "Conflito: Ja existe uma sessao aberta para esta pauta")
    })
    @PostMapping("pautas/{pautaId}/sessoes")
    public ResponseEntity<SessaoResponseDto> abrirSessao(@PathVariable UUID pautaId, @RequestBody SessaoRequestDto sessaoRequestDto) {

        SessaoResponseDto response = sessaoService.abrirSessao(pautaId, sessaoRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Listar sessoes abertas", description = "Retorna uma lista de todas as sessoes que estão recebendo votos no momento.")
    @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso")
    @GetMapping("/sessoes/abertas")
    public ResponseEntity<List<SessaoResponseDto>> listarSessoesAbertas() {
        List<SessaoResponseDto> sessoes = sessaoService.listarSessoesAbertas();
        return ResponseEntity.ok(sessoes);
    }
}
