package com.fastgo.controller;

import com.fastgo.dto.CategoriaProductoResponseDTO;
import com.fastgo.entity.CategoriaProducto;
import com.fastgo.service.CategoriaProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/categorias-producto")
public class CategoriaProductoController {

    @Autowired
    private CategoriaProductoService categoriaProductoService;

    // Listar todas
    @GetMapping
    public ResponseEntity<List<CategoriaProductoResponseDTO>> listarCategorias() {

        return ResponseEntity.ok(
                categoriaProductoService.listarCategorias()
        );
    }

    // Listar solamente activas
    @GetMapping("/activas")
    public ResponseEntity<List<CategoriaProductoResponseDTO>> listarActivas() {

        return ResponseEntity.ok(
                categoriaProductoService.listarActivas()
        );
    }

    // Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaProductoResponseDTO> obtenerCategoria(
            @PathVariable @Positive Integer id) {

        return ResponseEntity.ok(
                categoriaProductoService.obtenerCategoria(id)
        );
    }

    // Crear categoría
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoriaProducto> guardarCategoria(
            @Valid @RequestBody CategoriaProducto categoria) {

        return ResponseEntity.ok(
                categoriaProductoService.guardarCategoria(categoria)
        );
    }

    // Actualizar categoría
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoriaProducto> actualizarCategoria(
            @PathVariable @Positive Integer id,
            @Valid @RequestBody CategoriaProducto categoria) {

        return ResponseEntity.ok(
                categoriaProductoService.actualizarCategoria(id, categoria)
        );
    }

    // Eliminar categoría
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarCategoria(
            @PathVariable @Positive Integer id) {

        categoriaProductoService.eliminarCategoria(id);
        return ResponseEntity.noContent().build();
    }
}