package com.fastgo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OfertaEncomiendaResponseDTO {

    private Integer id;
    private Integer encomiendaId;
    private Integer domiciliarioId;
    private String domiciliarioNombre;
    private String domiciliarioTelefono;
    private BigDecimal valor;
    private String mensaje;
    private String estado;
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;

    public OfertaEncomiendaResponseDTO() {}

    public OfertaEncomiendaResponseDTO(Integer id, Integer encomiendaId, Integer domiciliarioId,
                                       String domiciliarioNombre, String domiciliarioTelefono,
                                       BigDecimal valor, String mensaje, String estado,
                                       LocalDateTime creadoEn, LocalDateTime actualizadoEn) {
        this.id = id;
        this.encomiendaId = encomiendaId;
        this.domiciliarioId = domiciliarioId;
        this.domiciliarioNombre = domiciliarioNombre;
        this.domiciliarioTelefono = domiciliarioTelefono;
        this.valor = valor;
        this.mensaje = mensaje;
        this.estado = estado;
        this.creadoEn = creadoEn;
        this.actualizadoEn = actualizadoEn;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getEncomiendaId() { return encomiendaId; }
    public void setEncomiendaId(Integer encomiendaId) { this.encomiendaId = encomiendaId; }

    public Integer getDomiciliarioId() { return domiciliarioId; }
    public void setDomiciliarioId(Integer domiciliarioId) { this.domiciliarioId = domiciliarioId; }

    public String getDomiciliarioNombre() { return domiciliarioNombre; }
    public void setDomiciliarioNombre(String domiciliarioNombre) { this.domiciliarioNombre = domiciliarioNombre; }

    public String getDomiciliarioTelefono() { return domiciliarioTelefono; }
    public void setDomiciliarioTelefono(String domiciliarioTelefono) { this.domiciliarioTelefono = domiciliarioTelefono; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }

    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}
