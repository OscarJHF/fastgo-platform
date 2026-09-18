package com.fastgo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    @NotBlank(message = "El token de recuperacion es obligatorio")
    private String token;

    @NotBlank(message = "La nueva contrasena es obligatoria")
    @Size(min = 6, max = 72, message = "La contrasena debe tener entre 6 y 72 caracteres")
    private String nuevaPassword;

    public ResetPasswordRequest() {}

    public ResetPasswordRequest(String token, String nuevaPassword) {
        this.token = token;
        this.nuevaPassword = nuevaPassword;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNuevaPassword() {
        return nuevaPassword;
    }

    public void setNuevaPassword(String nuevaPassword) {
        this.nuevaPassword = nuevaPassword;
    }
}
