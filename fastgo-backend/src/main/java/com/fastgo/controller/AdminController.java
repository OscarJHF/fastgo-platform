package com.fastgo.controller;

import com.fastgo.dto.AdminTiendaResponseDTO;
import com.fastgo.dto.AuditoriaAdminResponseDTO;
import com.fastgo.dto.ConfiguracionSuscripcionDTO;
import com.fastgo.dto.SuscripcionResponseDTO;
import com.fastgo.entity.AuditoriaAdmin;
import com.fastgo.repository.AuditoriaAdminRepository;
import com.fastgo.service.ComercioService;
import com.fastgo.service.SuscripcionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
    private final com.fastgo.service.UsuarioService usuarioService;
    private final com.fastgo.service.EmailService emailService;

    public AdminController(
            ComercioService comercioService,
            SuscripcionService suscripcionService,
            AuditoriaAdminRepository auditoriaAdminRepository,
            com.fastgo.service.UsuarioService usuarioService,
            com.fastgo.service.EmailService emailService) {
        this.comercioService = comercioService;
        this.suscripcionService = suscripcionService;
        this.auditoriaAdminRepository = auditoriaAdminRepository;
        this.usuarioService = usuarioService;
        this.emailService = emailService;
    }

    @GetMapping("/tiendas")
    public ResponseEntity<List<AdminTiendaResponseDTO>> listarTiendas() {
        return ResponseEntity.ok(comercioService.listarTodasAdmin());
    }

    @GetMapping("/tiendas/{id}")
    public ResponseEntity<AdminTiendaResponseDTO> obtenerTienda(@PathVariable @Positive Integer id) {
        return ResponseEntity.ok(comercioService.buscarPorIdAdmin(id));
    }

    @PostMapping("/test-email")
    public ResponseEntity<Map<String, String>> testEmail(@RequestBody(required = false) Map<String, String> body) {
        String correo = body != null ? body.get("correo") : null;
        if (correo == null || correo.isBlank()) {
            correo = "soporte@fastgo.com";
        }
        emailService.enviarCorreoRecuperacion(correo, "Usuario Test Admin", "test-token-12345");
        return ResponseEntity.ok(Map.of("mensaje", "Correo de prueba enviado a " + correo));
    }

    @PutMapping("/tiendas/{id}/activar")
    public ResponseEntity<AdminTiendaResponseDTO> activarTienda(
            @PathVariable @Positive Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        String razon = body != null ? body.get("razon") : null;
        return ResponseEntity.ok(comercioService.activarTiendaAdmin(id, razon));
    }

    @PutMapping("/tiendas/{id}/destacado")
    public ResponseEntity<AdminTiendaResponseDTO> cambiarDestacadoTienda(
            @PathVariable @Positive Integer id,
            @RequestBody Map<String, Object> body) {
        Boolean destacado = body != null && body.containsKey("destacado") ? (Boolean) body.get("destacado") : null;
        String razon = body != null && body.containsKey("razon") ? (String) body.get("razon") : null;
        return ResponseEntity.ok(comercioService.cambiarDestacadoAdmin(id, destacado, razon));
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

    @DeleteMapping("/tiendas/{id}")
    public ResponseEntity<AdminTiendaResponseDTO> eliminarTienda(
            @PathVariable @Positive Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        String razon = body != null ? body.get("razon") : null;
        return ResponseEntity.ok(comercioService.eliminarTiendaAdmin(id, razon));
    }

    @PutMapping("/tiendas/{id}/eliminar")
    public ResponseEntity<AdminTiendaResponseDTO> eliminarTiendaPut(
            @PathVariable @Positive Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        String razon = body != null ? body.get("razon") : null;
        return ResponseEntity.ok(comercioService.eliminarTiendaAdmin(id, razon));
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<com.fastgo.dto.UsuarioResponseDTO>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<com.fastgo.dto.UsuarioResponseDTO> modificarUsuario(
            @PathVariable @Positive Integer id,
            @Valid @RequestBody com.fastgo.dto.AdminUsuarioModificarRequest request,
            Authentication authentication) {
        String adminCorreo = authentication != null ? authentication.getName() : "ADMIN";
        return ResponseEntity.ok(usuarioService.modificarUsuarioAdmin(id, request, adminCorreo));
    }

    @PutMapping("/usuarios/{id}/estado")
    public ResponseEntity<com.fastgo.dto.UsuarioResponseDTO> cambiarEstadoUsuario(
            @PathVariable @Positive Integer id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        String adminCorreo = authentication != null ? authentication.getName() : "ADMIN";
        Boolean estado = body != null && body.containsKey("estado") ? (Boolean) body.get("estado") : null;
        String motivo = body != null ? (String) body.get("motivo") : null;
        return ResponseEntity.ok(usuarioService.cambiarEstadoUsuarioAdmin(id, estado, motivo, adminCorreo));
    }

    @PutMapping("/usuarios/{id}/roles")
    public ResponseEntity<com.fastgo.dto.UsuarioResponseDTO> cambiarRolesUsuario(
            @PathVariable @Positive Integer id,
            @RequestBody Map<String, List<String>> body,
            Authentication authentication) {
        String adminCorreo = authentication != null ? authentication.getName() : "ADMIN";
        List<String> roles = body != null ? body.get("roles") : null;
        return ResponseEntity.ok(usuarioService.cambiarRolesUsuarioAdmin(id, roles, adminCorreo));
    }

    @PostMapping("/usuarios/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetPasswordUsuario(
            @PathVariable @Positive Integer id,
            Authentication authentication) {
        String adminCorreo = authentication != null ? authentication.getName() : "ADMIN";
        return ResponseEntity.ok(usuarioService.resetPasswordUsuarioAdmin(id, adminCorreo));
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

    @GetMapping("/suscripciones/pendientes")
    public ResponseEntity<List<SuscripcionResponseDTO>> listarSuscripcionesPendientes() {
        return ResponseEntity.ok(suscripcionService.listarPendientesVerificacion());
    }

    @PostMapping("/suscripciones/{id}/aprobar")
    public ResponseEntity<SuscripcionResponseDTO> aprobarSuscripcion(
            @PathVariable @Positive Integer id,
            Authentication authentication) {
        String adminCorreo = authentication != null ? authentication.getName() : "ADMIN";
        return ResponseEntity.ok(suscripcionService.aprobarSuscripcionAdmin(id, adminCorreo));
    }

    @PostMapping("/suscripciones/{id}/rechazar")
    public ResponseEntity<SuscripcionResponseDTO> rechazarSuscripcion(
            @PathVariable @Positive Integer id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {
        String adminCorreo = authentication != null ? authentication.getName() : "ADMIN";
        String motivo = body != null ? body.get("motivo") : null;
        return ResponseEntity.ok(suscripcionService.rechazarSuscripcionAdmin(id, motivo, adminCorreo));
    }

    @GetMapping("/suscripciones/{id}/comprobante")
    public ResponseEntity<Resource> verComprobanteSuscripcionAdmin(
            @PathVariable @Positive Integer id) {
        Resource resource = suscripcionService.cargarComprobantePorSuscripcion(id);
        MediaType mediaType = suscripcionService.obtenerMediaTypeComprobantePorSuscripcion(id);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"comprobante_suscripcion_admin_" + id + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .body(resource);
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
