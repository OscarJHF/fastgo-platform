package com.fastgo.controller;

import com.fastgo.dto.ActualizarEstadoEncomiendaRequest;
import com.fastgo.dto.CrearEncomiendaRequest;
import com.fastgo.dto.EncomiendaResponseDTO;
import com.fastgo.service.EncomiendaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/encomiendas")
public class EncomiendaController {

    private final EncomiendaService encomiendaService;

    public EncomiendaController(EncomiendaService encomiendaService) {
        this.encomiendaService = encomiendaService;
    }

    @PostMapping
    public ResponseEntity<EncomiendaResponseDTO> crear(
            @Valid @RequestBody CrearEncomiendaRequest request) {
        return ResponseEntity.ok(encomiendaService.crear(request));
    }

    @GetMapping("/mis-encomiendas")
    public ResponseEntity<List<EncomiendaResponseDTO>> misEncomiendas() {
        return ResponseEntity.ok(encomiendaService.listarMisEncomiendas());
    }

    @GetMapping("/disponibles")
    @PreAuthorize("hasAnyRole('DOMICILIARIO', 'ADMIN')")
    public ResponseEntity<List<EncomiendaResponseDTO>> disponibles() {
        return ResponseEntity.ok(encomiendaService.listarDisponibles());
    }

    @GetMapping("/asignadas")
    @PreAuthorize("hasAnyRole('DOMICILIARIO', 'ADMIN')")
    public ResponseEntity<List<EncomiendaResponseDTO>> asignadas() {
        return ResponseEntity.ok(encomiendaService.listarAsignadas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EncomiendaResponseDTO> detalle(@PathVariable Integer id) {
        return ResponseEntity.ok(encomiendaService.obtenerPorId(id));
    }

    @PutMapping("/{id}/tomar")
    @PreAuthorize("hasAnyRole('DOMICILIARIO', 'ADMIN')")
    public ResponseEntity<EncomiendaResponseDTO> tomar(@PathVariable Integer id) {
        return ResponseEntity.ok(encomiendaService.tomarEncomienda(id));
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('DOMICILIARIO', 'ADMIN')")
    public ResponseEntity<EncomiendaResponseDTO> actualizarEstado(
            @PathVariable Integer id,
            @Valid @RequestBody ActualizarEstadoEncomiendaRequest request) {
        return ResponseEntity.ok(encomiendaService.actualizarEstado(id, request));
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<EncomiendaResponseDTO> cancelar(@PathVariable Integer id) {
        return ResponseEntity.ok(encomiendaService.cancelar(id));
    }
}
