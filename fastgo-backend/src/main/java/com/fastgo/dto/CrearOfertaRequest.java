package com.fastgo.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class CrearOfertaRequest {

    @NotNull(message = "El valor de la oferta es obligatorio")
    @Positive(message = "El valor de la oferta debe ser mayor a cero")
    private BigDecimal valor;

    @Size(max = 255, message = "El mensaje no puede exceder 255 caracteres")
    private String mensaje;

    public CrearOfertaRequest() {}

    public CrearOfertaRequest(BigDecimal valor, String mensaje) {
        this.valor = valor;
        this.mensaje = mensaje;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
