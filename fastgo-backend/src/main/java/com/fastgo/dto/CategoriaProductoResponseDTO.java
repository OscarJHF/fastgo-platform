package com.fastgo.dto;

public class CategoriaProductoResponseDTO {

    private Integer id;
    private String nombre;
    private String descripcion;
    private String icono;
    private Boolean activo;

    public CategoriaProductoResponseDTO() {
    }

    public CategoriaProductoResponseDTO(
            Integer id,
            String nombre,
            String descripcion,
            String icono,
            Boolean activo) {

        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.icono = icono;
        this.activo = activo;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getIcono() {
        return icono;
    }

    public void setIcono(String icono) {
        this.icono = icono;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}