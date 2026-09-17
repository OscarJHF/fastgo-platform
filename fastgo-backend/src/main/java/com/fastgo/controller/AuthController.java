package com.fastgo.controller;

import com.fastgo.dto.LoginRequest;
import com.fastgo.dto.LoginResponse;
import com.fastgo.entity.Usuario;
import com.fastgo.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.autenticar(request));
    }

    @PostMapping("/cambiar-rol")
    public ResponseEntity<LoginResponse> cambiarRol(
            @Valid @RequestBody com.fastgo.dto.CambiarRolRequest request) {
        return ResponseEntity.ok(authService.cambiarRol(request.getNuevoRol()));
    }
}
