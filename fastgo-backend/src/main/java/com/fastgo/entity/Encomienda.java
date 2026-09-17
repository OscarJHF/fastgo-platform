package com.fastgo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "encomiendas")
public class Encomienda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "cliente_id", nullable = false)
    private Integer clienteId;

    @Column(name = "remitente_nombre", nullable = false, length = 100)
    private String remitenteNombre;

    @Column(name = "remitente_telefono", nullable = false, length = 20)
    private String remitenteTelefono;

    @Column(name = "direccion_origen", nullable = false, length = 255)
    private String direccionOrigen;

    @Column(name = "origen_lat", precision = 10, scale = 8)
    private BigDecimal origenLat;

    @Column(name = "origen_lng", precision = 11, scale = 8)
    private BigDecimal origenLng;

    @Column(name = "destinatario_nombre", nullable = false, length = 100)
    private String destinatarioNombre;

    @Column(name = "destinatario_telefono", nullable = false, length = 20)
    private String destinatarioTelefono;

    @Column(name = "direccion_destino", nullable = false, length = 255)
    private String direccionDestino;

    @Column(name = "destino_lat", precision = 10, scale = 8)
    private BigDecimal destinoLat;

    @Column(name = "destino_lng", precision = 11, scale = 8)
    private BigDecimal destinoLng;

    @Column(nullable = false, length = 255)
    private String descripcion;

    @Column(name = "tamano_peso", length = 50)
    private String tamanoPeso;

    @Column(name = "distancia_km", nullable = false, precision = 6, scale = 2)
    private BigDecimal distanciaKm;

    @Column(name = "costo_envio", nullable = false, precision = 12, scale = 2)
    private BigDecimal costoEnvio;

    @Column(name = "tarifa_aceptada")
    private Boolean tarifaAceptada;

    @Column(name = "domiciliario_id")
    private Integer domiciliarioId;

    @Column(nullable = false, length = 30)
    private String estado;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    public Encomienda() {}

    @PrePersist
    protected void alCrear() {
        LocalDateTime ahora = LocalDateTime.now();
        if (creadoEn == null) creadoEn = ahora;
        if (actualizadoEn == null) actualizadoEn = ahora;
        if (estado == null || estado.isBlank()) estado = "PENDIENTE";
        if (tarifaAceptada == null) tarifaAceptada = true;
    }

    @PreUpdate
    protected void alActualizar() {
        actualizadoEn = LocalDateTime.now();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }

    public String getRemitenteNombre() { return remitenteNombre; }
    public void setRemitenteNombre(String remitenteNombre) { this.remitenteNombre = remitenteNombre; }

    public String getRemitenteTelefono() { return remitenteTelefono; }
    public void setRemitenteTelefono(String remitenteTelefono) { this.remitenteTelefono = remitenteTelefono; }

    public String getDireccionOrigen() { return direccionOrigen; }
    public void setDireccionOrigen(String direccionOrigen) { this.direccionOrigen = direccionOrigen; }

    public BigDecimal getOrigenLat() { return origenLat; }
    public void setOrigenLat(BigDecimal origenLat) { this.origenLat = origenLat; }

    public BigDecimal getOrigenLng() { return origenLng; }
    public void setOrigenLng(BigDecimal origenLng) { this.origenLng = origenLng; }

    public String getDestinatarioNombre() { return destinatarioNombre; }
    public void setDestinatarioNombre(String destinatarioNombre) { this.destinatarioNombre = destinatarioNombre; }

    public String getDestinatarioTelefono() { return destinatarioTelefono; }
    public void setDestinatarioTelefono(String destinatarioTelefono) { this.destinatarioTelefono = destinatarioTelefono; }

    public String getDireccionDestino() { return direccionDestino; }
    public void setDireccionDestino(String direccionDestino) { this.direccionDestino = direccionDestino; }

    public BigDecimal getDestinoLat() { return destinoLat; }
    public void setDestinoLat(BigDecimal destinoLat) { this.destinoLat = destinoLat; }

    public BigDecimal getDestinoLng() { return destinoLng; }
    public void setDestinoLng(BigDecimal destinoLng) { this.destinoLng = destinoLng; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getTamanoPeso() { return tamanoPeso; }
    public void setTamanoPeso(String tamanoPeso) { this.tamanoPeso = tamanoPeso; }

    public BigDecimal getDistanciaKm() { return distanciaKm; }
    public void setDistanciaKm(BigDecimal distanciaKm) { this.distanciaKm = distanciaKm; }

    public BigDecimal getCostoEnvio() { return costoEnvio; }
    public void setCostoEnvio(BigDecimal costoEnvio) { this.costoEnvio = costoEnvio; }

    public Boolean getTarifaAceptada() { return tarifaAceptada; }
    public void setTarifaAceptada(Boolean tarifaAceptada) { this.tarifaAceptada = tarifaAceptada; }

    public Integer getDomiciliarioId() { return domiciliarioId; }
    public void setDomiciliarioId(Integer domiciliarioId) { this.domiciliarioId = domiciliarioId; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }

    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}
