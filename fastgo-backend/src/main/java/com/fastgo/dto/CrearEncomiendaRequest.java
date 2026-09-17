package com.fastgo.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class CrearEncomiendaRequest {

    @NotBlank(message = "El nombre del remitente es obligatorio")
    private String remitenteNombre;

    @NotBlank(message = "El teléfono del remitente es obligatorio")
    private String remitenteTelefono;

    @NotBlank(message = "La dirección de origen es obligatoria")
    private String direccionOrigen;

    private BigDecimal origenLat;
    private BigDecimal origenLng;

    @NotBlank(message = "El nombre del destinatario es obligatorio")
    private String destinatarioNombre;

    @NotBlank(message = "El teléfono del destinatario es obligatorio")
    private String destinatarioTelefono;

    @NotBlank(message = "La dirección de destino es obligatoria")
    private String direccionDestino;

    private BigDecimal destinoLat;
    private BigDecimal destinoLng;

    @NotBlank(message = "La descripción del envío es obligatoria")
    private String descripcion;

    private String tamanoPeso;
    private BigDecimal distanciaKm;
    private BigDecimal costoEnvio;
    private Boolean tarifaAceptada;
    private String observaciones;

    public CrearEncomiendaRequest() {}

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

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
