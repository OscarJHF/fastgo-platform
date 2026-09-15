package com.fastgo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sucursales")
public class Sucursal {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name="comercio_id", nullable=false) private Integer comercioId;
    @Column(nullable=false, length=120) private String nombre;
    @Column(nullable=false, length=255) private String direccion;
    @Column(nullable=false, length=100) private String ciudad;
    @Column(length=100) private String departamento;
    @Column(length=20) private String telefono;
    @Column(precision=10, scale=8) private BigDecimal latitud;
    @Column(precision=11, scale=8) private BigDecimal longitud;
    @Column(name="radio_entrega_km", precision=5, scale=2) private BigDecimal radioEntregaKm;
    private Boolean abierta;
    @Column(name="creado_en") private LocalDateTime creadoEn;
    public Sucursal() {}
    @PrePersist protected void crear(){ if(creadoEn==null) creadoEn=LocalDateTime.now(); if(abierta==null) abierta=true; if(radioEntregaKm==null) radioEntregaKm=BigDecimal.valueOf(5); }
    @PreUpdate protected void actualizar(){ }
    public Integer getId(){return id;} public void setId(Integer v){id=v;}
    public Integer getComercioId(){return comercioId;} public void setComercioId(Integer v){comercioId=v;}
    public String getNombre(){return nombre;} public void setNombre(String v){nombre=v;}
    public String getDireccion(){return direccion;} public void setDireccion(String v){direccion=v;}
    public String getCiudad(){return ciudad;} public void setCiudad(String v){ciudad=v;}
    public String getDepartamento(){return departamento;} public void setDepartamento(String v){departamento=v;}
    public String getTelefono(){return telefono;} public void setTelefono(String v){telefono=v;}
    public BigDecimal getLatitud(){return latitud;} public void setLatitud(BigDecimal v){latitud=v;}
    public BigDecimal getLongitud(){return longitud;} public void setLongitud(BigDecimal v){longitud=v;}
    public BigDecimal getRadioEntregaKm(){return radioEntregaKm;} public void setRadioEntregaKm(BigDecimal v){radioEntregaKm=v;}
    public Boolean getAbierta(){return abierta;} public void setAbierta(Boolean v){abierta=v;}
    public LocalDateTime getCreadoEn(){return creadoEn;} public void setCreadoEn(LocalDateTime v){creadoEn=v;}
}
