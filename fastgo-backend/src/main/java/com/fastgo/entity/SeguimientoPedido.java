package com.fastgo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "seguimiento_pedidos")
public class SeguimientoPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "pedido_id", nullable = false, unique = true)
    private Integer pedidoId;

    @Column(name = "domiciliario_id", nullable = false)
    private Integer domiciliarioId;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitud;

    @Column(nullable = false, precision = 11, scale = 7)
    private BigDecimal longitud;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    public SeguimientoPedido() {}

    public SeguimientoPedido(Integer pedidoId, Integer domiciliarioId, BigDecimal latitud, BigDecimal longitud) {
        this.pedidoId = pedidoId;
        this.domiciliarioId = domiciliarioId;
        this.latitud = latitud;
        this.longitud = longitud;
        this.actualizadoEn = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void alActualizar() {
        this.actualizadoEn = LocalDateTime.now();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getPedidoId() { return pedidoId; }
    public void setPedidoId(Integer pedidoId) { this.pedidoId = pedidoId; }

    public Integer getDomiciliarioId() { return domiciliarioId; }
    public void setDomiciliarioId(Integer domiciliarioId) { this.domiciliarioId = domiciliarioId; }

    public BigDecimal getLatitud() { return latitud; }
    public void setLatitud(BigDecimal latitud) { this.latitud = latitud; }

    public BigDecimal getLongitud() { return longitud; }
    public void setLongitud(BigDecimal longitud) { this.longitud = longitud; }

    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}
