package com.fastgo.service;

import com.fastgo.dto.ConfiguracionSuscripcionDTO;
import com.fastgo.dto.SuscripcionResponseDTO;
import com.fastgo.entity.AuditoriaAdmin;
import com.fastgo.entity.Comercio;
import com.fastgo.entity.ConfiguracionSuscripcion;
import com.fastgo.entity.Suscripcion;
import com.fastgo.repository.AuditoriaAdminRepository;
import com.fastgo.repository.ConfiguracionSuscripcionRepository;
import com.fastgo.repository.SuscripcionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Service
public class SuscripcionService {

    public static final ZoneId BOGOTA_ZONE = ZoneId.of("America/Bogota");

    private final SuscripcionRepository suscripcionRepository;
    private final ConfiguracionSuscripcionRepository configRepository;
    private final AuditoriaAdminRepository auditoriaRepository;

    public SuscripcionService(
            SuscripcionRepository suscripcionRepository,
            ConfiguracionSuscripcionRepository configRepository,
            AuditoriaAdminRepository auditoriaRepository) {
        this.suscripcionRepository = suscripcionRepository;
        this.configRepository = configRepository;
        this.auditoriaRepository = auditoriaRepository;
    }

    public ConfiguracionSuscripcion obtenerConfiguracion() {
        return configRepository.findGlobalConfig().orElseGet(() -> {
            ConfiguracionSuscripcion defaultCfg = new ConfiguracionSuscripcion();
            defaultCfg.setId(1);
            defaultCfg.setFreePrimaryStores(1);
            defaultCfg.setPrimaryFreePeriodMonths(6);
            defaultCfg.setPrimaryMonthlyPrice(new BigDecimal("20000.00"));
            defaultCfg.setAdditionalStoreActivationPrice(new BigDecimal("50000.00"));
            defaultCfg.setAdditionalStoreMonthlyPrice(new BigDecimal("30000.00"));
            defaultCfg.setAllowNewStores(true);
            defaultCfg.setActualizadoPor("SISTEMA");
            defaultCfg.setActualizadoEn(LocalDateTime.now(BOGOTA_ZONE));
            return configRepository.save(defaultCfg);
        });
    }

    public ConfiguracionSuscripcionDTO obtenerConfiguracionDTO() {
        ConfiguracionSuscripcion cfg = obtenerConfiguracion();
        ConfiguracionSuscripcionDTO dto = new ConfiguracionSuscripcionDTO();
        dto.setId(cfg.getId());
        dto.setFreePrimaryStores(cfg.getFreePrimaryStores());
        dto.setPrimaryFreePeriodMonths(cfg.getPrimaryFreePeriodMonths());
        dto.setPrimaryMonthlyPrice(cfg.getPrimaryMonthlyPrice());
        dto.setAdditionalStoreActivationPrice(cfg.getAdditionalStoreActivationPrice());
        dto.setAdditionalStoreMonthlyPrice(cfg.getAdditionalStoreMonthlyPrice());
        dto.setAllowNewStores(cfg.getAllowNewStores());
        dto.setActualizadoPor(cfg.getActualizadoPor());
        dto.setActualizadoEn(cfg.getActualizadoEn());
        return dto;
    }

    @Transactional
    public ConfiguracionSuscripcionDTO actualizarConfiguracion(ConfiguracionSuscripcionDTO nuevo, String adminCorreo) {
        ConfiguracionSuscripcion actual = obtenerConfiguracion();
        String valorAnterior = String.format("freePrimary=%d, months=%d, primaryPrice=%s, addActPrice=%s, addMonthlyPrice=%s, allowNew=%s",
                actual.getFreePrimaryStores(), actual.getPrimaryFreePeriodMonths(), actual.getPrimaryMonthlyPrice(),
                actual.getAdditionalStoreActivationPrice(), actual.getAdditionalStoreMonthlyPrice(), actual.getAllowNewStores());

        if (nuevo.getFreePrimaryStores() != null) actual.setFreePrimaryStores(nuevo.getFreePrimaryStores());
        if (nuevo.getPrimaryFreePeriodMonths() != null) actual.setPrimaryFreePeriodMonths(nuevo.getPrimaryFreePeriodMonths());
        if (nuevo.getPrimaryMonthlyPrice() != null) actual.setPrimaryMonthlyPrice(nuevo.getPrimaryMonthlyPrice());
        if (nuevo.getAdditionalStoreActivationPrice() != null) actual.setAdditionalStoreActivationPrice(nuevo.getAdditionalStoreActivationPrice());
        if (nuevo.getAdditionalStoreMonthlyPrice() != null) actual.setAdditionalStoreMonthlyPrice(nuevo.getAdditionalStoreMonthlyPrice());
        if (nuevo.getAllowNewStores() != null) actual.setAllowNewStores(nuevo.getAllowNewStores());
        actual.setActualizadoPor(adminCorreo != null ? adminCorreo : "ADMIN");
        actual.setActualizadoEn(LocalDateTime.now(BOGOTA_ZONE));

        ConfiguracionSuscripcion saved = configRepository.save(actual);

        String valorNuevo = String.format("freePrimary=%d, months=%d, primaryPrice=%s, addActPrice=%s, addMonthlyPrice=%s, allowNew=%s",
                saved.getFreePrimaryStores(), saved.getPrimaryFreePeriodMonths(), saved.getPrimaryMonthlyPrice(),
                saved.getAdditionalStoreActivationPrice(), saved.getAdditionalStoreMonthlyPrice(), saved.getAllowNewStores());

        auditoriaRepository.save(new AuditoriaAdmin(
                adminCorreo != null ? adminCorreo : "ADMIN",
                "ACTUALIZAR_CONFIGURACION_SUSCRIPCIONES",
                "CONFIGURACION",
                String.valueOf(saved.getId()),
                valorAnterior,
                valorNuevo,
                "Actualización de parámetros y tarifas globales de suscripciones"
        ));

        return obtenerConfiguracionDTO();
    }

    @Transactional
    public Suscripcion crearSuscripcionInicial(Comercio comercio, boolean esPrincipal, String creadoPor) {
        ConfiguracionSuscripcion config = obtenerConfiguracion();
        LocalDateTime ahora = LocalDateTime.now(BOGOTA_ZONE);

        Suscripcion sub = new Suscripcion();
        sub.setComercioId(comercio.getId());
        sub.setUsuarioId(comercio.getUsuario().getId());
        sub.setCreadoPor(creadoPor != null ? creadoPor : "SISTEMA");
        sub.setCreadoEn(ahora);
        sub.setActualizadoEn(ahora);

        if (esPrincipal) {
            sub.setTipoPlan("TIENDA_PRINCIPAL");
            sub.setEstado("GRATUITO");
            sub.setPeriodo("GRATUITO");
            sub.setFechaInicio(ahora);
            sub.setFechaFin(ahora.plusMonths(config.getPrimaryFreePeriodMonths()));
            sub.setMonto(BigDecimal.ZERO);
            sub.setReferenciaPago("PERIODO_GRATUITO_6_MESES");
            sub.setFechaPago(ahora);
        } else {
            sub.setTipoPlan("TIENDA_ADICIONAL");
            sub.setEstado("PENDIENTE_ACTIVACION");
            sub.setPeriodo("MENSUAL");
            sub.setFechaInicio(ahora);
            sub.setFechaFin(null);
            sub.setMonto(config.getAdditionalStoreActivationPrice());
            sub.setReferenciaPago(null);
        }

        return suscripcionRepository.save(sub);
    }

    public Optional<Suscripcion> obtenerUltimaSuscripcion(Integer comercioId) {
        return suscripcionRepository.findFirstByComercioIdOrderByCreadoEnDesc(comercioId);
    }

    public SuscripcionResponseDTO toDTO(Suscripcion sub) {
        if (sub == null) return null;
        SuscripcionResponseDTO dto = new SuscripcionResponseDTO();
        dto.setId(sub.getId());
        dto.setComercioId(sub.getComercioId());
        dto.setUsuarioId(sub.getUsuarioId());
        dto.setTipoPlan(sub.getTipoPlan());
        dto.setEstado(sub.getEstado());
        dto.setFechaInicio(sub.getFechaInicio());
        dto.setFechaFin(sub.getFechaFin());
        dto.setMonto(sub.getMonto());
        dto.setPeriodo(sub.getPeriodo());
        dto.setFechaPago(sub.getFechaPago());
        dto.setReferenciaPago(sub.getReferenciaPago());

        LocalDateTime ahora = LocalDateTime.now(BOGOTA_ZONE);
        boolean vencida = sub.getFechaFin() != null && ahora.isAfter(sub.getFechaFin());
        dto.setEsVencida(vencida);
        return dto;
    }

    @Transactional
    public Suscripcion activarTienda(Comercio comercio, String adminCorreo) {
        ConfiguracionSuscripcion config = obtenerConfiguracion();
        LocalDateTime ahora = LocalDateTime.now(BOGOTA_ZONE);

        Suscripcion sub = suscripcionRepository.findFirstByComercioIdOrderByCreadoEnDesc(comercio.getId())
                .orElseGet(() -> {
                    Suscripcion s = new Suscripcion();
                    s.setComercioId(comercio.getId());
                    s.setUsuarioId(comercio.getUsuario().getId());
                    s.setTipoPlan(Boolean.TRUE.equals(comercio.getEsPrincipal()) ? "TIENDA_PRINCIPAL" : "TIENDA_ADICIONAL");
                    return s;
                });

        sub.setEstado("ACTIVA");
        sub.setFechaInicio(ahora);
        sub.setFechaFin(ahora.plusMonths(1));
        sub.setFechaPago(ahora);
        sub.setReferenciaPago("ACTIVACION_MANUAL_ADMIN");
        sub.setActualizadoPor(adminCorreo != null ? adminCorreo : "ADMIN");
        sub.setActualizadoEn(ahora);
        if (sub.getMonto() == null || sub.getMonto().compareTo(BigDecimal.ZERO) == 0) {
            sub.setMonto(Boolean.TRUE.equals(comercio.getEsPrincipal()) ? config.getPrimaryMonthlyPrice() : config.getAdditionalStoreMonthlyPrice());
        }

        return suscripcionRepository.save(sub);
    }
}
