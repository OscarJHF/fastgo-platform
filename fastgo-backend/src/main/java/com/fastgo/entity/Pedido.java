package com.fastgo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "usuario_id", nullable = false)
    private Integer usuarioId;

    @Column(name = "sucursal_id", nullable = false)
    private Integer sucursalId;

    @Column(name = "direccion_id", nullable = false)
    private Integer direccionId;

    @Column(name = "domiciliario_id")
    private Integer domiciliarioId;

    @Column(nullable = false, length = 50)
    private String estado;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "costo_envio", nullable = false, precision = 12, scale = 2)
    private BigDecimal costoEnvio;

    @Column(name = "distancia_km", precision = 6, scale = 2)
    private BigDecimal distanciaKm;

    @Column(name = "tarifa_aceptada")
    private Boolean tarifaAceptada;

    @Column(name = "metodo_pago", length = 50)
    private String metodoPago;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    public Pedido() {}

    @PrePersist
    protected void alCrear() {
        if (creadoEn == null) creadoEn = LocalDateTime.now();
        if (estado == null || estado.isBlank()) estado = "PENDIENTE";
        if (costoEnvio == null) costoEnvio = BigDecimal.ZERO;
        if (tarifaAceptada == null) tarifaAceptada = true;
        if (metodoPago == null || metodoPago.isBlank()) metodoPago = "EFECTIVO";
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public Integer getDireccionId() { return direccionId; }
    public void setDireccionId(Integer direccionId) { this.direccionId = direccionId; }

    public Integer getDomiciliarioId() { return domiciliarioId; }
    public void setDomiciliarioId(Integer domiciliarioId) { this.domiciliarioId = domiciliarioId; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getCostoEnvio() { return costoEnvio; }
    public void setCostoEnvio(BigDecimal costoEnvio) { this.costoEnvio = costoEnvio; }

    public BigDecimal getDistanciaKm() { return distanciaKm; }
    public void setDistanciaKm(BigDecimal distanciaKm) { this.distanciaKm = distanciaKm; }

    public Boolean getTarifaAceptada() { return tarifaAceptada; }
    public void setTarifaAceptada(Boolean tarifaAceptada) { this.tarifaAceptada = tarifaAceptada; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
}
