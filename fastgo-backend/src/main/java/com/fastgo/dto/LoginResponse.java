package com.fastgo.dto;

public class LoginResponse {

    private String token;
    private String mensaje;
    private UsuarioResponseDTO usuario;
    private String rol;
    private String activeRole;
    private java.util.List<String> availableRoles;

    public LoginResponse() {
    }

    public LoginResponse(String token, String mensaje) {
        this.token = token;
        this.mensaje = mensaje;
    }

    public LoginResponse(String token, String mensaje, UsuarioResponseDTO usuario, String rol, java.util.List<String> availableRoles) {
        this.token = token;
        this.mensaje = mensaje;
        this.usuario = usuario;
        this.rol = rol;
        this.activeRole = rol;
        this.availableRoles = availableRoles;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public UsuarioResponseDTO getUsuario() { return usuario; }
    public void setUsuario(UsuarioResponseDTO usuario) { this.usuario = usuario; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public String getActiveRole() { return activeRole; }
    public void setActiveRole(String activeRole) { this.activeRole = activeRole; }

    public java.util.List<String> getAvailableRoles() { return availableRoles; }
    public void setAvailableRoles(java.util.List<String> availableRoles) { this.availableRoles = availableRoles; }
}