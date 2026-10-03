package com.fastgo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "municipios")
public class Municipio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "departamento_id", nullable = false)
    private Departamento departamento;

    @Column(name = "codigo_dane", nullable = false, unique = true, length = 10)
    private String codigoDane;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitud;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitud;

    private Boolean activo;

    public Municipio() {}

    public Municipio(Integer id, Departamento departamento, String codigoDane, String nombre, BigDecimal latitud, BigDecimal longitud, Boolean activo) {
        this.id = id;
        this.departamento = departamento;
        this.codigoDane = codigoDane;
        this.nombre = nombre;
        this.latitud = latitud;
        this.longitud = longitud;
        this.activo = activo;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Departamento getDepartamento() { return departamento; }
    public void setDepartamento(Departamento departamento) { this.departamento = departamento; }

    public String getCodigoDane() { return codigoDane; }
    public void setCodigoDane(String codigoDane) { this.codigoDane = codigoDane; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public BigDecimal getLatitud() { return latitud; }
    public void setLatitud(BigDecimal latitud) { this.latitud = latitud; }

    public BigDecimal getLongitud() { return longitud; }
    public void setLongitud(BigDecimal longitud) { this.longitud = longitud; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
