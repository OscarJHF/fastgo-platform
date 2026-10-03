package com.fastgo.dto;

import java.math.BigDecimal;

public class MunicipioDTO {
    private Integer id;
    private Integer departamentoId;
    private String codigoDane;
    private String nombre;
    private BigDecimal latitud;
    private BigDecimal longitud;

    public MunicipioDTO() {
    }

    public MunicipioDTO(Integer id, Integer departamentoId, String codigoDane, String nombre, BigDecimal latitud, BigDecimal longitud) {
        this.id = id;
        this.departamentoId = departamentoId;
        this.codigoDane = codigoDane;
        this.nombre = nombre;
        this.latitud = latitud;
        this.longitud = longitud;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getDepartamentoId() {
        return departamentoId;
    }

    public void setDepartamentoId(Integer departamentoId) {
        this.departamentoId = departamentoId;
    }

    public String getCodigoDane() {
        return codigoDane;
    }

    public void setCodigoDane(String codigoDane) {
        this.codigoDane = codigoDane;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public BigDecimal getLatitud() {
        return latitud;
    }

    public void setLatitud(BigDecimal latitud) {
        this.latitud = latitud;
    }

    public BigDecimal getLongitud() {
        return longitud;
    }

    public void setLongitud(BigDecimal longitud) {
        this.longitud = longitud;
    }
}
