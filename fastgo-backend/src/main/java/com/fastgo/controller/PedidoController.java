package com.fastgo.controller;

import com.fastgo.entity.DetallePedido;
import com.fastgo.entity.Pedido;
import com.fastgo.service.PedidoService;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

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
            @RequestParam(required = false) String metodoPago,
            @RequestParam(required = false) String comprobantePagoUrl,
            @RequestParam(value = "comprobante", required = false) MultipartFile comprobante) {

        return ResponseEntity.ok(pedidoService.crearPedido(
                carritoId, direccionId, costoEnvio, observaciones, metodoPago, comprobantePagoUrl, comprobante));
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
    public ResponseEntity<List<Pedido>> porEstado(
            @PathVariable @Size(max = 30) String estado,
            @RequestParam(required = false) Integer comercioId) {
        return ResponseEntity.ok(pedidoService.listarPorEstado(estado, comercioId));
    }

    @GetMapping("/comercio")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<List<Pedido>> pedidosComercio(
            @RequestParam(required = false) Integer comercioId,
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(pedidoService.listarPorEstado(estado, comercioId));
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

    @PutMapping("/{id}/aprobar-pago")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<Pedido> aprobarPago(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(pedidoService.aprobarPago(id));
    }

    @PutMapping("/{id}/rechazar-pago")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<Pedido> rechazarPago(
            @PathVariable @Positive Integer id,
            @RequestParam(required = false) @Size(max = 255) String motivo) {
        return ResponseEntity.ok(pedidoService.rechazarPago(id, motivo));
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

    @PutMapping({"/{id}/entregar", "/{id}/entregado"})
    @PreAuthorize("hasRole('DOMICILIARIO')")
    public ResponseEntity<Pedido> entregar(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(pedidoService.entregar(id));
    }

    @PutMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Pedido> cancelar(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(pedidoService.cancelar(id));
    }

    @GetMapping("/{id}/comprobante")
    public ResponseEntity<Resource> obtenerComprobante(@PathVariable @Positive Integer id) {
        PedidoService.ComprobanteResourceInfo info = pedidoService.obtenerComprobante(id);
        return ResponseEntity.ok()
                .contentType(info.mediaType())
                .header(HttpHeaders.CACHE_CONTROL, "private, no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .body(info.resource());
    }

    @PostMapping("/{id}/comprobante")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Map<String, Object>> subirComprobante(
            @PathVariable @Positive Integer id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(pedidoService.subirComprobante(id, file));
    }
}
