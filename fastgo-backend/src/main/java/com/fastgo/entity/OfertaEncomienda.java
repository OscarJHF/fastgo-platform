package com.fastgo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ofertas_encomienda")
public class OfertaEncomienda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encomienda_id", nullable = false)
    private Encomienda encomienda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domiciliario_id", nullable = false)
    private Usuario domiciliario;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(length = 255)
    private String mensaje;

    @Column(nullable = false, length = 30)
    private String estado; // PENDIENTE, ACEPTADA, RECHAZADA, CANCELADA

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    public OfertaEncomienda() {}

    @PrePersist
    protected void alCrear() {
        LocalDateTime ahora = LocalDateTime.now();
        if (creadoEn == null) creadoEn = ahora;
        if (actualizadoEn == null) actualizadoEn = ahora;
        if (estado == null || estado.isBlank()) estado = "PENDIENTE";
    }

    @PreUpdate
    protected void alActualizar() {
        actualizadoEn = LocalDateTime.now();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Encomienda getEncomienda() {
        return encomienda;
    }

    public void setEncomienda(Encomienda encomienda) {
        this.encomienda = encomienda;
    }

    public Usuario getDomiciliario() {
        return domiciliario;
    }

    public void setDomiciliario(Usuario domiciliario) {
        this.domiciliario = domiciliario;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(LocalDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }

    public LocalDateTime getActualizadoEn() {
        return actualizadoEn;
    }

    public void setActualizadoEn(LocalDateTime actualizadoEn) {
        this.actualizadoEn = actualizadoEn;
    }
}
