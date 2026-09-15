package com.fastgo.controller;

import com.fastgo.dto.AgregarCarritoDTO;
import com.fastgo.entity.Carrito;
import com.fastgo.entity.CarritoDetalle;
import com.fastgo.service.CarritoDetalleService;
import com.fastgo.service.CarritoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carritos")
@PreAuthorize("hasRole('CLIENTE')")
public class CarritoController {

    private final CarritoService carritoService;
    private final CarritoDetalleService detalleService;

    public CarritoController(CarritoService carritoService, CarritoDetalleService detalleService) {
        this.carritoService = carritoService;
        this.detalleService = detalleService;
    }

    @GetMapping
    public ResponseEntity<Carrito> obtener(@RequestParam @Positive Integer sucursalId) {
        return ResponseEntity.ok(carritoService.obtenerCarrito(sucursalId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Carrito> obtenerPorId(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(carritoService.obtenerPropio(id));
    }

    @GetMapping("/{id}/productos")
    public ResponseEntity<List<CarritoDetalle>> productos(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(detalleService.listarPorCarrito(id));
    }

    @PostMapping("/productos")
    public ResponseEntity<CarritoDetalle> agregar(@Valid @RequestBody AgregarCarritoDTO datos) {
        return ResponseEntity.ok(detalleService.agregarProducto(
                datos.getCarritoId(), datos.getProductoId(), datos.getCantidad()));
    }

    @PutMapping("/productos/{id}")
    public ResponseEntity<CarritoDetalle> actualizar(
            @PathVariable @Positive Integer id,
            @RequestParam @Positive @Max(1000) Integer cantidad) {
        return ResponseEntity.ok(detalleService.actualizarCantidad(id, cantidad));
    }

    @DeleteMapping("/productos/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable @Positive Integer id) {
        detalleService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/productos")
    public ResponseEntity<Void> vaciar(@PathVariable @Positive Integer id) {
        detalleService.vaciarCarrito(id);
        return ResponseEntity.noContent().build();
    }
}
