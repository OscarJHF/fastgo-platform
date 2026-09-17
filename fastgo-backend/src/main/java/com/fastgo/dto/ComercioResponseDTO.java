package com.fastgo.dto;

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
    private String metodosPago;
    private String horaApertura;
    private String horaCierre;
    private String diasAtencion;
    private Integer tiempoPreparacionMin;
    private Boolean pausaManual;
    private Boolean abierto;

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
}