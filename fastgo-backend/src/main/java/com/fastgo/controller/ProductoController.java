package com.fastgo.controller;

import com.fastgo.dto.ProductoRequestDTO;
import com.fastgo.dto.ProductoResponseDTO;
import com.fastgo.service.ProductoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ProductoResponseDTO>> listar() {
        return ResponseEntity.ok(service.listarProductos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponseDTO> obtener(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(service.obtenerProducto(id));
    }

    @GetMapping("/sucursal/{id}")
    public ResponseEntity<List<ProductoResponseDTO>> sucursal(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(service.listarPorSucursal(id));
    }

    @GetMapping("/categoria/{id}")
    public ResponseEntity<List<ProductoResponseDTO>> categoria(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(service.listarPorCategoria(id));
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<ProductoResponseDTO>> disponibles() {
        return ResponseEntity.ok(service.listarDisponibles());
    }

    @GetMapping("/destacados")
    public ResponseEntity<List<ProductoResponseDTO>> destacados() {
        return ResponseEntity.ok(service.listarDestacados());
    }

    @PostMapping
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<ProductoResponseDTO> crear(@Valid @RequestBody ProductoRequestDTO datos) {
        return ResponseEntity.ok(service.guardar(datos));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<ProductoResponseDTO> actualizar(
            @PathVariable @Positive Integer id,
            @Valid @RequestBody ProductoRequestDTO datos) {
        return ResponseEntity.ok(service.actualizar(id, datos));
    }

    @GetMapping("/comercio/mis-productos")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<List<ProductoResponseDTO>> misProductos() {
        return ResponseEntity.ok(service.listarPorComercioPropio());
    }

    @PatchMapping("/{id}/disponibilidad")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<ProductoResponseDTO> cambiarDisponibilidad(
            @PathVariable @Positive Integer id,
            @RequestParam(required = false) Boolean disponible) {
        return ResponseEntity.ok(service.cambiarDisponibilidad(id, disponible));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<Void> eliminar(@PathVariable @Positive Integer id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
