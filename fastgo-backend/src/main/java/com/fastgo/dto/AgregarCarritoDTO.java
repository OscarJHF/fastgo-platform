package com.fastgo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class AgregarCarritoDTO {

    @NotNull(message = "El carrito es obligatorio")
    @Positive(message = "El carrito no es válido")
    private Integer carritoId;

    @NotNull(message = "El producto es obligatorio")
    @Positive(message = "El producto no es válido")
    private Integer productoId;

    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor que cero")
    @Max(value = 1000, message = "La cantidad máxima por operación es 1000")
    private Integer cantidad;

    public AgregarCarritoDTO() {}

    public Integer getCarritoId() { return carritoId; }
    public void setCarritoId(Integer carritoId) { this.carritoId = carritoId; }

    public Integer getProductoId() { return productoId; }
    public void setProductoId(Integer productoId) { this.productoId = productoId; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
}
