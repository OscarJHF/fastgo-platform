package com.fastgo.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class TrackingUbicacionRequest {

    @NotNull(message = "El id del pedido es obligatorio")
    private Integer pedidoId;

    @NotNull(message = "La latitud es obligatoria")
    private BigDecimal latitud;

    @NotNull(message = "La longitud es obligatoria")
    private BigDecimal longitud;

    public TrackingUbicacionRequest() {}

    public TrackingUbicacionRequest(Integer pedidoId, BigDecimal latitud, BigDecimal longitud) {
        this.pedidoId = pedidoId;
        this.latitud = latitud;
        this.longitud = longitud;
    }

    public Integer getPedidoId() { return pedidoId; }
    public void setPedidoId(Integer pedidoId) { this.pedidoId = pedidoId; }

    public BigDecimal getLatitud() { return latitud; }
    public void setLatitud(BigDecimal latitud) { this.latitud = latitud; }

    public BigDecimal getLongitud() { return longitud; }
    public void setLongitud(BigDecimal longitud) { this.longitud = longitud; }
}
