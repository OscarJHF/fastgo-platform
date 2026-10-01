package com.fastgo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
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

    @Column(name = "tarifa_domicilio", precision = 12, scale = 2)
    private BigDecimal tarifaDomicilio;

    @Column(name = "bancolombia_activo")
    private Boolean bancolombiaActivo;

    @Column(name = "bancolombia_tipo_cuenta", length = 20)
    private String bancolombiaTipoCuenta;

    @Column(name = "bancolombia_numero_cuenta", length = 50)
    private String bancolombiaNumeroCuenta;

    @Column(name = "bancolombia_titular", length = 150)
    private String bancolombiaTitular;

    @Column(name = "bancolombia_doc_titular", length = 50)
    private String bancolombiaDocTitular;

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

        if (tarifaDomicilio == null || tarifaDomicilio.compareTo(BigDecimal.valueOf(2000)) < 0) {
            tarifaDomicilio = BigDecimal.valueOf(2000);
        }

        if (bancolombiaActivo == null) {
            bancolombiaActivo = false;
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
        return isDentroDeHorario();
    }

    public boolean isDentroDeHorario() {
        if (horaApertura == null || horaCierre == null) return true;

        java.time.ZonedDateTime now = java.time.ZonedDateTime.now(java.time.ZoneId.of("America/Bogota"));
        int currentDay = now.getDayOfWeek().getValue(); // 1 = Lunes ... 7 = Domingo
        if (diasAtencion != null && !diasAtencion.isBlank()) {
            String diasLower = diasAtencion.toLowerCase().trim();
            if (diasLower.contains("todos") || diasLower.contains("lunes a domingo") || diasLower.equals("1,2,3,4,5,6,7")) {
                // Todos los días permitidos
            } else if (diasLower.contains("lunes a viernes")) {
                if (currentDay > 5) return false;
            } else if (diasLower.contains("lunes a sabado") || diasLower.contains("lunes a sábado")) {
                if (currentDay > 6) return false;
            } else {
                String[] dias = diasAtencion.split("[,;]");
                boolean diaPermitido = false;
                for (String d : dias) {
                    String dt = d.trim().toLowerCase();
                    if (dt.equals(String.valueOf(currentDay))) {
                        diaPermitido = true;
                        break;
                    }
                    if (currentDay == 1 && (dt.contains("lun") || dt.equals("1"))) diaPermitido = true;
                    if (currentDay == 2 && (dt.contains("mar") || dt.equals("2"))) diaPermitido = true;
                    if (currentDay == 3 && (dt.contains("mie") || dt.contains("mié") || dt.equals("3"))) diaPermitido = true;
                    if (currentDay == 4 && (dt.contains("jue") || dt.equals("4"))) diaPermitido = true;
                    if (currentDay == 5 && (dt.contains("vie") || dt.equals("5"))) diaPermitido = true;
                    if (currentDay == 6 && (dt.contains("sab") || dt.contains("sáb") || dt.equals("6"))) diaPermitido = true;
                    if (currentDay == 7 && (dt.contains("dom") || dt.equals("7"))) diaPermitido = true;
                }
                if (!diaPermitido) return false;
            }
        }

        java.time.LocalTime currentTime = now.toLocalTime();
        if (horaApertura.isBefore(horaCierre) || horaApertura.equals(horaCierre)) {
            return !currentTime.isBefore(horaApertura) && !currentTime.isAfter(horaCierre);
        } else {
            return !currentTime.isBefore(horaApertura) || !currentTime.isAfter(horaCierre);
        }
    }

    public String getMensajeEstado() {
        if (Boolean.FALSE.equals(activo)) return "Comercio inactivo";
        if (Boolean.TRUE.equals(pausaManual)) return "Cerrado temporalmente por el comercio";
        if (!isDentroDeHorario()) {
            return "Cerrado fuera de horario (Horario: " + 
                    (horaApertura != null ? horaApertura.toString() : "08:00") + " - " + 
                    (horaCierre != null ? horaCierre.toString() : "22:00") + ")";
        }
        return "Abierto";
    }

    public BigDecimal getTarifaDomicilio() {
        return tarifaDomicilio != null ? tarifaDomicilio : BigDecimal.valueOf(2000);
    }

    public void setTarifaDomicilio(BigDecimal tarifaDomicilio) {
        if (tarifaDomicilio != null && tarifaDomicilio.compareTo(BigDecimal.valueOf(2000)) < 0) {
            throw new IllegalArgumentException("La tarifa de domicilio mínima es de $2.000 COP");
        }
        this.tarifaDomicilio = tarifaDomicilio;
    }

    public Boolean getBancolombiaActivo() {
        return bancolombiaActivo;
    }

    public void setBancolombiaActivo(Boolean bancolombiaActivo) {
        this.bancolombiaActivo = bancolombiaActivo;
    }

    public String getBancolombiaTipoCuenta() {
        return bancolombiaTipoCuenta;
    }

    public void setBancolombiaTipoCuenta(String bancolombiaTipoCuenta) {
        this.bancolombiaTipoCuenta = bancolombiaTipoCuenta;
    }

    public String getBancolombiaNumeroCuenta() {
        return bancolombiaNumeroCuenta;
    }

    public void setBancolombiaNumeroCuenta(String bancolombiaNumeroCuenta) {
        this.bancolombiaNumeroCuenta = bancolombiaNumeroCuenta;
    }

    public String getBancolombiaTitular() {
        return bancolombiaTitular;
    }

    public void setBancolombiaTitular(String bancolombiaTitular) {
        this.bancolombiaTitular = bancolombiaTitular;
    }

    public String getBancolombiaDocTitular() {
        return bancolombiaDocTitular;
    }

    public void setBancolombiaDocTitular(String bancolombiaDocTitular) {
        this.bancolombiaDocTitular = bancolombiaDocTitular;
    }

    public boolean aceptaMetodoPago(String metodo) {
        if (metodo == null || metodo.isBlank()) return false;
        String clean = metodo.trim().toUpperCase();
        if (clean.equals("BANCOLOMBIA")) {
            return Boolean.TRUE.equals(bancolombiaActivo);
        }
        if (metodosPago == null || metodosPago.isBlank()) return true;
        for (String m : metodosPago.split(",")) {
            if (m.trim().equalsIgnoreCase(clean)) return true;
        }
        return false;
    }
}