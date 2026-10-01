package com.fastgo.controller;

import com.fastgo.dto.AdminTiendaResponseDTO;
import com.fastgo.dto.AuditoriaAdminResponseDTO;
import com.fastgo.dto.ConfiguracionSuscripcionDTO;
import com.fastgo.entity.AuditoriaAdmin;
import com.fastgo.repository.AuditoriaAdminRepository;
import com.fastgo.service.ComercioService;
import com.fastgo.service.SuscripcionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ComercioService comercioService;
    private final SuscripcionService suscripcionService;
    private final AuditoriaAdminRepository auditoriaAdminRepository;

    public AdminController(
            ComercioService comercioService,
            SuscripcionService suscripcionService,
            AuditoriaAdminRepository auditoriaAdminRepository) {
        this.comercioService = comercioService;
        this.suscripcionService = suscripcionService;
        this.auditoriaAdminRepository = auditoriaAdminRepository;
    }

    @GetMapping("/tiendas")
    public ResponseEntity<List<AdminTiendaResponseDTO>> listarTiendas() {
        return ResponseEntity.ok(comercioService.listarTodasAdmin());
    }

    @PutMapping("/tiendas/{id}/activar")
    public ResponseEntity<AdminTiendaResponseDTO> activarTienda(
            @PathVariable @Positive Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        String razon = body != null ? body.get("razon") : null;
        return ResponseEntity.ok(comercioService.activarTiendaAdmin(id, razon));
    }

    @PutMapping("/tiendas/{id}/desactivar")
    public ResponseEntity<AdminTiendaResponseDTO> desactivarTienda(
            @PathVariable @Positive Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        String razon = body != null ? body.get("razon") : null;
        return ResponseEntity.ok(comercioService.desactivarTiendaAdmin(id, razon));
    }

    @PutMapping("/tiendas/{id}/suspender")
    public ResponseEntity<AdminTiendaResponseDTO> suspenderTienda(
            @PathVariable @Positive Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        String razon = body != null ? body.get("razon") : null;
        return ResponseEntity.ok(comercioService.suspenderTiendaAdmin(id, razon));
    }

    @PutMapping("/tiendas/{id}/reactivar")
    public ResponseEntity<AdminTiendaResponseDTO> reactivarTienda(
            @PathVariable @Positive Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        String razon = body != null ? body.get("razon") : null;
        return ResponseEntity.ok(comercioService.reactivarTiendaAdmin(id, razon));
    }

    @GetMapping("/suscripciones/configuracion")
    public ResponseEntity<ConfiguracionSuscripcionDTO> obtenerConfiguracion() {
        return ResponseEntity.ok(suscripcionService.obtenerConfiguracionDTO());
    }

    @PutMapping("/suscripciones/configuracion")
    public ResponseEntity<ConfiguracionSuscripcionDTO> actualizarConfiguracion(
            @Valid @RequestBody ConfiguracionSuscripcionDTO datos,
            Authentication authentication) {
        String adminCorreo = authentication != null ? authentication.getName() : "ADMIN";
        return ResponseEntity.ok(suscripcionService.actualizarConfiguracion(datos, adminCorreo));
    }

    @GetMapping("/auditoria")
    public ResponseEntity<List<AuditoriaAdminResponseDTO>> listarAuditoria() {
        List<AuditoriaAdminResponseDTO> lista = auditoriaAdminRepository.findAllByOrderByFechaDesc()
                .stream()
                .map(this::toAuditoriaDTO)
                .toList();
        return ResponseEntity.ok(lista);
    }

    private AuditoriaAdminResponseDTO toAuditoriaDTO(AuditoriaAdmin a) {
        AuditoriaAdminResponseDTO dto = new AuditoriaAdminResponseDTO();
        dto.setId(a.getId());
        dto.setAdminCorreo(a.getAdminCorreo());
        dto.setAccion(a.getAccion());
        dto.setEntidad(a.getEntidad());
        dto.setEntidadId(a.getEntidadId());
        dto.setValorAnterior(a.getValorAnterior());
        dto.setValorNuevo(a.getValorNuevo());
        dto.setDetalles(a.getDetalles());
        dto.setFecha(a.getFecha());
        return dto;
    }
}
