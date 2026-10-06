package com.fastgo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "suscripciones")
public class Suscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "comercio_id", nullable = false)
    private Integer comercioId;

    @Column(name = "usuario_id", nullable = false)
    private Integer usuarioId;

    @Column(name = "tipo_plan", nullable = false, length = 40)
    private String tipoPlan; // TIENDA_PRINCIPAL, TIENDA_ADICIONAL

    @Column(name = "estado", nullable = false, length = 40)
    private String estado; // GRATUITO, ACTIVA, PENDIENTE_ACTIVACION, PENDIENTE_PAGO, VENCIDA, CANCELADA

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(name = "monto", nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    @Column(name = "periodo", nullable = false, length = 30)
    private String periodo; // GRATUITO, MENSUAL

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    @Column(name = "referencia_pago", length = 100)
    private String referenciaPago;

    @Column(name = "comprobante_url", length = 500)
    private String comprobanteUrl;

    @Column(name = "comprobante_key", length = 500)
    private String comprobanteKey;

    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;

    @Column(name = "revisado_por", length = 100)
    private String revisadoPor;

    @Column(name = "revisado_en")
    private LocalDateTime revisadoEn;

    @Column(name = "creado_por", length = 100)
    private String creadoPor;

    @Column(name = "actualizado_por", length = 100)
    private String actualizadoPor;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    public Suscripcion() {
    }

    @PrePersist
    protected void alCrear() {
        LocalDateTime ahora = LocalDateTime.now();
        if (creadoEn == null) creadoEn = ahora;
        if (actualizadoEn == null) actualizadoEn = ahora;
        if (monto == null) monto = BigDecimal.ZERO;
        if (periodo == null) periodo = "MENSUAL";
    }

    @PreUpdate
    protected void alActualizar() {
        actualizadoEn = LocalDateTime.now();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getComercioId() { return comercioId; }
    public void setComercioId(Integer comercioId) { this.comercioId = comercioId; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public String getTipoPlan() { return tipoPlan; }
    public void setTipoPlan(String tipoPlan) { this.tipoPlan = tipoPlan; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDateTime fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDateTime getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDateTime fechaFin) { this.fechaFin = fechaFin; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }

    public String getReferenciaPago() { return referenciaPago; }
    public void setReferenciaPago(String referenciaPago) { this.referenciaPago = referenciaPago; }

    public String getComprobanteUrl() { return comprobanteUrl; }
    public void setComprobanteUrl(String comprobanteUrl) { this.comprobanteUrl = comprobanteUrl; }

    public String getComprobanteKey() { return comprobanteKey; }
    public void setComprobanteKey(String comprobanteKey) { this.comprobanteKey = comprobanteKey; }

    public String getMotivoRechazo() { return motivoRechazo; }
    public void setMotivoRechazo(String motivoRechazo) { this.motivoRechazo = motivoRechazo; }

    public String getRevisadoPor() { return revisadoPor; }
    public void setRevisadoPor(String revisadoPor) { this.revisadoPor = revisadoPor; }

    public LocalDateTime getRevisadoEn() { return revisadoEn; }
    public void setRevisadoEn(LocalDateTime revisadoEn) { this.revisadoEn = revisadoEn; }

    public String getCreadoPor() { return creadoPor; }
    public void setCreadoPor(String creadoPor) { this.creadoPor = creadoPor; }

    public String getActualizadoPor() { return actualizadoPor; }
    public void setActualizadoPor(String actualizadoPor) { this.actualizadoPor = actualizadoPor; }

    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }

    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}
