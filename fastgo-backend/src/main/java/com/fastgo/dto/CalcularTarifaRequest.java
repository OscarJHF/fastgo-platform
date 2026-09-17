package com.fastgo.dto;

import java.math.BigDecimal;

public class CalcularTarifaRequest {

    private BigDecimal origenLat;
    private BigDecimal origenLng;
    private BigDecimal destinoLat;
    private BigDecimal destinoLng;
    private BigDecimal distanciaKm;

    public CalcularTarifaRequest() {}

    public CalcularTarifaRequest(BigDecimal origenLat, BigDecimal origenLng, BigDecimal destinoLat, BigDecimal destinoLng) {
        this.origenLat = origenLat;
        this.origenLng = origenLng;
        this.destinoLat = destinoLat;
        this.destinoLng = destinoLng;
    }

    public BigDecimal getOrigenLat() { return origenLat; }
    public void setOrigenLat(BigDecimal origenLat) { this.origenLat = origenLat; }

    public BigDecimal getOrigenLng() { return origenLng; }
    public void setOrigenLng(BigDecimal origenLng) { this.origenLng = origenLng; }

    public BigDecimal getDestinoLat() { return destinoLat; }
    public void setDestinoLat(BigDecimal destinoLat) { this.destinoLat = destinoLat; }

    public BigDecimal getDestinoLng() { return destinoLng; }
    public void setDestinoLng(BigDecimal destinoLng) { this.destinoLng = destinoLng; }

    public BigDecimal getDistanciaKm() { return distanciaKm; }
    public void setDistanciaKm(BigDecimal distanciaKm) { this.distanciaKm = distanciaKm; }
}
