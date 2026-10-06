package com.fastgo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TrackingResponseDTO {

    private Integer id;
    private Integer pedidoId;
    private Integer domiciliarioId;
    private BigDecimal latitud;
    private BigDecimal longitud;
    private BigDecimal precision;
    private BigDecimal rumbo;
    private BigDecimal velocidad;
    private LocalDateTime actualizadoEn;
    private String fechaHora;
    private String estadoPedido;
    private BigDecimal origenLat;
    private BigDecimal origenLng;
    private BigDecimal destinoLat;
    private BigDecimal destinoLng;
    private String destinoDireccion;
    private String destinoCiudad;
    private Boolean activo;

    public TrackingResponseDTO() {}

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

    public BigDecimal getPrecision() { return precision; }
    public void setPrecision(BigDecimal precision) { this.precision = precision; }

    public BigDecimal getRumbo() { return rumbo; }
    public void setRumbo(BigDecimal rumbo) { this.rumbo = rumbo; }

    public BigDecimal getVelocidad() { return velocidad; }
    public void setVelocidad(BigDecimal velocidad) { this.velocidad = velocidad; }

    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) {
        this.actualizadoEn = actualizadoEn;
        if (actualizadoEn != null && (this.fechaHora == null || this.fechaHora.isBlank())) {
            this.fechaHora = actualizadoEn.toString();
        }
    }

    public String getFechaHora() {
        if (fechaHora != null) return fechaHora;
        return actualizadoEn != null ? actualizadoEn.toString() : null;
    }
    public void setFechaHora(String fechaHora) { this.fechaHora = fechaHora; }

    public String getEstadoPedido() { return estadoPedido; }
    public void setEstadoPedido(String estadoPedido) { this.estadoPedido = estadoPedido; }

    public BigDecimal getOrigenLat() { return origenLat; }
    public void setOrigenLat(BigDecimal origenLat) { this.origenLat = origenLat; }

    public BigDecimal getOrigenLng() { return origenLng; }
    public void setOrigenLng(BigDecimal origenLng) { this.origenLng = origenLng; }

    public BigDecimal getDestinoLat() { return destinoLat; }
    public void setDestinoLat(BigDecimal destinoLat) { this.destinoLat = destinoLat; }

    public BigDecimal getDestinoLng() { return destinoLng; }
    public void setDestinoLng(BigDecimal destinoLng) { this.destinoLng = destinoLng; }

    public String getDestinoDireccion() { return destinoDireccion; }
    public void setDestinoDireccion(String destinoDireccion) { this.destinoDireccion = destinoDireccion; }

    public String getDestinoCiudad() { return destinoCiudad; }
    public void setDestinoCiudad(String destinoCiudad) { this.destinoCiudad = destinoCiudad; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
