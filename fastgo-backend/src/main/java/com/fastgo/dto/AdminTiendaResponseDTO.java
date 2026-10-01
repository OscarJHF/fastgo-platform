package com.fastgo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AdminTiendaResponseDTO {

    private Integer id;
    private String nombre;
    private String descripcion;
    private String telefono;
    private String direccion;
    private String ciudad;
    private Integer usuarioId;
    private String propietarioNombre;
    private String propietarioCorreo;
    private String propietarioTelefono;
    private Boolean esPrincipal;
    private String estado;
    private Boolean activo;
    private String tipoPlan;
    private String estadoSuscripcion;
    private String fechaCreacion;
    private String fechaInicioSuscripcion;
    private String fechaVencimiento;
    private BigDecimal montoSuscripcion;
    private String fechaUltimoPago;
    private String referenciaPago;

    public AdminTiendaResponseDTO() {
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public String getPropietarioNombre() { return propietarioNombre; }
    public void setPropietarioNombre(String propietarioNombre) { this.propietarioNombre = propietarioNombre; }

    public String getPropietarioCorreo() { return propietarioCorreo; }
    public void setPropietarioCorreo(String propietarioCorreo) { this.propietarioCorreo = propietarioCorreo; }

    public String getPropietarioTelefono() { return propietarioTelefono; }
    public void setPropietarioTelefono(String propietarioTelefono) { this.propietarioTelefono = propietarioTelefono; }

    public Boolean getEsPrincipal() { return esPrincipal; }
    public void setEsPrincipal(Boolean esPrincipal) { this.esPrincipal = esPrincipal; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public String getTipoPlan() { return tipoPlan; }
    public void setTipoPlan(String tipoPlan) { this.tipoPlan = tipoPlan; }

    public String getEstadoSuscripcion() { return estadoSuscripcion; }
    public void setEstadoSuscripcion(String estadoSuscripcion) { this.estadoSuscripcion = estadoSuscripcion; }

    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion != null ? fechaCreacion.toString() : null; }

    public String getFechaInicioSuscripcion() { return fechaInicioSuscripcion; }
    public void setFechaInicioSuscripcion(String fechaInicioSuscripcion) { this.fechaInicioSuscripcion = fechaInicioSuscripcion; }
    public void setFechaInicioSuscripcion(LocalDateTime fechaInicioSuscripcion) { this.fechaInicioSuscripcion = fechaInicioSuscripcion != null ? fechaInicioSuscripcion.toString() : null; }

    public String getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(String fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
    public void setFechaVencimiento(LocalDateTime fechaVencimiento) { this.fechaVencimiento = fechaVencimiento != null ? fechaVencimiento.toString() : null; }

    public BigDecimal getMontoSuscripcion() { return montoSuscripcion; }
    public void setMontoSuscripcion(BigDecimal montoSuscripcion) { this.montoSuscripcion = montoSuscripcion; }

    public String getFechaUltimoPago() { return fechaUltimoPago; }
    public void setFechaUltimoPago(String fechaUltimoPago) { this.fechaUltimoPago = fechaUltimoPago; }
    public void setFechaUltimoPago(LocalDateTime fechaUltimoPago) { this.fechaUltimoPago = fechaUltimoPago != null ? fechaUltimoPago.toString() : null; }

    public String getReferenciaPago() { return referenciaPago; }
    public void setReferenciaPago(String referenciaPago) { this.referenciaPago = referenciaPago; }
}
