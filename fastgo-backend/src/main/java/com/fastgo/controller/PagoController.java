package com.fastgo.controller;

import com.fastgo.entity.Pago;
import com.fastgo.service.PagoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {
    private final PagoService pagoService;
    public PagoController(PagoService pagoService) { this.pagoService = pagoService; }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CLIENTE') or hasRole('COMERCIO')")
    public ResponseEntity<Pago> obtener(@PathVariable Integer id) { return ResponseEntity.ok(pagoService.obtenerPorId(id)); }

    @GetMapping("/pedido/{pedidoId}")
    @PreAuthorize("hasRole('CLIENTE') or hasRole('COMERCIO')")
    public ResponseEntity<List<Pago>> listarPorPedido(@PathVariable Integer pedidoId) { return ResponseEntity.ok(pagoService.listarPorPedido(pedidoId)); }

    @PutMapping("/{pagoId}/estado")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<Pago> actualizarEstado(@PathVariable Integer pagoId, @RequestParam String estado) {
        return ResponseEntity.ok(pagoService.actualizarEstado(pagoId, estado));
    }
}
