package com.fastgo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ComercioResponseDTO {

    private Integer id;
    private String nombre;
    private String descripcion;
    private String telefono;
    private String correo;
    private String logo;
    private String banner;
    private String nit;
    private Boolean activo;
    private String categoria;
    private Integer categoriaId;
    private String direccion;
    private String ciudad;
    private String departamentoId;
    private String departamentoNombre;
    private String municipioId;
    private String municipioNombre;
    private String metodosPago;
    private String horaApertura;
    private String horaCierre;
    private String diasAtencion;
    private Integer tiempoPreparacionMin;
    private Boolean pausaManual;
    private Boolean abierto;
    private Boolean dentroDeHorario;
    private String mensajeEstado;

    private BigDecimal tarifaDomicilio;
    private Boolean bancolombiaActivo;
    private String bancolombiaTipoCuenta;
    private String bancolombiaNumeroCuenta;
    private String bancolombiaTitular;
    private String bancolombiaDocTitular;

    private Boolean esPrincipal;
    private String estado;
    private Integer usuarioId;
    private String usuarioNombre;
    private String usuarioCorreo;
    private String creadoEn;
    private String fechaInicioSuscripcion;
    private String fechaFinSuscripcion;
    private String tipoPlan;
    private String estadoSuscripcion;
    private BigDecimal precioMensual;
    private BigDecimal precioActivacion;
    private Boolean esGratuito;
    private Long diasRestantes;
    private Boolean alertaVencimiento;
    private String comprobanteSuscripcionUrl;
    private String motivoRechazoSuscripcion;

    private String bancoNombre;
    private String bancoTipoCuenta;
    private String bancoNumeroCuenta;
    private String bancoTitular;
    private String bancoDocumento;
    private String instruccionesPago;
    private Boolean destacado;

    public ComercioResponseDTO() {
    }

    public ComercioResponseDTO(
            Integer id,
            String nombre,
            String descripcion,
            String telefono,
            String correo,
            String logo,
            String banner,
            String nit,
            Boolean activo,
            String categoria) {

        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.telefono = telefono;
        this.correo = correo;
        this.logo = logo;
        this.banner = banner;
        this.nit = nit;
        this.activo = activo;
        this.categoria = categoria;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getMetodosPago() { return metodosPago; }
    public void setMetodosPago(String metodosPago) { this.metodosPago = metodosPago; }

    public String getHoraApertura() { return horaApertura; }
    public void setHoraApertura(String horaApertura) { this.horaApertura = horaApertura; }

    public String getHoraCierre() { return horaCierre; }
    public void setHoraCierre(String horaCierre) { this.horaCierre = horaCierre; }

    public String getDiasAtencion() { return diasAtencion; }
    public void setDiasAtencion(String diasAtencion) { this.diasAtencion = diasAtencion; }

    public Integer getTiempoPreparacionMin() { return tiempoPreparacionMin; }
    public void setTiempoPreparacionMin(Integer tiempoPreparacionMin) { this.tiempoPreparacionMin = tiempoPreparacionMin; }

    public Boolean getPausaManual() { return pausaManual; }
    public void setPausaManual(Boolean pausaManual) { this.pausaManual = pausaManual; }

    public Boolean getAbierto() { return abierto; }
    public void setAbierto(Boolean abierto) { this.abierto = abierto; }

    public Integer getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Integer categoriaId) { this.categoriaId = categoriaId; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }

    public Boolean getDentroDeHorario() { return dentroDeHorario; }
    public void setDentroDeHorario(Boolean dentroDeHorario) { this.dentroDeHorario = dentroDeHorario; }

    public String getMensajeEstado() { return mensajeEstado; }
    public void setMensajeEstado(String mensajeEstado) { this.mensajeEstado = mensajeEstado; }

    public BigDecimal getTarifaDomicilio() { return tarifaDomicilio != null ? tarifaDomicilio : BigDecimal.valueOf(2000); }
    public void setTarifaDomicilio(BigDecimal tarifaDomicilio) { this.tarifaDomicilio = tarifaDomicilio; }

    public Boolean getBancolombiaActivo() { return bancolombiaActivo != null ? bancolombiaActivo : false; }
    public void setBancolombiaActivo(Boolean bancolombiaActivo) { this.bancolombiaActivo = bancolombiaActivo; }

    public String getBancolombiaTipoCuenta() { return bancolombiaTipoCuenta; }
    public void setBancolombiaTipoCuenta(String bancolombiaTipoCuenta) { this.bancolombiaTipoCuenta = bancolombiaTipoCuenta; }

    public String getBancolombiaNumeroCuenta() { return bancolombiaNumeroCuenta; }
    public void setBancolombiaNumeroCuenta(String bancolombiaNumeroCuenta) { this.bancolombiaNumeroCuenta = bancolombiaNumeroCuenta; }

    public String getBancolombiaTitular() { return bancolombiaTitular; }
    public void setBancolombiaTitular(String bancolombiaTitular) { this.bancolombiaTitular = bancolombiaTitular; }

    public String getBancolombiaDocTitular() { return bancolombiaDocTitular; }
    public void setBancolombiaDocTitular(String bancolombiaDocTitular) { this.bancolombiaDocTitular = bancolombiaDocTitular; }

    public Boolean getEsPrincipal() { return esPrincipal; }
    public void setEsPrincipal(Boolean esPrincipal) { this.esPrincipal = esPrincipal; }

    public String getEstado() { return estado != null ? estado : "ACTIVA"; }
    public void setEstado(String estado) { this.estado = estado; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public String getUsuarioNombre() { return usuarioNombre; }
    public void setUsuarioNombre(String usuarioNombre) { this.usuarioNombre = usuarioNombre; }

    public String getUsuarioCorreo() { return usuarioCorreo; }
    public void setUsuarioCorreo(String usuarioCorreo) { this.usuarioCorreo = usuarioCorreo; }

    public String getCreadoEn() { return creadoEn; }
    public void setCreadoEn(String creadoEn) { this.creadoEn = creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn != null ? creadoEn.toString() : null; }

    public String getFechaInicioSuscripcion() { return fechaInicioSuscripcion; }
    public void setFechaInicioSuscripcion(String fechaInicioSuscripcion) { this.fechaInicioSuscripcion = fechaInicioSuscripcion; }
    public void setFechaInicioSuscripcion(LocalDateTime fechaInicioSuscripcion) { this.fechaInicioSuscripcion = fechaInicioSuscripcion != null ? fechaInicioSuscripcion.toString() : null; }

    public String getFechaFinSuscripcion() { return fechaFinSuscripcion; }
    public void setFechaFinSuscripcion(String fechaFinSuscripcion) { this.fechaFinSuscripcion = fechaFinSuscripcion; }
    public void setFechaFinSuscripcion(LocalDateTime fechaFinSuscripcion) { this.fechaFinSuscripcion = fechaFinSuscripcion != null ? fechaFinSuscripcion.toString() : null; }

    public String getTipoPlan() { return tipoPlan; }
    public void setTipoPlan(String tipoPlan) { this.tipoPlan = tipoPlan; }

    public String getEstadoSuscripcion() { return estadoSuscripcion; }
    public void setEstadoSuscripcion(String estadoSuscripcion) { this.estadoSuscripcion = estadoSuscripcion; }

    public BigDecimal getPrecioMensual() { return precioMensual; }
    public void setPrecioMensual(BigDecimal precioMensual) { this.precioMensual = precioMensual; }

    public BigDecimal getPrecioActivacion() { return precioActivacion; }
    public void setPrecioActivacion(BigDecimal precioActivacion) { this.precioActivacion = precioActivacion; }

    public Boolean getEsGratuito() { return esGratuito; }
    public void setEsGratuito(Boolean esGratuito) { this.esGratuito = esGratuito; }

    public String getDepartamentoId() { return departamentoId; }
    public void setDepartamentoId(String departamentoId) { this.departamentoId = departamentoId; }

    public String getDepartamentoNombre() { return departamentoNombre; }
    public void setDepartamentoNombre(String departamentoNombre) { this.departamentoNombre = departamentoNombre; }

    public String getMunicipioId() { return municipioId; }
    public void setMunicipioId(String municipioId) { this.municipioId = municipioId; }

    public String getMunicipioNombre() { return municipioNombre; }
    public void setMunicipioNombre(String municipioNombre) { this.municipioNombre = municipioNombre; }

    public Long getDiasRestantes() { return diasRestantes; }
    public void setDiasRestantes(Long diasRestantes) { this.diasRestantes = diasRestantes; }

    public Boolean getAlertaVencimiento() { return alertaVencimiento; }
    public void setAlertaVencimiento(Boolean alertaVencimiento) { this.alertaVencimiento = alertaVencimiento; }

    public String getComprobanteSuscripcionUrl() { return comprobanteSuscripcionUrl; }
    public void setComprobanteSuscripcionUrl(String comprobanteSuscripcionUrl) { this.comprobanteSuscripcionUrl = comprobanteSuscripcionUrl; }

    public String getMotivoRechazoSuscripcion() { return motivoRechazoSuscripcion; }
    public void setMotivoRechazoSuscripcion(String motivoRechazoSuscripcion) { this.motivoRechazoSuscripcion = motivoRechazoSuscripcion; }

    public String getBancoNombre() { return bancoNombre; }
    public void setBancoNombre(String bancoNombre) { this.bancoNombre = bancoNombre; }

    public String getBancoTipoCuenta() { return bancoTipoCuenta; }
    public void setBancoTipoCuenta(String bancoTipoCuenta) { this.bancoTipoCuenta = bancoTipoCuenta; }

    public String getBancoNumeroCuenta() { return bancoNumeroCuenta; }
    public void setBancoNumeroCuenta(String bancoNumeroCuenta) { this.bancoNumeroCuenta = bancoNumeroCuenta; }

    public String getBancoTitular() { return bancoTitular; }
    public void setBancoTitular(String bancoTitular) { this.bancoTitular = bancoTitular; }

    public String getBancoDocumento() { return bancoDocumento; }
    public void setBancoDocumento(String bancoDocumento) { this.bancoDocumento = bancoDocumento; }

    public String getInstruccionesPago() { return instruccionesPago; }
    public void setInstruccionesPago(String instruccionesPago) { this.instruccionesPago = instruccionesPago; }

    public Boolean getDestacado() { return destacado; }
    public void setDestacado(Boolean destacado) { this.destacado = destacado; }
}