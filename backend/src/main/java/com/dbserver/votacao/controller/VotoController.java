package com.dbserver.votacao.controller;

import com.dbserver.votacao.dto.request.VotoRequestDto;
import com.dbserver.votacao.dto.response.VotoResponseDto;
import com.dbserver.votacao.service.VotoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pautas")
@RequiredArgsConstructor
@Tag(name = "Votos", description = "Endpoints para registro de votos nas pautas")
public class VotoController {

    private final VotoService votoService;

    @Operation(summary = "Registrar um voto", description = "Permite que um associado vote (SIM ou NAO) em uma pauta com sessao ativa.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Voto registrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados da requisicao inválidos (Ex: Enum incorreto ou CPF invalido)"),
            @ApiResponse(responseCode = "404", description = "Pauta não encontrada, Associado não cadastrado ou CPF invalido no validador externo"),
            @ApiResponse(responseCode = "409", description = "Conflito: Associado ja votou, sessão encerrada ou CPF inapto a votar")
    })
    @PostMapping("/{pautaId}/votos")
    public ResponseEntity<VotoResponseDto> registrarVoto(@PathVariable UUID pautaId, @RequestBody @Valid VotoRequestDto votoRequestDto) {

        VotoResponseDto response = votoService.registrarVoto(pautaId, votoRequestDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
