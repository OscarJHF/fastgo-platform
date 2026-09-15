package com.fastgo.service;

import com.fastgo.dto.CategoriaProductoResponseDTO;
import com.fastgo.entity.CategoriaProducto;
import com.fastgo.repository.CategoriaProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoriaProductoService {

    private final CategoriaProductoRepository categoriaProductoRepository;
    private final com.fastgo.repository.ProductoRepository productoRepository;

    public CategoriaProductoService(
            CategoriaProductoRepository categoriaProductoRepository,
            com.fastgo.repository.ProductoRepository productoRepository) {
        this.categoriaProductoRepository = categoriaProductoRepository;
        this.productoRepository = productoRepository;
    }

    // Listar todas las categorías
    public List<CategoriaProductoResponseDTO> listarCategorias() {

        return categoriaProductoRepository.findAll()
                .stream()
                .map(this::convertirDTO)
                .collect(Collectors.toList());
    }

    // Listar solamente categorías activas
    public List<CategoriaProductoResponseDTO> listarActivas() {

        return categoriaProductoRepository.findByActivoTrue()
                .stream()
                .map(this::convertirDTO)
                .collect(Collectors.toList());
    }

    // Obtener categoría por ID
    public CategoriaProductoResponseDTO obtenerCategoria(Integer id) {

        CategoriaProducto categoria = categoriaProductoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Categoría no encontrada"));

        return convertirDTO(categoria);
    }

    // Crear categoría
    public CategoriaProducto guardarCategoria(CategoriaProducto categoria) {

        if (categoria.getActivo() == null) {
            categoria.setActivo(true);
        }

        return categoriaProductoRepository.save(categoria);
    }

    // Actualizar categoría
    public CategoriaProducto actualizarCategoria(Integer id, CategoriaProducto datos) {
        CategoriaProducto categoria = categoriaProductoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        if (datos.getNombre() == null || datos.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio");
        }

        categoria.setNombre(datos.getNombre().trim());
        categoria.setDescripcion(datos.getDescripcion());
        categoria.setIcono(datos.getIcono());
        if (datos.getActivo() != null) {
            categoria.setActivo(datos.getActivo());
        }

        return categoriaProductoRepository.save(categoria);
    }

    // Eliminar categoría
    public void eliminarCategoria(Integer id) {
        CategoriaProducto categoria = categoriaProductoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        if (!productoRepository.findByCategoriaId(id).isEmpty()) {
            throw new IllegalStateException("No se puede eliminar la categoría porque tiene productos asociados");
        }

        categoriaProductoRepository.delete(categoria);
    }

    // Convertir Entity → DTO
    private CategoriaProductoResponseDTO convertirDTO(
            CategoriaProducto categoria) {

        return new CategoriaProductoResponseDTO(
                categoria.getId(),
                categoria.getNombre(),
                categoria.getDescripcion(),
                categoria.getIcono(),
                categoria.getActivo()
        );
    }
}