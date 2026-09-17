package com.fastgo.controller;

import com.fastgo.entity.DetallePedido;
import com.fastgo.entity.Pedido;
import com.fastgo.service.PedidoService;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Pedido> crear(
            @RequestParam @Positive Integer carritoId,
            @RequestParam @Positive Integer direccionId,
            @RequestParam(required = false) BigDecimal costoEnvio,
            @RequestParam(required = false) @Size(max = 500) String observaciones,
            @RequestParam(required = false) String metodoPago) {

        return ResponseEntity.ok(pedidoService.crearPedido(
                carritoId, direccionId, costoEnvio, observaciones, metodoPago));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtener(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(pedidoService.obtenerPorId(id));
    }

    @GetMapping("/usuario")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<List<Pedido>> misPedidos() {
        return ResponseEntity.ok(pedidoService.listarPorUsuario());
    }

    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<List<Pedido>> pedidosUsuario(@PathVariable @Positive Integer usuarioId) {
        return ResponseEntity.ok(pedidoService.listarPorUsuario(usuarioId));
    }

    @GetMapping("/sucursal/{sucursalId}")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<List<Pedido>> porSucursal(@PathVariable @Positive Integer sucursalId) {
        return ResponseEntity.ok(pedidoService.listarPorSucursal(sucursalId));
    }

    @GetMapping("/estado/{estado}")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<List<Pedido>> porEstado(@PathVariable @Size(max = 30) String estado) {
        return ResponseEntity.ok(pedidoService.listarPorEstado(estado));
    }

    @GetMapping("/{id}/detalles")
    public ResponseEntity<List<DetallePedido>> detalles(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(pedidoService.detalles(id));
    }

    @PutMapping("/{id}/confirmar")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<Pedido> confirmar(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(pedidoService.confirmar(id));
    }

    @PutMapping("/{id}/rechazar")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<Pedido> rechazar(
            @PathVariable @Positive Integer id,
            @RequestParam(required = false) @Size(max = 255) String motivo) {
        return ResponseEntity.ok(pedidoService.rechazar(id, motivo));
    }

    @PutMapping("/{id}/preparar")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<Pedido> preparar(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(pedidoService.preparar(id));
    }

    @PutMapping("/{id}/listo")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<Pedido> listo(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(pedidoService.listo(id));
    }

    @GetMapping("/domiciliario/disponibles")
    @PreAuthorize("hasRole('DOMICILIARIO')")
    public ResponseEntity<List<Pedido>> disponibles() {
        return ResponseEntity.ok(pedidoService.disponiblesParaDomiciliario());
    }

    @GetMapping("/domiciliario/mios")
    @PreAuthorize("hasRole('DOMICILIARIO')")
    public ResponseEntity<List<Pedido>> misPedidosDomiciliario() {
        return ResponseEntity.ok(pedidoService.misPedidosDomiciliario());
    }

    @PutMapping("/{id}/tomar")
    @PreAuthorize("hasRole('DOMICILIARIO')")
    public ResponseEntity<Pedido> tomar(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(pedidoService.tomarPedido(id));
    }

    @PutMapping("/{id}/en-camino")
    @PreAuthorize("hasRole('DOMICILIARIO')")
    public ResponseEntity<Pedido> enCamino(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(pedidoService.enCamino(id));
    }

    @PutMapping("/{id}/entregar")
    @PreAuthorize("hasRole('DOMICILIARIO')")
    public ResponseEntity<Pedido> entregar(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(pedidoService.entregar(id));
    }

    @PutMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Pedido> cancelar(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(pedidoService.cancelar(id));
    }
}
