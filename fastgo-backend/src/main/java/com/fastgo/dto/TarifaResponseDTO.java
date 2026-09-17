package com.fastgo.dto;

import java.math.BigDecimal;

public class TarifaResponseDTO {

    private BigDecimal distanciaKm;
    private BigDecimal costoEnvio;
    private BigDecimal tarifaBase;
    private String desglose;

    public TarifaResponseDTO() {}

    public TarifaResponseDTO(BigDecimal distanciaKm, BigDecimal costoEnvio, BigDecimal tarifaBase, String desglose) {
        this.distanciaKm = distanciaKm;
        this.costoEnvio = costoEnvio;
        this.tarifaBase = tarifaBase;
        this.desglose = desglose;
    }

    public BigDecimal getDistanciaKm() { return distanciaKm; }
    public void setDistanciaKm(BigDecimal distanciaKm) { this.distanciaKm = distanciaKm; }

    public BigDecimal getCostoEnvio() { return costoEnvio; }
    public void setCostoEnvio(BigDecimal costoEnvio) { this.costoEnvio = costoEnvio; }

    public BigDecimal getTarifaBase() { return tarifaBase; }
    public void setTarifaBase(BigDecimal tarifaBase) { this.tarifaBase = tarifaBase; }

    public String getDesglose() { return desglose; }
    public void setDesglose(String desglose) { this.desglose = desglose; }
}
