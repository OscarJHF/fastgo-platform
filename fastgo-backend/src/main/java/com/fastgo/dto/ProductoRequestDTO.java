package com.fastgo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class ProductoRequestDTO {
    @NotNull(message="La sucursal es obligatoria") @Positive(message="La sucursal no es válida")
    private Integer sucursalId;
    @NotNull(message="La categoría es obligatoria") @Positive(message="La categoría no es válida")
    private Integer categoriaId;
    @NotBlank(message="El nombre del producto es obligatorio") @Size(max=150, message="El nombre no puede superar 150 caracteres")
    private String nombre;
    @Size(max=2000, message="La descripción no puede superar 2000 caracteres")
    private String descripcion;
    @NotNull(message="El precio es obligatorio") @DecimalMin(value="0.01", inclusive=true, message="El precio debe ser mayor a cero")
    private BigDecimal precio;
    @Max(value=1440, message="El tiempo de preparación no puede superar 1440 minutos")
    private Integer tiempoPreparacion;
    @Size(max=255, message="La imagen no puede superar 255 caracteres")
    private String imagenPrincipal;
    private Boolean disponible, destacado;
    private Integer stock;
    public ProductoRequestDTO(){}
    public Integer getSucursalId(){return sucursalId;} public void setSucursalId(Integer v){sucursalId=v;}
    public Integer getCategoriaId(){return categoriaId;} public void setCategoriaId(Integer v){categoriaId=v;}
    public String getNombre(){return nombre;} public void setNombre(String v){nombre=v;}
    public String getDescripcion(){return descripcion;} public void setDescripcion(String v){descripcion=v;}
    public BigDecimal getPrecio(){return precio;} public void setPrecio(BigDecimal v){precio=v;}
    public Integer getTiempoPreparacion(){return tiempoPreparacion;} public void setTiempoPreparacion(Integer v){tiempoPreparacion=v;}
    public String getImagenPrincipal(){return imagenPrincipal;} public void setImagenPrincipal(String v){imagenPrincipal=v;}
    public Boolean getDisponible(){return disponible;} public void setDisponible(Boolean v){disponible=v;}
    public Boolean getDestacado(){return destacado;} public void setDestacado(Boolean v){destacado=v;}
    public Integer getStock(){return stock;} public void setStock(Integer v){stock=v;}
}
