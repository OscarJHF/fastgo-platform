package com.fastgo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "departamentos")
public class Departamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "codigo_dane", nullable = false, unique = true, length = 10)
    private String codigoDane;

    @Column(nullable = false, length = 100)
    private String nombre;

    private Boolean activo;

    public Departamento() {}

    public Departamento(Integer id, String codigoDane, String nombre, Boolean activo) {
        this.id = id;
        this.codigoDane = codigoDane;
        this.nombre = nombre;
        this.activo = activo;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getCodigoDane() { return codigoDane; }
    public void setCodigoDane(String codigoDane) { this.codigoDane = codigoDane; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
