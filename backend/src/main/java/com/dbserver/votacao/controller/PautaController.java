package com.dbserver.votacao.controller;

import com.dbserver.votacao.dto.request.PautaRequestDto;
import com.dbserver.votacao.dto.response.PautaResponseDto;
import com.dbserver.votacao.dto.response.PautaResultadoDto;
import com.dbserver.votacao.service.PautaService;
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
public class PautaController {
    private final PautaService pautaService;

    @PostMapping
    public ResponseEntity<PautaResponseDto> criarNovaPauta(@RequestBody @Valid PautaRequestDto dto) {
        PautaResponseDto response = pautaService.criaPauta(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PautaResponseDto>> listarPautas() {
        List<PautaResponseDto> lista = pautaService.listarPautas();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PautaResponseDto> buscaPorId(@PathVariable UUID id) {
        var pauta = pautaService.buscarPorId(id);
        return ResponseEntity.ok(PautaResponseDto.fromEntity(pauta));
    }

    @GetMapping("/{id}/resultado")
    public ResponseEntity<PautaResultadoDto> obterResultado(@PathVariable UUID id) {
        PautaResultadoDto resultado = pautaService.obterResultadoPauta(id);
        return ResponseEntity.ok(resultado);
    }
}
