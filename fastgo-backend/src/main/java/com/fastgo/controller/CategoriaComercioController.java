package com.fastgo.controller;

import com.fastgo.entity.CategoriaComercio;
import com.fastgo.repository.CategoriaComercioRepository;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias-comercio")
public class CategoriaComercioController {

    private final CategoriaComercioRepository repository;

    public CategoriaComercioController(CategoriaComercioRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<CategoriaComercio>> listar() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/activas")
    public ResponseEntity<List<CategoriaComercio>> activas() {
        return ResponseEntity.ok(repository.findByActivoTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaComercio> obtener(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría de comercio no encontrada")));
    }
}
