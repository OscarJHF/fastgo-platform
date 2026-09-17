package com.fastgo.controller;

import com.fastgo.dto.CalcularTarifaRequest;
import com.fastgo.dto.TarifaResponseDTO;
import com.fastgo.service.TarifaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/domicilios")
public class TarifaController {

    private final TarifaService tarifaService;

    public TarifaController(TarifaService tarifaService) {
        this.tarifaService = tarifaService;
    }

    @PostMapping("/calcular-tarifa")
    public ResponseEntity<TarifaResponseDTO> calcularTarifa(@RequestBody(required = false) CalcularTarifaRequest request) {
        return ResponseEntity.ok(tarifaService.calcular(request));
    }
}
