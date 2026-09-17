package com.fastgo.dto;

import java.util.List;

public class DatosUsuarioReutilizablesDTO {

    private String nombre;
    private String apellido;
    private String correo;
    private String telefono;
    private List<String> rolesExistentes;

    public DatosUsuarioReutilizablesDTO() {}

    public DatosUsuarioReutilizablesDTO(String nombre, String apellido, String correo, String telefono, List<String> rolesExistentes) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.telefono = telefono;
        this.rolesExistentes = rolesExistentes;
    }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public List<String> getRolesExistentes() { return rolesExistentes; }
    public void setRolesExistentes(List<String> rolesExistentes) { this.rolesExistentes = rolesExistentes; }
}
