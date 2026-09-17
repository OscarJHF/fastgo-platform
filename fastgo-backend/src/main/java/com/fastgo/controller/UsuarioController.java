package com.fastgo.controller;

import com.fastgo.dto.RegistroUsuarioRequest;
import com.fastgo.dto.UsuarioResponseDTO;
import com.fastgo.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioResponseDTO>> listar() {
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> me() {
        return ResponseEntity.ok(usuarioService.obtenerUsuarioActual());
    }

    @GetMapping("/datos-reutilizables")
    public ResponseEntity<com.fastgo.dto.DatosUsuarioReutilizablesDTO> datosReutilizables(
            @RequestParam(required = false) String correo) {
        return ResponseEntity.ok(usuarioService.obtenerDatosReutilizables(correo));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> registrar(
            @Valid @RequestBody RegistroUsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.registrarCliente(request));
    }
}
