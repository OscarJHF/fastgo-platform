package com.fastgo.service;

import com.fastgo.entity.Carrito;
import com.fastgo.entity.CarritoDetalle;
import com.fastgo.entity.Producto;
import com.fastgo.repository.CarritoDetalleRepository;
import com.fastgo.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CarritoDetalleService {

    private final CarritoDetalleRepository carritoDetalleRepository;
    private final ProductoRepository productoRepository;
    private final CarritoService carritoService;

    public CarritoDetalleService(
            CarritoDetalleRepository carritoDetalleRepository,
            ProductoRepository productoRepository,
            CarritoService carritoService) {
        this.carritoDetalleRepository = carritoDetalleRepository;
        this.productoRepository = productoRepository;
        this.carritoService = carritoService;
    }

    public List<CarritoDetalle> listarPorCarrito(Integer carritoId) {
        carritoService.validarPropietario(carritoId);
        return detallesInternos(carritoId);
    }

    public CarritoDetalle agregarProducto(
            Integer carritoId,
            Integer productoId,
            Integer cantidad) {

        if (cantidad == null || cantidad <= 0) {
            throw new RuntimeException(
                    "La cantidad debe ser mayor que cero");
        }

        Carrito carrito = carritoService.obtenerPropio(carritoId);

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() ->
                        new RuntimeException("Producto no encontrado"));

        if (!Boolean.TRUE.equals(producto.getDisponible())) {
            throw new RuntimeException(
                    "El producto no está disponible");
        }

        if (!producto.getSucursalId().equals(carrito.getSucursalId())) {
            throw new RuntimeException(
                    "El producto no pertenece a la sucursal del carrito");
        }

        var existente =
                carritoDetalleRepository
                        .findByCarritoIdAndProductoId(
                                carritoId,
                                productoId);

        CarritoDetalle detalle =
                existente.orElseGet(CarritoDetalle::new);

        int nuevaCantidad =
                cantidad + (existente.isPresent()
                        ? detalle.getCantidad()
                        : 0);

        BigDecimal precio = producto.getPrecio();

        detalle.setCarritoId(carritoId);
        detalle.setProductoId(productoId);
        detalle.setCantidad(nuevaCantidad);
        detalle.setPrecio(precio);
        detalle.setSubtotal(
                precio.multiply(
                        BigDecimal.valueOf(nuevaCantidad)));

        return carritoDetalleRepository.save(detalle);
    }

    public CarritoDetalle actualizarCantidad(
            Integer detalleId,
            Integer cantidad) {

        if (cantidad == null || cantidad <= 0) {
            throw new RuntimeException(
                    "La cantidad debe ser mayor que cero");
        }

        CarritoDetalle detalle =
                carritoDetalleRepository.findById(detalleId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Detalle del carrito no encontrado"));

        Carrito carrito =
                carritoService.obtenerPropio(
                        detalle.getCarritoId());

        Producto producto =
                productoRepository.findById(
                        detalle.getProductoId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Producto no encontrado"));

        if (!producto.getSucursalId().equals(
                carrito.getSucursalId())) {
            throw new RuntimeException(
                    "Producto inválido para el carrito");
        }

        if (!Boolean.TRUE.equals(producto.getDisponible())) {
            throw new RuntimeException(
                    "El producto no está disponible");
        }

        BigDecimal precio = producto.getPrecio();

        detalle.setCantidad(cantidad);
        detalle.setPrecio(precio);
        detalle.setSubtotal(
                precio.multiply(BigDecimal.valueOf(cantidad)));

        return carritoDetalleRepository.save(detalle);
    }

    public void eliminarProducto(Integer detalleId) {

        CarritoDetalle detalle =
                carritoDetalleRepository.findById(detalleId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Detalle del carrito no encontrado"));

        carritoService.validarPropietario(
                detalle.getCarritoId());

        carritoDetalleRepository.delete(detalle);
    }

    public void vaciarCarrito(Integer carritoId) {
        carritoService.validarPropietario(carritoId);
        carritoDetalleRepository.deleteByCarritoId(carritoId);
    }

    public List<CarritoDetalle> detallesInternos(Integer carritoId) {
        return carritoDetalleRepository.findByCarritoId(carritoId);
    }
}
