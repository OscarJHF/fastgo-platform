package com.fastgo.controller;

import com.fastgo.dto.SucursalRequestDTO;
import com.fastgo.entity.Sucursal;
import com.fastgo.service.SucursalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import java.util.List;

@RestController
@RequestMapping("/api/sucursales")
public class SucursalController {

    private final SucursalService sucursalService;

    public SucursalController(SucursalService sucursalService) {
        this.sucursalService = sucursalService;
    }

    @GetMapping("/comercio/{comercioId}")
    public ResponseEntity<List<Sucursal>> listarPorComercio(
            @PathVariable @Positive Integer comercioId) {

        return ResponseEntity.ok(
                sucursalService.listarPorComercio(comercioId));
    }

    @GetMapping("/abiertas")
    public ResponseEntity<List<Sucursal>> listarAbiertas() {
        return ResponseEntity.ok(
                sucursalService.listarAbiertas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sucursal> obtener(
            @PathVariable @Positive Integer id) {

        return ResponseEntity.ok(
                sucursalService.obtener(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<Sucursal> crear(
            @Valid @RequestBody SucursalRequestDTO datos) {

        return ResponseEntity.ok(
                sucursalService.crear(datos));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<Sucursal> actualizar(
            @PathVariable @Positive Integer id,
            @Valid @RequestBody SucursalRequestDTO datos) {

        return ResponseEntity.ok(
                sucursalService.actualizar(id, datos));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<Void> eliminar(
            @PathVariable @Positive Integer id) {

        sucursalService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}
