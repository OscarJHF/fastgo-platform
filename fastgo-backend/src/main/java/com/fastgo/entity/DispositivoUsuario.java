package com.fastgo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dispositivos_usuario")
public class DispositivoUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "dispositivo_id", length = 100)
    private String dispositivoId;

    @Column(name = "plataforma", nullable = false, length = 20)
    private String plataforma; // 'ANDROID', 'WEB', 'IOS'

    @Column(name = "push_token", nullable = false, length = 500)
    private String pushToken;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    public DispositivoUsuario() {
    }

    @PrePersist
    public void alCrear() {
        if (this.creadoEn == null) {
            this.creadoEn = LocalDateTime.now();
        }
        if (this.actualizadoEn == null) {
            this.actualizadoEn = LocalDateTime.now();
        }
        if (this.activo == null) {
            this.activo = true;
        }
    }

    @PreUpdate
    public void alActualizar() {
        this.actualizadoEn = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
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
}
