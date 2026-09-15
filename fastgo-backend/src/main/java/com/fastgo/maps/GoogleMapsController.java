package com.fastgo.maps;

import com.fastgo.dto.MapGeocodeRequest;
import com.fastgo.dto.MapRouteRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/maps")
public class GoogleMapsController {
    private final GoogleMapsService service;
    public GoogleMapsController(GoogleMapsService service) { this.service = service; }

    @GetMapping("/config")
    @PreAuthorize("hasRole('CLIENTE') or hasRole('DOMICILIARIO') or hasRole('COMERCIO')")
    public ResponseEntity<Map<String,Object>> config() { return ResponseEntity.ok(service.clientConfig()); }

    @PostMapping("/geocode")
    @PreAuthorize("hasRole('CLIENTE') or hasRole('DOMICILIARIO') or hasRole('COMERCIO')")
    public ResponseEntity<Map<String,Object>> geocode(@Valid @RequestBody MapGeocodeRequest request) { return ResponseEntity.ok(service.geocode(request)); }

    @PostMapping("/route")
    @PreAuthorize("hasRole('CLIENTE') or hasRole('DOMICILIARIO') or hasRole('COMERCIO')")
    public ResponseEntity<Map<String,Object>> route(@Valid @RequestBody MapRouteRequest request) { return ResponseEntity.ok(service.route(request)); }
}
