package com.fastgo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_admin")
public class AuditoriaAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "admin_correo", nullable = false, length = 150)
    private String adminCorreo;

    @Column(name = "accion", nullable = false, length = 80)
    private String accion;

    @Column(name = "entidad", nullable = false, length = 50)
    private String entidad;

    @Column(name = "entidad_id", length = 50)
    private String entidadId;

    @Column(name = "valor_anterior", columnDefinition = "TEXT")
    private String valorAnterior;

    @Column(name = "valor_nuevo", columnDefinition = "TEXT")
    private String valorNuevo;

    @Column(name = "detalles", columnDefinition = "TEXT")
    private String detalles;

    @Column(name = "fecha")
    private LocalDateTime fecha;

    public AuditoriaAdmin() {
    }

    public AuditoriaAdmin(String adminCorreo, String accion, String entidad, String entidadId, String valorAnterior, String valorNuevo, String detalles) {
        this.adminCorreo = adminCorreo;
        this.accion = accion;
        this.entidad = entidad;
        this.entidadId = entidadId;
        this.valorAnterior = valorAnterior;
        this.valorNuevo = valorNuevo;
        this.detalles = detalles;
        this.fecha = LocalDateTime.now();
    }

    @PrePersist
    protected void alCrear() {
        if (fecha == null) fecha = LocalDateTime.now();
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
