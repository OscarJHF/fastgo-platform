package com.fastgo.controller;

import com.fastgo.dto.TrackingResponseDTO;
import com.fastgo.dto.TrackingUbicacionRequest;
import com.fastgo.service.TrackingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tracking")
public class TrackingController {

    private final TrackingService trackingService;

    public TrackingController(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @PostMapping("/ubicacion")
    @PreAuthorize("hasRole('DOMICILIARIO')")
    public ResponseEntity<TrackingResponseDTO> actualizarUbicacion(
            @Valid @RequestBody TrackingUbicacionRequest request) {
        return ResponseEntity.ok(trackingService.actualizarUbicacion(request));
    }

    @GetMapping("/pedido/{pedidoId}")
    @PreAuthorize("hasAnyRole('CLIENTE', 'DOMICILIARIO', 'COMERCIO', 'ADMIN')")
    public ResponseEntity<TrackingResponseDTO> obtenerTracking(
            @PathVariable Integer pedidoId) {
        return ResponseEntity.ok(trackingService.obtenerTracking(pedidoId));
    }
}
