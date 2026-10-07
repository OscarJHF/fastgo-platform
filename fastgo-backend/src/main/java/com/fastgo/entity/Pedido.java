package com.fastgo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "usuario_id", nullable = false)
    private Integer usuarioId;

    @Column(name = "sucursal_id", nullable = false)
    private Integer sucursalId;

    @Column(name = "direccion_id", nullable = false)
    private Integer direccionId;

    @Column(name = "domiciliario_id")
    private Integer domiciliarioId;

    @Column(nullable = false, length = 50)
    private String estado;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "costo_envio", nullable = false, precision = 12, scale = 2)
    private BigDecimal costoEnvio;

    @Column(name = "distancia_km", precision = 6, scale = 2)
    private BigDecimal distanciaKm;

    @Column(name = "tarifa_aceptada")
    private Boolean tarifaAceptada;

    @Column(name = "metodo_pago", length = 50)
    private String metodoPago;

    @Column(name = "estado_pago", length = 30)
    private String estadoPago;

    @Column(name = "comprobante_pago_url", length = 500)
    private String comprobantePagoUrl;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    public Pedido() {}

    @PrePersist
    protected void alCrear() {
        if (creadoEn == null) creadoEn = LocalDateTime.now();
        if (estado == null || estado.isBlank()) estado = "PENDIENTE";
        if (costoEnvio == null) costoEnvio = BigDecimal.valueOf(2000);
        if (tarifaAceptada == null) tarifaAceptada = true;
        if (metodoPago == null || metodoPago.isBlank()) metodoPago = "EFECTIVO";
        if (estadoPago == null || estadoPago.isBlank()) {
            if ("BANCOLOMBIA".equalsIgnoreCase(metodoPago)) {
                estadoPago = "PENDIENTE_VERIFICACION";
            } else {
                estadoPago = "APROBADO";
            }
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public Integer getDireccionId() { return direccionId; }
    public void setDireccionId(Integer direccionId) { this.direccionId = direccionId; }

    public Integer getDomiciliarioId() { return domiciliarioId; }
    public void setDomiciliarioId(Integer domiciliarioId) { this.domiciliarioId = domiciliarioId; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getCostoEnvio() { return costoEnvio; }
    public void setCostoEnvio(BigDecimal costoEnvio) { this.costoEnvio = costoEnvio; }

    public BigDecimal getDistanciaKm() { return distanciaKm; }
    public void setDistanciaKm(BigDecimal distanciaKm) { this.distanciaKm = distanciaKm; }

    public Boolean getTarifaAceptada() { return tarifaAceptada; }
    public void setTarifaAceptada(Boolean tarifaAceptada) { this.tarifaAceptada = tarifaAceptada; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public String getEstadoPago() { return estadoPago; }
    public void setEstadoPago(String estadoPago) { this.estadoPago = estadoPago; }

    public String getComprobantePagoUrl() { return comprobantePagoUrl; }
    public void setComprobantePagoUrl(String comprobantePagoUrl) { this.comprobantePagoUrl = comprobantePagoUrl; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }

    @Transient
    private String clienteNombre;

    @Transient
    private String clienteTelefono;

    @Transient
    private String direccionTexto;

    @Transient
    private String comercioNombre;

    @Transient
    private String comercioDireccion;

    @Transient
    private String sucursalNombre;

    @Transient
    private BigDecimal gananciaDomiciliario;

    @Transient
    private String destinoDireccion;

    @Transient
    private String destinoCiudad;

    @Transient
    private String destinoReferencia;

    @Transient
    private BigDecimal destinoLatitud;

    @Transient
    private BigDecimal destinoLongitud;

    @Transient
    private BigDecimal origenLatitud;

    @Transient
    private BigDecimal origenLongitud;

    @Transient
    private String origenTelefono;

    @Transient
    private String domiciliarioNombre;

    @Transient
    private String domiciliarioTelefono;

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public String getClienteTelefono() { return clienteTelefono; }
    public void setClienteTelefono(String clienteTelefono) { this.clienteTelefono = clienteTelefono; }

    public String getDireccionTexto() { return direccionTexto; }
    public void setDireccionTexto(String direccionTexto) { this.direccionTexto = direccionTexto; }

    public String getComercioNombre() { return comercioNombre; }
    public void setComercioNombre(String comercioNombre) { this.comercioNombre = comercioNombre; }

    public String getComercioDireccion() { return comercioDireccion; }
    public void setComercioDireccion(String comercioDireccion) { this.comercioDireccion = comercioDireccion; }

    public String getSucursalNombre() { return sucursalNombre; }
    public void setSucursalNombre(String sucursalNombre) { this.sucursalNombre = sucursalNombre; }

    public BigDecimal getGananciaDomiciliario() {
        return costoEnvio != null ? costoEnvio : BigDecimal.valueOf(2000);
    }
    public void setGananciaDomiciliario(BigDecimal gananciaDomiciliario) {
        this.gananciaDomiciliario = gananciaDomiciliario;
    }

    public String getDestinoDireccion() { return destinoDireccion; }
    public void setDestinoDireccion(String destinoDireccion) { this.destinoDireccion = destinoDireccion; }

    public String getDestinoCiudad() { return destinoCiudad; }
    public void setDestinoCiudad(String destinoCiudad) { this.destinoCiudad = destinoCiudad; }

    public String getDestinoReferencia() { return destinoReferencia; }
    public void setDestinoReferencia(String destinoReferencia) { this.destinoReferencia = destinoReferencia; }

    public BigDecimal getDestinoLatitud() { return destinoLatitud; }
    public void setDestinoLatitud(BigDecimal destinoLatitud) { this.destinoLatitud = destinoLatitud; }

    public BigDecimal getDestinoLongitud() { return destinoLongitud; }
    public void setDestinoLongitud(BigDecimal destinoLongitud) { this.destinoLongitud = destinoLongitud; }

    public BigDecimal getOrigenLatitud() { return origenLatitud; }
    public void setOrigenLatitud(BigDecimal origenLatitud) { this.origenLatitud = origenLatitud; }

    public BigDecimal getOrigenLongitud() { return origenLongitud; }
    public void setOrigenLongitud(BigDecimal origenLongitud) { this.origenLongitud = origenLongitud; }

    public String getOrigenTelefono() { return origenTelefono; }
    public void setOrigenTelefono(String origenTelefono) { this.origenTelefono = origenTelefono; }

    public String getDomiciliarioNombre() { return domiciliarioNombre; }
    public void setDomiciliarioNombre(String domiciliarioNombre) { this.domiciliarioNombre = domiciliarioNombre; }

    public String getDomiciliarioTelefono() { return domiciliarioTelefono; }
    public void setDomiciliarioTelefono(String domiciliarioTelefono) { this.domiciliarioTelefono = domiciliarioTelefono; }
}
