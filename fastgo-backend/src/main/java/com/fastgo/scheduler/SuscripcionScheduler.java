package com.fastgo.scheduler;

import com.fastgo.service.SuscripcionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SuscripcionScheduler {

    private static final Logger log = LoggerFactory.getLogger(SuscripcionScheduler.class);
    private final SuscripcionService suscripcionService;

    public SuscripcionScheduler(SuscripcionService suscripcionService) {
        this.suscripcionService = suscripcionService;
    }

    /**
     * Tarea programada diaria a las 02:00 AM (Zona horaria de Colombia America/Bogota).
     * Revisa todas las suscripciones activas/gratuitas cuya fecha de corte haya vencido
     * y las pasa a estado SUSPENDIDA_POR_MORA, desactivando la tienda para que no reciba pedidos ni aparezca en catálogo.
     */
    @Scheduled(cron = "0 0 2 * * *", zone = "America/Bogota")
    public void ejecutarCorteDiarioSuscripciones() {
        log.info("[CRON] Iniciando verificación automática de vencimientos de suscripciones...");
        try {
            int suspendidas = suscripcionService.verificarVencimientosSuscripciones();
            log.info("[CRON] Verificación de vencimientos completada. Tiendas suspendidas por mora: {}", suspendidas);
        } catch (Exception e) {
            log.error("[CRON] Error al ejecutar verificación de vencimientos de suscripciones: {}", e.getMessage(), e);
        }
    }
}
