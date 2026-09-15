package com.fastgo.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestRoleController {

    @GetMapping("/publico")
    public String publico() {
        return "Ruta pública";
    }

    @GetMapping("/cliente")
    @PreAuthorize("hasRole('CLIENTE')")
    public String cliente() {
        return "Bienvenido Cliente";
    }

    @GetMapping("/comercio")
    @PreAuthorize("hasRole('COMERCIO')")
    public String comercio() {
        return "Bienvenido Comercio";
    }

    @GetMapping("/domiciliario")
    @PreAuthorize("hasRole('DOMICILIARIO')")
    public String domiciliario() {
        return "Bienvenido Domiciliario";
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String admin() {
        return "Bienvenido Administrador";
    }
}