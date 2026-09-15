package com.fastgo.controller;

import com.fastgo.entity.Direccion;
import com.fastgo.service.DireccionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import java.util.List;

@RestController
@RequestMapping("/api/direcciones")
public class DireccionController {

    @Autowired
    private DireccionService direccionService;


    // =========================================================
    // CREAR DIRECCIÓN
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Direccion> crearDireccion(
            @Valid @RequestBody Direccion direccion) {

        return ResponseEntity.ok(
                direccionService.crearDireccion(direccion)
        );
    }


    // =========================================================
    // LISTAR MIS DIRECCIONES
    // =========================================================

    @GetMapping
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<List<Direccion>> listarMisDirecciones() {

        return ResponseEntity.ok(
                direccionService.listarMisDirecciones()
        );
    }


    // =========================================================
    // OBTENER DIRECCIÓN POR ID
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Direccion> obtenerPorId(
            @PathVariable @Positive Integer id) {

        return ResponseEntity.ok(
                direccionService.obtenerPorId(id)
        );
    }


    // =========================================================
    // ACTUALIZAR DIRECCIÓN
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Direccion> actualizarDireccion(
            @PathVariable @Positive Integer id,
            @Valid @RequestBody Direccion direccion) {

        return ResponseEntity.ok(
                direccionService.actualizarDireccion(
                        id,
                        direccion
                )
        );
    }


    // =========================================================
    // ELIMINAR DIRECCIÓN
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Void> eliminarDireccion(
            @PathVariable @Positive Integer id) {

        direccionService.eliminarDireccion(id);

        return ResponseEntity.noContent().build();
    }


    // =========================================================
    // MARCAR COMO PRINCIPAL
    // =========================================================

    @PutMapping("/{id}/principal")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Direccion> marcarComoPrincipal(
            @PathVariable @Positive Integer id) {

        return ResponseEntity.ok(
                direccionService.marcarComoPrincipal(id)
        );
    }
}