package com.fastgo.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${fastgo.frontend.url:https://fastgo-app.fastgo-frontend.workers.dev}")
    private String frontendUrl;

    @Value("${fastgo.mail.from:b9ffbe001@smtp-brevo.com}")
    private String mailFrom;

    @Value("${fastgo.mail.host:}")
    private String mailHost;

    @Value("${fastgo.mail.port:587}")
    private int mailPort;

    @Value("${fastgo.mail.username:}")
    private String mailUsername;

    @Value("${fastgo.mail.password:}")
    private String mailPassword;

    public void enviarCorreoRecuperacion(String destinatario, String nombre, String token) {
        String cleanFrontendUrl = frontendUrl != null ? frontendUrl.replaceAll("/+$", "") : "https://fastgo-app.fastgo-frontend.workers.dev";
        String resetUrl = cleanFrontendUrl + "/reset-password?token=" + token;

        log.info("[FASTGO MAIL] Generando instrucciones de recuperacion de contrasena para: {}", destinatario);

        if (mailHost != null && !mailHost.isBlank()) {
            try {
                log.info("[FASTGO MAIL] Conectando a servidor SMTP {} puerto {} para {}", mailHost, mailPort, destinatario);
                JavaMailSender mailSender = createMailSender();
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(mailFrom, "FASTGO Soporte");
                helper.setTo(destinatario);
                helper.setSubject("FASTGO — Recuperación de tu contraseña");

                String htmlContent = String.format("""
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
                      <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #059669; font-size: 28px; font-weight: 800; margin: 0;">FASTGO</h1>
                        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Tu comida y compras favoritas en minutos</p>
                      </div>
                      <div style="padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #edf2f7;">
                        <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin-top: 0;">Restablecimiento de Contraseña</h2>
                        <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hola%s,</p>
                        <p style="color: #334155; font-size: 14px; line-height: 1.6;">Recibimos una solicitud para restablecer la contraseña de tu cuenta FASTGO. Haz clic en el siguiente botón para definir una nueva clave:</p>
                        <div style="text-align: center; margin: 28px 0;">
                          <a href="%s" style="background-color: #059669; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block;">Restablecer mi Contraseña</a>
                        </div>
                        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">Este enlace es seguro, de un solo uso y expirará en <strong>60 minutos</strong>.<br>Si tú no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
                      </div>
                      <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
                        <p style="margin: 0;">© 2026 FASTGO Inc. Todos los derechos reservados.</p>
                      </div>
                    </div>
                    """,
                    nombre != null && !nombre.isBlank() ? " " + nombre : "",
                    resetUrl
                );

                helper.setText(htmlContent, true);
                mailSender.send(message);
                log.info("[FASTGO MAIL] Correo real enviado exitosamente hacia: {}", destinatario);
            } catch (Exception e) {
                log.error("[FASTGO MAIL] Error al despachar correo via SMTP hacia {}: {}", destinatario, e.getMessage());
            }
        } else {
            log.info("[FASTGO MAIL] Modo seguro sin SMTP externo: Enlace de recuperacion emitido para {}", destinatario);
        }
    }

    private JavaMailSender createMailSender() {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(mailHost);
        sender.setPort(mailPort);
        if (mailUsername != null && !mailUsername.isBlank()) {
            sender.setUsername(mailUsername);
        }
        if (mailPassword != null && !mailPassword.isBlank()) {
            sender.setPassword(mailPassword);
        }
        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", mailHost);
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");
        return sender;
    }
}
