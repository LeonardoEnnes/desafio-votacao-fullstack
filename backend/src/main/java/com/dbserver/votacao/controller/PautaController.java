package com.dbserver.votacao.controller;

import com.dbserver.votacao.dto.request.PautaRequestDto;
import com.dbserver.votacao.dto.response.PautaResponseDto;
import com.dbserver.votacao.dto.response.PautaResultadoDto;
import com.dbserver.votacao.service.PautaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/pautas")
@Tag(name = "Pautas", description = "Endpoints para criacao e consulta de pautas e resultados")
public class PautaController {
    private final PautaService pautaService;

    @Operation(summary = "Criar uma nova pauta", description = "Cria uma pauta para futura votacao.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Pauta criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados da requisicao invalidos")
    })
    @PostMapping
    public ResponseEntity<PautaResponseDto> criarNovaPauta(@RequestBody @Valid PautaRequestDto dto) {
        PautaResponseDto response = pautaService.criaPauta(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Listar todas as pautas", description = "Retorna uma lista com todas as pautas cadastradas.")
    @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso")
    @GetMapping
    public ResponseEntity<List<PautaResponseDto>> listarPautas() {
        List<PautaResponseDto> lista = pautaService.listarPautas();
        return ResponseEntity.ok(lista);
    }

    @Operation(summary = "Buscar pauta por ID", description = "Retorna os detalhes de uma pauta especifica.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pauta encontrada"),
            @ApiResponse(responseCode = "404", description = "Pauta não encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<PautaResponseDto> buscaPorId(@PathVariable UUID id) {
        var pauta = pautaService.buscarPorId(id);
        return ResponseEntity.ok(PautaResponseDto.fromEntity(pauta));
    }

    @Operation(summary = "Obter resultado da pauta", description = "Calcula e retorna o resultado da votacao de uma pauta.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Resultado calculado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Pauta não encontrada")
    })
    @GetMapping("/{id}/resultado")
    public ResponseEntity<PautaResultadoDto> obterResultado(@PathVariable UUID id) {
        PautaResultadoDto resultado = pautaService.obterResultadoPauta(id);
        return ResponseEntity.ok(resultado);
    }
}
