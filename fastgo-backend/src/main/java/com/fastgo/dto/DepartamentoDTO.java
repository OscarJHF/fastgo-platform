package com.fastgo.dto;

public class DepartamentoDTO {
    private Integer id;
    private String codigoDane;
    private String nombre;

    public DepartamentoDTO() {
    }

    public DepartamentoDTO(Integer id, String codigoDane, String nombre) {
        this.id = id;
        this.codigoDane = codigoDane;
        this.nombre = nombre;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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
}
