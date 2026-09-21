package com.dbserver.votacao.controller;

import com.dbserver.votacao.dto.request.AssociadoRequestDto;
import com.dbserver.votacao.dto.response.AssociadoResponseDto;
import com.dbserver.votacao.service.AssociadoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Associados", description = "Endpoints para gerenciamento de associados")
public class AssociadoController {
    private final AssociadoService associadoService;

    @Operation(summary = "Cadastrar um novo associado", description = "Registra um associado no sistema utilizando o CPF.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Associado cadastrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados da requisição inválidos (Ex: CPF em branco)"),
            @ApiResponse(responseCode = "409", description = "Conflito: Associado já cadastrado com este CPF")
    })
    @PostMapping
    public ResponseEntity<AssociadoResponseDto> cadastrarAssociado(
            @RequestBody @Valid AssociadoRequestDto associadoRequestDto) {

        AssociadoResponseDto response = associadoService.cadastrarAssociado(associadoRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
