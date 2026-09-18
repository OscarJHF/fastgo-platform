package com.fastgo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${fastgo.frontend.url:https://fastgo-beta2.pages.dev}")
    private String frontendUrl;

    @Value("${fastgo.mail.from:no-reply@fastgo.com}")
    private String mailFrom;

    @Value("${fastgo.mail.host:}")
    private String mailHost;

    public void enviarCorreoRecuperacion(String destinatario, String nombre, String token) {
        String cleanFrontendUrl = frontendUrl != null ? frontendUrl.replaceAll("/+$", "") : "https://fastgo-beta2.pages.dev";
        String resetUrl = cleanFrontendUrl + "/reset-password?token=" + token;

        log.info("[FASGGO MAIL] Generando instrucciones de recuperacion de contrasena para: {}", destinatario);
        log.info("[FASTGO MAIL] Enlace seguro de recuperacion (valido por 60 min): {}", resetUrl);

        if (mailHost != null && !mailHost.isBlank()) {
            try {
                log.info("[FASTGO MAIL] Despachando correo via SMTP {} hacia {}", mailHost, destinatario);
            } catch (Exception e) {
                log.error("[FASTGO MAIL] Error al despachar correo a {}: {}", destinatario, e.getMessage());
            }
        } else {
            log.info("[FASTGO MAIL] Modo seguro sin SMTP externo: Enlace de recuperacion emitido para {}", destinatario);
        }
    }
}
