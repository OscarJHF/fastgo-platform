package com.fastgo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SuscripcionResponseDTO {

    private Integer id;
    private Integer comercioId;
    private String comercioNombre;
    private Integer usuarioId;
    private String tipoPlan;
    private String estado;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private BigDecimal monto;
    private String periodo;
    private LocalDateTime fechaPago;
    private String referenciaPago;
    private String comprobanteUrl;
    private String comprobanteKey;
    private String motivoRechazo;
    private String revisadoPor;
    private LocalDateTime revisadoEn;
    private Boolean esVencida;
    private Long diasRestantes;
    private Boolean alertaVencimiento;

    // FastGo official bank details for subscription payments
    private String bancoNombre;
    private String bancoTipoCuenta;
    private String bancoNumeroCuenta;
    private String bancoTitular;
    private String bancoDocumento;
    private String instruccionesPago;

    public SuscripcionResponseDTO() {
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getComercioId() { return comercioId; }
    public void setComercioId(Integer comercioId) { this.comercioId = comercioId; }

    public String getComercioNombre() { return comercioNombre; }
    public void setComercioNombre(String comercioNombre) { this.comercioNombre = comercioNombre; }

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

    public Boolean getEsVencida() { return esVencida; }
    public void setEsVencida(Boolean esVencida) { this.esVencida = esVencida; }

    public Long getDiasRestantes() { return diasRestantes; }
    public void setDiasRestantes(Long diasRestantes) { this.diasRestantes = diasRestantes; }

    public Boolean getAlertaVencimiento() { return alertaVencimiento; }
    public void setAlertaVencimiento(Boolean alertaVencimiento) { this.alertaVencimiento = alertaVencimiento; }

    public String getBancoNombre() { return bancoNombre; }
    public void setBancoNombre(String bancoNombre) { this.bancoNombre = bancoNombre; }

    public String getBancoTipoCuenta() { return bancoTipoCuenta; }
    public void setBancoTipoCuenta(String bancoTipoCuenta) { this.bancoTipoCuenta = bancoTipoCuenta; }

    public String getBancoNumeroCuenta() { return bancoNumeroCuenta; }
    public void setBancoNumeroCuenta(String bancoNumeroCuenta) { this.bancoNumeroCuenta = bancoNumeroCuenta; }

    public String getBancoTitular() { return bancoTitular; }
    public void setBancoTitular(String bancoTitular) { this.bancoTitular = bancoTitular; }

    public String getBancoDocumento() { return bancoDocumento; }
    public void setBancoDocumento(String bancoDocumento) { this.bancoDocumento = bancoDocumento; }

    public String getInstruccionesPago() { return instruccionesPago; }
    public void setInstruccionesPago(String instruccionesPago) { this.instruccionesPago = instruccionesPago; }
}
