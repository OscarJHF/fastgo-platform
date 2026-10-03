package com.fastgo.controller;

import com.fastgo.dto.DepartamentoDTO;
import com.fastgo.dto.MunicipioDTO;
import com.fastgo.service.GeografiaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/geografia")
public class GeografiaController {

    private final GeografiaService geografiaService;

    public GeografiaController(GeografiaService geografiaService) {
        this.geografiaService = geografiaService;
    }

    @GetMapping("/departamentos")
    public ResponseEntity<List<DepartamentoDTO>> listarDepartamentos() {
        return ResponseEntity.ok(geografiaService.listarDepartamentos());
    }

    @GetMapping("/departamentos/{departamentoId}/municipios")
    public ResponseEntity<List<MunicipioDTO>> listarMunicipiosPorDepartamento(
            @PathVariable String departamentoId) {
        return ResponseEntity.ok(geografiaService.listarMunicipiosPorDepartamento(departamentoId));
    }

    @GetMapping("/municipios")
    public ResponseEntity<List<MunicipioDTO>> listarTodosMunicipios() {
        return ResponseEntity.ok(geografiaService.listarTodosMunicipios());
    }

    @GetMapping("/municipios/{municipioId}")
    public ResponseEntity<MunicipioDTO> obtenerMunicipio(
            @PathVariable String municipioId) {
        MunicipioDTO m = geografiaService.obtenerMunicipio(municipioId);
        if (m == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(m);
    }
}
