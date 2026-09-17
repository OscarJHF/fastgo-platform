package com.fastgo.service;

import com.fastgo.dto.ProductoRequestDTO;
import com.fastgo.dto.ProductoResponseDTO;
import com.fastgo.entity.Comercio;
import com.fastgo.entity.Producto;
import com.fastgo.entity.Sucursal;
import com.fastgo.entity.Usuario;
import com.fastgo.repository.CategoriaProductoRepository;
import com.fastgo.repository.ComercioRepository;
import com.fastgo.repository.ProductoRepository;
import com.fastgo.repository.SucursalRepository;
import com.fastgo.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final SucursalRepository sucursalRepository;
    private final ComercioRepository comercioRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaProductoRepository categoriaRepository;

    public ProductoService(
            ProductoRepository productoRepository,
            SucursalRepository sucursalRepository,
            ComercioRepository comercioRepository,
            UsuarioRepository usuarioRepository,
            CategoriaProductoRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.sucursalRepository = sucursalRepository;
        this.comercioRepository = comercioRepository;
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<ProductoResponseDTO> listarProductos() {
        return productoRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public ProductoResponseDTO obtenerProducto(Integer id) {
        return toDto(productoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Producto no encontrado")));
    }

    public List<ProductoResponseDTO> listarPorSucursal(Integer sucursalId) {
        return productoRepository.findBySucursalIdAndDisponibleTrue(sucursalId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<ProductoResponseDTO> listarPorCategoria(Integer categoriaId) {
        return productoRepository.findByCategoriaId(categoriaId)
                .stream()
                .filter(p -> Boolean.TRUE.equals(p.getDisponible()))
                .map(this::toDto)
                .toList();
    }

    public List<ProductoResponseDTO> listarDisponibles() {
        return productoRepository.findByDisponibleTrue()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<ProductoResponseDTO> listarDestacados() {
        return productoRepository.findByDestacadoTrue()
                .stream()
                .filter(p -> Boolean.TRUE.equals(p.getDisponible()))
                .map(this::toDto)
                .toList();
    }

    public ProductoResponseDTO guardar(ProductoRequestDTO datos) {
        Sucursal sucursal = obtenerSucursalPropia(datos.getSucursalId());
        validarDatos(datos);

        Producto producto = new Producto();
        producto.setSucursalId(sucursal.getId());
        copiarDatos(datos, producto);

        return toDto(productoRepository.save(producto));
    }

    public ProductoResponseDTO actualizar(
            Integer id,
            ProductoRequestDTO datos) {

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Producto no encontrado"));

        Sucursal sucursalActual = sucursalRepository
                .findById(producto.getSucursalId())
                .orElseThrow(() ->
                        new RuntimeException("Sucursal no encontrada"));

        exigirPropietarioComercio(sucursalActual.getComercioId());

        validarDatos(datos);

        if (datos.getSucursalId() != null
                && !datos.getSucursalId().equals(producto.getSucursalId())) {

            Sucursal nuevaSucursal =
                    obtenerSucursalPropia(datos.getSucursalId());

            producto.setSucursalId(nuevaSucursal.getId());
        }

        copiarDatos(datos, producto);

        return toDto(productoRepository.save(producto));
    }

    public void eliminar(Integer id) {

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Producto no encontrado"));

        Sucursal sucursal = sucursalRepository
                .findById(producto.getSucursalId())
                .orElseThrow(() ->
                        new RuntimeException("Sucursal no encontrada"));

        exigirPropietarioComercio(sucursal.getComercioId());

        productoRepository.delete(producto);
    }

    private Sucursal obtenerSucursalPropia(Integer sucursalId) {

        if (sucursalId == null) {
            throw new RuntimeException(
                    "La sucursal es obligatoria");
        }

        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() ->
                        new RuntimeException("Sucursal no encontrada"));

        exigirPropietarioComercio(sucursal.getComercioId());

        return sucursal;
    }

    private void validarDatos(ProductoRequestDTO datos) {

        if (datos == null) {
            throw new RuntimeException(
                    "Los datos del producto son obligatorios");
        }

        if (datos.getNombre() == null
                || datos.getNombre().isBlank()) {
            throw new RuntimeException(
                    "El nombre del producto es obligatorio");
        }

        if (datos.getCategoriaId() == null
                || categoriaRepository.findById(
                        datos.getCategoriaId()).isEmpty()) {
            throw new RuntimeException(
                    "Categoría de producto no encontrada");
        }

        if (datos.getPrecio() == null
                || datos.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException(
                    "El precio debe ser mayor a cero");
        }

        if (datos.getTiempoPreparacion() != null
                && datos.getTiempoPreparacion() < 0) {
            throw new RuntimeException(
                    "El tiempo de preparación no puede ser negativo");
        }
    }

    private void copiarDatos(
            ProductoRequestDTO datos,
            Producto producto) {

        producto.setCategoriaId(datos.getCategoriaId());
        producto.setNombre(datos.getNombre());
        producto.setDescripcion(datos.getDescripcion());
        producto.setPrecio(datos.getPrecio());
        producto.setTiempoPreparacion(datos.getTiempoPreparacion());
        producto.setImagenPrincipal(datos.getImagenPrincipal());

        if (datos.getDisponible() != null) {
            producto.setDisponible(datos.getDisponible());
        }

        if (datos.getDestacado() != null) {
            producto.setDestacado(datos.getDestacado());
        }

        if (datos.getStock() != null) {
            producto.setStock(datos.getStock());
        }
    }

    public List<ProductoResponseDTO> listarPorComercioPropio() {
        Usuario usuario = usuario();
        Comercio comercio = comercioRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Comercio no encontrado para el usuario autenticado"));

        List<Sucursal> sucursales = sucursalRepository.findByComercioId(comercio.getId());
        return sucursales.stream()
                .flatMap(s -> productoRepository.findBySucursalId(s.getId()).stream())
                .map(this::toDto)
                .toList();
    }

    public ProductoResponseDTO cambiarDisponibilidad(Integer id, Boolean disponible) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Sucursal sucursal = sucursalRepository.findById(producto.getSucursalId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));

        exigirPropietarioComercio(sucursal.getComercioId());

        producto.setDisponible(disponible != null ? disponible : !Boolean.TRUE.equals(producto.getDisponible()));
        return toDto(productoRepository.save(producto));
    }

    private void exigirPropietarioComercio(Integer comercioId) {

        Usuario usuario = usuario();

        if (!comercioRepository
                .findByIdAndUsuarioId(
                        comercioId,
                        usuario.getId())
                .isPresent()) {

            throw new RuntimeException(
                    "No tienes permiso sobre este comercio");
        }
    }

    private Usuario usuario() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {

            throw new RuntimeException("Usuario no autenticado");
        }

        return usuarioRepository.findByCorreo(
                        authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Usuario autenticado no encontrado"));
    }

    private ProductoResponseDTO toDto(Producto producto) {

        return new ProductoResponseDTO(
                producto.getId(),
                producto.getSucursalId(),
                producto.getCategoriaId(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getPrecio(),
                producto.getTiempoPreparacion(),
                producto.getImagenPrincipal(),
                producto.getDisponible(),
                producto.getDestacado(),
                producto.getStock()
        );
    }
}
