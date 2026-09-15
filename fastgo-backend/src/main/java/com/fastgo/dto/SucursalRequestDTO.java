package com.fastgo.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class SucursalRequestDTO {
    @NotNull(message="El comercio es obligatorio") @Positive(message="El comercio no es válido")
    private Integer comercioId;
    @NotBlank(message="El nombre de la sucursal es obligatorio") @Size(max=120, message="El nombre no puede superar 120 caracteres")
    private String nombre;
    @NotBlank(message="La dirección de la sucursal es obligatoria") @Size(max=255, message="La dirección no puede superar 255 caracteres")
    private String direccion;
    @NotBlank(message="La ciudad es obligatoria") @Size(max=100, message="La ciudad no puede superar 100 caracteres")
    private String ciudad;
    @Size(max=100, message="El departamento no puede superar 100 caracteres") private String departamento;
    @Size(max=20, message="El teléfono no puede superar 20 caracteres") private String telefono;
    @DecimalMin(value="-90.0") @DecimalMax(value="90.0") private BigDecimal latitud;
    @DecimalMin(value="-180.0") @DecimalMax(value="180.0") private BigDecimal longitud;
    @DecimalMin(value="0.01", inclusive=true, message="El radio de entrega debe ser mayor que cero") @DecimalMax(value="999.99", message="El radio de entrega es demasiado grande") private BigDecimal radioEntregaKm;
    private Boolean abierta;
    public SucursalRequestDTO(){}
    public Integer getComercioId(){return comercioId;} public void setComercioId(Integer v){comercioId=v;}
    public String getNombre(){return nombre;} public void setNombre(String v){nombre=v;}
    public String getDireccion(){return direccion;} public void setDireccion(String v){direccion=v;}
    public String getCiudad(){return ciudad;} public void setCiudad(String v){ciudad=v;}
    public String getDepartamento(){return departamento;} public void setDepartamento(String v){departamento=v;}
    public String getTelefono(){return telefono;} public void setTelefono(String v){telefono=v;}
    public BigDecimal getLatitud(){return latitud;} public void setLatitud(BigDecimal v){latitud=v;}
    public BigDecimal getLongitud(){return longitud;} public void setLongitud(BigDecimal v){longitud=v;}
    public BigDecimal getRadioEntregaKm(){return radioEntregaKm;} public void setRadioEntregaKm(BigDecimal v){radioEntregaKm=v;}
    public Boolean getAbierta(){return abierta;} public void setAbierta(Boolean v){abierta=v;}
}
