package com.fastgo.controller;

import com.fastgo.dto.CrearOfertaRequest;
import com.fastgo.dto.EncomiendaResponseDTO;
import com.fastgo.dto.OfertaEncomiendaResponseDTO;
import com.fastgo.service.OfertaEncomiendaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/encomiendas")
public class OfertaEncomiendaController {

    private final OfertaEncomiendaService ofertaEncomiendaService;

    public OfertaEncomiendaController(OfertaEncomiendaService ofertaEncomiendaService) {
        this.ofertaEncomiendaService = ofertaEncomiendaService;
    }

    @PostMapping("/{id}/ofertas")
    @PreAuthorize("hasAnyRole('DOMICILIARIO', 'ADMIN')")
    public ResponseEntity<OfertaEncomiendaResponseDTO> crearOferta(
            @PathVariable Integer id,
            @Valid @RequestBody CrearOfertaRequest request) {
        return ResponseEntity.ok(ofertaEncomiendaService.crearOferta(id, request));
    }

    @GetMapping("/{id}/ofertas")
    public ResponseEntity<List<OfertaEncomiendaResponseDTO>> listarOfertas(@PathVariable Integer id) {
        return ResponseEntity.ok(ofertaEncomiendaService.listarOfertasPorEncomienda(id));
    }

    @PutMapping("/{id}/ofertas/{ofertaId}/aceptar")
    public ResponseEntity<EncomiendaResponseDTO> aceptarOferta(
            @PathVariable Integer id,
            @PathVariable Integer ofertaId) {
        return ResponseEntity.ok(ofertaEncomiendaService.aceptarOferta(id, ofertaId));
    }

    @PutMapping("/{id}/ofertas/{ofertaId}/rechazar")
    public ResponseEntity<OfertaEncomiendaResponseDTO> rechazarOferta(
            @PathVariable Integer id,
            @PathVariable Integer ofertaId) {
        return ResponseEntity.ok(ofertaEncomiendaService.rechazarOferta(id, ofertaId));
    }

    @PutMapping("/{id}/ofertas/{ofertaId}/cancelar")
    public ResponseEntity<OfertaEncomiendaResponseDTO> cancelarOferta(
            @PathVariable Integer id,
            @PathVariable Integer ofertaId) {
        return ResponseEntity.ok(ofertaEncomiendaService.cancelarOferta(id, ofertaId));
    }

    @GetMapping("/mis-ofertas")
    @PreAuthorize("hasAnyRole('DOMICILIARIO', 'ADMIN')")
    public ResponseEntity<List<OfertaEncomiendaResponseDTO>> listarMisOfertas() {
        return ResponseEntity.ok(ofertaEncomiendaService.listarMisOfertas());
    }
}
