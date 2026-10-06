package com.fastgo.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public class DispositivoResponseDTO {

    private Long id;
    private Integer usuarioId;
    private String dispositivoId;
    private String plataforma;
    private String pushToken;
    private Boolean activo;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime actualizadoEn;

    public DispositivoResponseDTO() {
    }

    public DispositivoResponseDTO(Long id, Integer usuarioId, String dispositivoId, String plataforma, String pushToken, Boolean activo, LocalDateTime actualizadoEn) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.dispositivoId = dispositivoId;
        this.plataforma = plataforma;
        this.pushToken = pushToken;
        this.activo = activo;
        this.actualizadoEn = actualizadoEn;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getDispositivoId() {
        return dispositivoId;
    }

    public void setDispositivoId(String dispositivoId) {
        this.dispositivoId = dispositivoId;
    }

    public String getPlataforma() {
        return plataforma;
    }

    public void setPlataforma(String plataforma) {
        this.plataforma = plataforma;
    }

    public String getPushToken() {
        return pushToken;
    }

    public void setPushToken(String pushToken) {
        this.pushToken = pushToken;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getActualizadoEn() {
        return actualizadoEn;
    }

    public void setActualizadoEn(LocalDateTime actualizadoEn) {
        this.actualizadoEn = actualizadoEn;
    }
}
