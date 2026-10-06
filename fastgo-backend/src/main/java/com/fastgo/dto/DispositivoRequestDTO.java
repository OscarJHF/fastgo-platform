package com.fastgo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DispositivoRequestDTO {

    @Size(max = 100)
    private String dispositivoId;

    @NotBlank(message = "La plataforma es requerida (ANDROID, WEB, IOS)")
    @Size(max = 20)
    private String plataforma;

    @NotBlank(message = "El pushToken es requerido")
    @Size(max = 500)
    private String pushToken;

    public DispositivoRequestDTO() {
    }

    public DispositivoRequestDTO(String dispositivoId, String plataforma, String pushToken) {
        this.dispositivoId = dispositivoId;
        this.plataforma = plataforma;
        this.pushToken = pushToken;
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
}
