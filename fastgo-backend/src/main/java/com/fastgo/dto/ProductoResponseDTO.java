package com.fastgo.dto;

import java.math.BigDecimal;

public class ProductoResponseDTO {

    private Integer id;
    private Integer sucursalId;
    private Integer categoriaId;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer tiempoPreparacion;
    private String imagenPrincipal;
    private Boolean disponible;
    private Boolean destacado;
    private Integer stock;

    public ProductoResponseDTO() {
    }

    public ProductoResponseDTO(
            Integer id,
            Integer sucursalId,
            Integer categoriaId,
            String nombre,
            String descripcion,
            BigDecimal precio,
            Integer tiempoPreparacion,
            String imagenPrincipal,
            Boolean disponible,
            Boolean destacado) {
        this(id, sucursalId, categoriaId, nombre, descripcion, precio, tiempoPreparacion, imagenPrincipal, disponible, destacado, null);
    }

    public ProductoResponseDTO(
            Integer id,
            Integer sucursalId,
            Integer categoriaId,
            String nombre,
            String descripcion,
            BigDecimal precio,
            Integer tiempoPreparacion,
            String imagenPrincipal,
            Boolean disponible,
            Boolean destacado,
            Integer stock) {

        this.id = id;
        this.sucursalId = sucursalId;
        this.categoriaId = categoriaId;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.tiempoPreparacion = tiempoPreparacion;
        this.imagenPrincipal = imagenPrincipal;
        this.disponible = disponible;
        this.destacado = destacado;
        this.stock = stock;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getSucursalId() {
        return sucursalId;
    }

    public void setSucursalId(Integer sucursalId) {
        this.sucursalId = sucursalId;
    }

    public Integer getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(Integer categoriaId) {
        this.categoriaId = categoriaId;
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

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public Integer getTiempoPreparacion() {
        return tiempoPreparacion;
    }

    public void setTiempoPreparacion(Integer tiempoPreparacion) {
        this.tiempoPreparacion = tiempoPreparacion;
    }

    public String getImagenPrincipal() {
        return imagenPrincipal;
    }

    public void setImagenPrincipal(String imagenPrincipal) {
        this.imagenPrincipal = imagenPrincipal;
    }

    public Boolean getDisponible() {
        return disponible;
    }

    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }

    public Boolean getDestacado() {
        return destacado;
    }

    public void setDestacado(Boolean destacado) {
        this.destacado = destacado;
    }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
}