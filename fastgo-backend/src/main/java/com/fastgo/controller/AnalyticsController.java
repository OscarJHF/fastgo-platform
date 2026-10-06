package com.fastgo.controller;

import com.fastgo.dto.AnalyticsEventRequestDTO;
import com.fastgo.dto.AnalyticsMetricsResponseDTO;
import com.fastgo.service.AnalyticsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @PostMapping({"/track", "/eventos"})
    public ResponseEntity<Map<String, Object>> track(
            @Valid @RequestBody AnalyticsEventRequestDTO dto,
            HttpServletRequest request) {
        analyticsService.registrarEvento(dto, request);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @GetMapping("/metricas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnalyticsMetricsResponseDTO> obtenerMetricas(
            @RequestParam(required = false, defaultValue = "7_DIAS") String periodo) {
        return ResponseEntity.ok(analyticsService.obtenerMetricas(periodo));
    }

    @GetMapping("/exportar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportarCsv(
            @RequestParam(required = false, defaultValue = "30_DIAS") String periodo) {
        String csv = analyticsService.exportarCsv(periodo);
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=fastgo-metricas-" + periodo.toLowerCase() + ".csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }
}
