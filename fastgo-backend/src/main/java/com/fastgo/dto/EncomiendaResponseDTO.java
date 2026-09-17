package com.fastgo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EncomiendaResponseDTO {

    private Integer id;
    private Integer clienteId;
    private String remitenteNombre;
    private String remitenteTelefono;
    private String direccionOrigen;
    private BigDecimal origenLat;
    private BigDecimal origenLng;
    private String destinatarioNombre;
    private String destinatarioTelefono;
    private String direccionDestino;
    private BigDecimal destinoLat;
    private BigDecimal destinoLng;
    private String descripcion;
    private String tamanoPeso;
    private BigDecimal distanciaKm;
    private BigDecimal costoEnvio;
    private Boolean tarifaAceptada;
    private Integer domiciliarioId;
    private String domiciliarioNombre;
    private String estado;
    private String observaciones;
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;

    public EncomiendaResponseDTO() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }

    public String getRemitenteNombre() { return remitenteNombre; }
    public void setRemitenteNombre(String remitenteNombre) { this.remitenteNombre = remitenteNombre; }

    public String getRemitenteTelefono() { return remitenteTelefono; }
    public void setRemitenteTelefono(String remitenteTelefono) { this.remitenteTelefono = remitenteTelefono; }

    public String getDireccionOrigen() { return direccionOrigen; }
    public void setDireccionOrigen(String direccionOrigen) { this.direccionOrigen = direccionOrigen; }

    public BigDecimal getOrigenLat() { return origenLat; }
    public void setOrigenLat(BigDecimal origenLat) { this.origenLat = origenLat; }

    public BigDecimal getOrigenLng() { return origenLng; }
    public void setOrigenLng(BigDecimal origenLng) { this.origenLng = origenLng; }

    public String getDestinatarioNombre() { return destinatarioNombre; }
    public void setDestinatarioNombre(String destinatarioNombre) { this.destinatarioNombre = destinatarioNombre; }

    public String getDestinatarioTelefono() { return destinatarioTelefono; }
    public void setDestinatarioTelefono(String destinatarioTelefono) { this.destinatarioTelefono = destinatarioTelefono; }

    public String getDireccionDestino() { return direccionDestino; }
    public void setDireccionDestino(String direccionDestino) { this.direccionDestino = direccionDestino; }

    public BigDecimal getDestinoLat() { return destinoLat; }
    public void setDestinoLat(BigDecimal destinoLat) { this.destinoLat = destinoLat; }

    public BigDecimal getDestinoLng() { return destinoLng; }
    public void setDestinoLng(BigDecimal destinoLng) { this.destinoLng = destinoLng; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getTamanoPeso() { return tamanoPeso; }
    public void setTamanoPeso(String tamanoPeso) { this.tamanoPeso = tamanoPeso; }

    public BigDecimal getDistanciaKm() { return distanciaKm; }
    public void setDistanciaKm(BigDecimal distanciaKm) { this.distanciaKm = distanciaKm; }

    public BigDecimal getCostoEnvio() { return costoEnvio; }
    public void setCostoEnvio(BigDecimal costoEnvio) { this.costoEnvio = costoEnvio; }

    public Boolean getTarifaAceptada() { return tarifaAceptada; }
    public void setTarifaAceptada(Boolean tarifaAceptada) { this.tarifaAceptada = tarifaAceptada; }

    public Integer getDomiciliarioId() { return domiciliarioId; }
    public void setDomiciliarioId(Integer domiciliarioId) { this.domiciliarioId = domiciliarioId; }

    public String getDomiciliarioNombre() { return domiciliarioNombre; }
    public void setDomiciliarioNombre(String domiciliarioNombre) { this.domiciliarioNombre = domiciliarioNombre; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }

    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}
