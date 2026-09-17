package com.fastgo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comercios")
public class Comercio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id")
    private CategoriaComercio categoria;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 20)
    private String telefono;

    @Column(length = 150)
    private String correo;

    @Column(length = 255)
    private String logo;

    @Column(length = 255)
    private String banner;

    @Column(length = 30)
    private String nit;

    private Boolean activo;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    @Column(name = "metodos_pago", length = 255)
    private String metodosPago;

    @Column(name = "hora_apertura")
    private java.time.LocalTime horaApertura;

    @Column(name = "hora_cierre")
    private java.time.LocalTime horaCierre;

    @Column(name = "dias_atencion", length = 50)
    private String diasAtencion;

    @Column(name = "tiempo_preparacion_min")
    private Integer tiempoPreparacionMin;

    @Column(name = "pausa_manual")
    private Boolean pausaManual;

    public Comercio() {
    }

    @PrePersist
    protected void alCrear() {

        if (creadoEn == null) {
            creadoEn = LocalDateTime.now();
        }

        if (activo == null) {
            activo = true;
        }

        if (metodosPago == null) {
            metodosPago = "EFECTIVO,NEQUI,DAVIPLATA,TRANSFERENCIA";
        }

        if (horaApertura == null) {
            horaApertura = java.time.LocalTime.of(8, 0);
        }

        if (horaCierre == null) {
            horaCierre = java.time.LocalTime.of(22, 0);
        }

        if (diasAtencion == null) {
            diasAtencion = "1,2,3,4,5,6,7";
        }

        if (tiempoPreparacionMin == null) {
            tiempoPreparacionMin = 20;
        }

        if (pausaManual == null) {
            pausaManual = false;
        }
    }

    @PreUpdate
    protected void alActualizar() {
        actualizadoEn = LocalDateTime.now();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public CategoriaComercio getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaComercio categoria) {
        this.categoria = categoria;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public String getBanner() {
        return banner;
    }

    public void setBanner(String banner) {
        this.banner = banner;
    }

    public String getNit() {
        return nit;
    }

    public void setNit(String nit) {
        this.nit = nit;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(LocalDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }

    public LocalDateTime getActualizadoEn() {
        return actualizadoEn;
    }

    public void setActualizadoEn(LocalDateTime actualizadoEn) {
        this.actualizadoEn = actualizadoEn;
    }

    public String getMetodosPago() {
        return metodosPago;
    }

    public void setMetodosPago(String metodosPago) {
        this.metodosPago = metodosPago;
    }

    public java.time.LocalTime getHoraApertura() {
        return horaApertura;
    }

    public void setHoraApertura(java.time.LocalTime horaApertura) {
        this.horaApertura = horaApertura;
    }

    public java.time.LocalTime getHoraCierre() {
        return horaCierre;
    }

    public void setHoraCierre(java.time.LocalTime horaCierre) {
        this.horaCierre = horaCierre;
    }

    public String getDiasAtencion() {
        return diasAtencion;
    }

    public void setDiasAtencion(String diasAtencion) {
        this.diasAtencion = diasAtencion;
    }

    public Integer getTiempoPreparacionMin() {
        return tiempoPreparacionMin;
    }

    public void setTiempoPreparacionMin(Integer tiempoPreparacionMin) {
        this.tiempoPreparacionMin = tiempoPreparacionMin;
    }

    public Boolean getPausaManual() {
        return pausaManual;
    }

    public void setPausaManual(Boolean pausaManual) {
        this.pausaManual = pausaManual;
    }

    public boolean isAbierto() {
        if (Boolean.FALSE.equals(activo)) return false;
        if (Boolean.TRUE.equals(pausaManual)) return false;
        if (horaApertura == null || horaCierre == null) return true;

        java.time.ZonedDateTime now = java.time.ZonedDateTime.now(java.time.ZoneId.of("America/Bogota"));
        int currentDay = now.getDayOfWeek().getValue(); // 1 = Lunes ... 7 = Domingo
        if (diasAtencion != null && !diasAtencion.isBlank()) {
            String[] dias = diasAtencion.split(",");
            boolean diaPermitido = false;
            for (String d : dias) {
                if (d.trim().equals(String.valueOf(currentDay))) {
                    diaPermitido = true;
                    break;
                }
            }
            if (!diaPermitido) return false;
        }

        java.time.LocalTime currentTime = now.toLocalTime();
        if (horaApertura.isBefore(horaCierre) || horaApertura.equals(horaCierre)) {
            return !currentTime.isBefore(horaApertura) && !currentTime.isAfter(horaCierre);
        } else {
            return !currentTime.isBefore(horaApertura) || !currentTime.isAfter(horaCierre);
        }
    }

    public boolean aceptaMetodoPago(String metodo) {
        if (metodo == null || metodo.isBlank()) return false;
        if (metodosPago == null || metodosPago.isBlank()) return true;
        String clean = metodo.trim().toUpperCase();
        for (String m : metodosPago.split(",")) {
            if (m.trim().equalsIgnoreCase(clean)) return true;
        }
        return false;
    }
}