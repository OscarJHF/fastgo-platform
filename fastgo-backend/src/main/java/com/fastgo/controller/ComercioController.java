package com.fastgo.controller;

import com.fastgo.dto.ComercioRequestDTO;
import com.fastgo.dto.ComercioResponseDTO;
import com.fastgo.dto.ConfiguracionSuscripcionDTO;
import com.fastgo.service.ComercioService;
import com.fastgo.service.SuscripcionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import java.util.List;

@RestController
@RequestMapping("/api/comercios")
public class ComercioController {

    private final ComercioService comercioService;
    private final SuscripcionService suscripcionService;

    public ComercioController(ComercioService comercioService, SuscripcionService suscripcionService) {
        this.comercioService = comercioService;
        this.suscripcionService = suscripcionService;
    }

    @GetMapping
    public ResponseEntity<List<ComercioResponseDTO>> listar(
            @RequestParam(required = false) String departamentoId,
            @RequestParam(required = false) String municipioId) {
        return ResponseEntity.ok(
                comercioService.listarComerciosFiltrados(departamentoId, municipioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComercioResponseDTO> buscar(
            @PathVariable @Positive Integer id) {
        return ResponseEntity.ok(
                comercioService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<ComercioResponseDTO> guardar(
            @Valid @RequestBody ComercioRequestDTO datos) {
        return ResponseEntity.ok(
                comercioService.guardar(datos));
    }
    @PutMapping("/propio")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<ComercioResponseDTO> actualizarPropio(
            @Valid @RequestBody ComercioRequestDTO datos) {
        ComercioResponseDTO propio = comercioService.buscarPropio();
        if (propio == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(
                comercioService.actualizar(propio.getId(), datos));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<ComercioResponseDTO> actualizar(
            @PathVariable @Positive Integer id,
            @Valid @RequestBody ComercioRequestDTO datos) {
        return ResponseEntity.ok(
                comercioService.actualizar(id, datos));
    }

    @GetMapping("/propio")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<ComercioResponseDTO> buscarPropio() {
        ComercioResponseDTO propio = comercioService.buscarPropio();
        if (propio == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(propio);
    }

    @GetMapping("/mis-tiendas")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<List<ComercioResponseDTO>> misTiendas() {
        return ResponseEntity.ok(comercioService.listarMisTiendas());
    }

    @GetMapping("/suscripciones/configuracion")
    public ResponseEntity<ConfiguracionSuscripcionDTO> configuracionSuscripciones() {
        return ResponseEntity.ok(suscripcionService.obtenerConfiguracionDTO());
    }

    @PatchMapping("/{id}/pausa-manual")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<ComercioResponseDTO> togglePausaManual(
            @PathVariable @Positive Integer id) {
        return ResponseEntity.ok(comercioService.togglePausaManual(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<Void> eliminar(
            @PathVariable @Positive Integer id) {

        comercioService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}
