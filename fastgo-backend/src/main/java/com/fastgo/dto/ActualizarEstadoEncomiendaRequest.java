package com.fastgo.dto;

import jakarta.validation.constraints.NotBlank;

public class ActualizarEstadoEncomiendaRequest {

    @NotBlank(message = "El nuevo estado es obligatorio")
    private String estado;

    private String observaciones;

    public ActualizarEstadoEncomiendaRequest() {}

    public ActualizarEstadoEncomiendaRequest(String estado) {
        this.estado = estado;
    }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
