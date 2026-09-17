package com.fastgo.controller;

import com.fastgo.dto.ComercioRequestDTO;
import com.fastgo.dto.ComercioResponseDTO;
import com.fastgo.service.ComercioService;
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

    public ComercioController(ComercioService comercioService) {
        this.comercioService = comercioService;
    }

    @GetMapping
    public ResponseEntity<List<ComercioResponseDTO>> listar() {
        return ResponseEntity.ok(
                comercioService.listarComercios());
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
