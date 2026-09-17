package com.fastgo.dto;

import jakarta.validation.constraints.NotBlank;

public class CambiarRolRequest {

    @NotBlank(message = "El nuevo rol es obligatorio")
    private String nuevoRol;

    public CambiarRolRequest() {
    }

    public CambiarRolRequest(String nuevoRol) {
        this.nuevoRol = nuevoRol;
    }

    public String getNuevoRol() {
        return nuevoRol;
    }

    public void setNuevoRol(String nuevoRol) {
        this.nuevoRol = nuevoRol;
    }
}
