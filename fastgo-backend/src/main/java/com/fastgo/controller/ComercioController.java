package com.fastgo.controller;

import com.fastgo.dto.ComercioRequestDTO;
import com.fastgo.dto.ComercioResponseDTO;
import com.fastgo.dto.ConfiguracionSuscripcionDTO;
import com.fastgo.service.ComercioService;
import com.fastgo.service.SuscripcionService;
import com.fastgo.dto.SuscripcionResponseDTO;
import com.fastgo.entity.Usuario;
import com.fastgo.repository.UsuarioRepository;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import java.util.List;

@RestController
@RequestMapping("/api/comercios")
public class ComercioController {

    private final ComercioService comercioService;
    private final SuscripcionService suscripcionService;
    private final UsuarioRepository usuarioRepository;

    public ComercioController(
            ComercioService comercioService,
            SuscripcionService suscripcionService,
            UsuarioRepository usuarioRepository) {
        this.comercioService = comercioService;
        this.suscripcionService = suscripcionService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<List<ComercioResponseDTO>> listar(
            @RequestParam(required = false) String departamentoId,
            @RequestParam(required = false) String municipioId) {
        return ResponseEntity.ok(
                comercioService.listarComerciosFiltrados(departamentoId, municipioId));
    }

    @GetMapping("/destacados")
    public ResponseEntity<List<ComercioResponseDTO>> listarDestacados(
            @RequestParam(required = false) String departamentoId,
            @RequestParam(required = false) String municipioId) {
        return ResponseEntity.ok(
                comercioService.listarComerciosDestacados(departamentoId, municipioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComercioResponseDTO> buscar(
            @PathVariable @Positive Integer id) {
        return ResponseEntity.ok(
                comercioService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<ComercioResponseDTO> guardar(
            @Valid @RequestBody ComercioRequestDTO datos) {
        return ResponseEntity.ok(
                comercioService.guardar(datos));
    }
    @PutMapping("/propio")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<ComercioResponseDTO> actualizarPropio(
            @Valid @RequestBody ComercioRequestDTO datos) {
        ComercioResponseDTO propio = comercioService.buscarPropio();
        if (propio == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(
                comercioService.actualizar(propio.getId(), datos));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<ComercioResponseDTO> actualizar(
            @PathVariable @Positive Integer id,
            @Valid @RequestBody ComercioRequestDTO datos) {
        return ResponseEntity.ok(
                comercioService.actualizar(id, datos));
    }

    @GetMapping("/propio")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<ComercioResponseDTO> buscarPropio() {
        ComercioResponseDTO propio = comercioService.buscarPropio();
        if (propio == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(propio);
    }

    @GetMapping("/mis-tiendas")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<List<ComercioResponseDTO>> misTiendas() {
        return ResponseEntity.ok(comercioService.listarMisTiendas());
    }

    @GetMapping("/suscripciones/configuracion")
    public ResponseEntity<ConfiguracionSuscripcionDTO> configuracionSuscripciones() {
        return ResponseEntity.ok(suscripcionService.obtenerConfiguracionDTO());
    }

    @GetMapping("/{id}/suscripcion")
    @PreAuthorize("hasRole('COMERCIO') or hasRole('ADMIN')")
    public ResponseEntity<SuscripcionResponseDTO> obtenerSuscripcionTienda(
            @PathVariable @Positive Integer id) {
        return suscripcionService.obtenerUltimaSuscripcion(id)
                .map(sub -> ResponseEntity.ok(suscripcionService.toDTO(sub)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/suscripcion/comprobante")
    @PreAuthorize("hasRole('COMERCIO') or hasRole('ADMIN')")
    public ResponseEntity<SuscripcionResponseDTO> subirComprobanteSuscripcion(
            @PathVariable @Positive Integer id,
            @RequestParam("comprobante") MultipartFile comprobante,
            @RequestParam(value = "referencia", required = false) String referencia,
            Authentication authentication) {
        Usuario solicitante = usuarioRepository.findByCorreo(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + authentication.getName()));

        return ResponseEntity.ok(
                suscripcionService.subirComprobante(id, comprobante, referencia, solicitante));
    }

    @GetMapping("/{id}/suscripcion/comprobante")
    @PreAuthorize("hasRole('COMERCIO') or hasRole('ADMIN')")
    public ResponseEntity<Resource> verComprobanteSuscripcion(
            @PathVariable @Positive Integer id,
            Authentication authentication) {
        Usuario solicitante = usuarioRepository.findByCorreo(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + authentication.getName()));

        Resource resource = suscripcionService.cargarComprobantePrivado(id, solicitante);
        MediaType mediaType = suscripcionService.obtenerMediaTypeComprobante(id);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"comprobante_suscripcion_" + id + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .body(resource);
    }

    @PatchMapping("/{id}/pausa-manual")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<ComercioResponseDTO> togglePausaManual(
            @PathVariable @Positive Integer id) {
        return ResponseEntity.ok(comercioService.togglePausaManual(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMERCIO')")
    public ResponseEntity<Void> eliminar(
            @PathVariable @Positive Integer id) {

        comercioService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}
