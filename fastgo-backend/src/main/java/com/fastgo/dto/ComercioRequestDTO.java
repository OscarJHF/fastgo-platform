package com.fastgo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class ComercioRequestDTO {
    @NotNull(message="La categoría es obligatoria") @Positive(message="La categoría no es válida")
    private Integer categoriaId;
    @NotBlank(message="El nombre del comercio es obligatorio") @Size(max=120, message="El nombre no puede superar 120 caracteres")
    private String nombre;
    @Size(max=5000, message="La descripción no puede superar 5000 caracteres")
    private String descripcion;
    @Size(max=20, message="El teléfono no puede superar 20 caracteres")
    private String telefono;
    @Email(message="El correo del comercio no tiene un formato válido") @Size(max=150, message="El correo no puede superar 150 caracteres")
    private String correo;
    @Size(max=255, message="El logo no puede superar 255 caracteres")
    private String logo;
    @Size(max=255, message="El banner no puede superar 255 caracteres")
    private String banner;
    @Size(max=30, message="El NIT no puede superar 30 caracteres")
    private String nit;
    private Boolean activo;
    private String metodosPago;
    private String horaApertura;
    private String horaCierre;
    private String diasAtencion;
    private Integer tiempoPreparacionMin;
    private Boolean pausaManual;

    public ComercioRequestDTO(){}
    public Integer getCategoriaId(){return categoriaId;} public void setCategoriaId(Integer v){categoriaId=v;}
    public String getNombre(){return nombre;} public void setNombre(String v){nombre=v;}
    public String getDescripcion(){return descripcion;} public void setDescripcion(String v){descripcion=v;}
    public String getTelefono(){return telefono;} public void setTelefono(String v){telefono=v;}
    public String getCorreo(){return correo;} public void setCorreo(String v){correo=v;}
    public String getLogo(){return logo;} public void setLogo(String v){logo=v;}
    public String getBanner(){return banner;} public void setBanner(String v){banner=v;}
    public String getNit(){return nit;} public void setNit(String v){nit=v;}
    public Boolean getActivo(){return activo;} public void setActivo(Boolean v){activo=v;}
    public String getMetodosPago(){return metodosPago;} public void setMetodosPago(String v){metodosPago=v;}
    public String getHoraApertura(){return horaApertura;} public void setHoraApertura(String v){horaApertura=v;}
    public String getHoraCierre(){return horaCierre;} public void setHoraCierre(String v){horaCierre=v;}
    public String getDiasAtencion(){return diasAtencion;} public void setDiasAtencion(String v){diasAtencion=v;}
    public Integer getTiempoPreparacionMin(){return tiempoPreparacionMin;} public void setTiempoPreparacionMin(Integer v){tiempoPreparacionMin=v;}
    public Boolean getPausaManual(){return pausaManual;} public void setPausaManual(Boolean v){pausaManual=v;}
}
