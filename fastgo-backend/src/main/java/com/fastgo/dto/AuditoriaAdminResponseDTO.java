package com.fastgo.dto;

import java.time.LocalDateTime;

public class AuditoriaAdminResponseDTO {

    private Integer id;
    private String adminCorreo;
    private String accion;
    private String entidad;
    private String entidadId;
    private String valorAnterior;
    private String valorNuevo;
    private String detalles;
    private LocalDateTime fecha;

    public AuditoriaAdminResponseDTO() {
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getAdminCorreo() { return adminCorreo; }
    public void setAdminCorreo(String adminCorreo) { this.adminCorreo = adminCorreo; }

    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }

    public String getEntidad() { return entidad; }
    public void setEntidad(String entidad) { this.entidad = entidad; }

    public String getEntidadId() { return entidadId; }
    public void setEntidadId(String entidadId) { this.entidadId = entidadId; }

    public String getValorAnterior() { return valorAnterior; }
    public void setValorAnterior(String valorAnterior) { this.valorAnterior = valorAnterior; }

    public String getValorNuevo() { return valorNuevo; }
    public void setValorNuevo(String valorNuevo) { this.valorNuevo = valorNuevo; }

    public String getDetalles() { return detalles; }
    public void setDetalles(String detalles) { this.detalles = detalles; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
}
