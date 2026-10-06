package com.fastgo.service;

import com.fastgo.dto.ConfiguracionSuscripcionDTO;
import com.fastgo.dto.SuscripcionResponseDTO;
import com.fastgo.entity.AuditoriaAdmin;
import com.fastgo.entity.Comercio;
import com.fastgo.entity.ConfiguracionSuscripcion;
import com.fastgo.entity.Suscripcion;
import com.fastgo.entity.Usuario;
import com.fastgo.repository.AuditoriaAdminRepository;
import com.fastgo.repository.ComercioRepository;
import com.fastgo.repository.ConfiguracionSuscripcionRepository;
import com.fastgo.repository.SuscripcionRepository;
import com.fastgo.util.FileValidationUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SuscripcionService {

    private static final Logger log = LoggerFactory.getLogger(SuscripcionService.class);
    public static final ZoneId BOGOTA_ZONE = ZoneId.of("America/Bogota");

    private final SuscripcionRepository suscripcionRepository;
    private final ConfiguracionSuscripcionRepository configRepository;
    private final AuditoriaAdminRepository auditoriaRepository;
    private final ComercioRepository comercioRepository;
    private final StorageService storageService;

    public SuscripcionService(
            SuscripcionRepository suscripcionRepository,
            ConfiguracionSuscripcionRepository configRepository,
            AuditoriaAdminRepository auditoriaRepository,
            ComercioRepository comercioRepository,
            StorageService storageService) {
        this.suscripcionRepository = suscripcionRepository;
        this.configRepository = configRepository;
        this.auditoriaRepository = auditoriaRepository;
        this.comercioRepository = comercioRepository;
        this.storageService = storageService;
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
            defaultCfg.setBancoNombre("Bancolombia");
            defaultCfg.setBancoTipoCuenta("Ahorros");
            defaultCfg.setBancoNumeroCuenta("123-456789-00");
            defaultCfg.setBancoTitular("FastGo S.A.S.");
            defaultCfg.setBancoDocumento("NIT 901.888.777-1");
            defaultCfg.setInstruccionesPago("Realiza la transferencia desde Bancolombia o Nequi y adjunta el comprobante para la verificaciÃ³n administrativa.");
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
        dto.setBancoNombre(cfg.getBancoNombre() != null ? cfg.getBancoNombre() : "Bancolombia");
        dto.setBancoTipoCuenta(cfg.getBancoTipoCuenta() != null ? cfg.getBancoTipoCuenta() : "Ahorros");
        dto.setBancoNumeroCuenta(cfg.getBancoNumeroCuenta() != null ? cfg.getBancoNumeroCuenta() : "123-456789-00");
        dto.setBancoTitular(cfg.getBancoTitular() != null ? cfg.getBancoTitular() : "FastGo S.A.S.");
        dto.setBancoDocumento(cfg.getBancoDocumento() != null ? cfg.getBancoDocumento() : "NIT 901.888.777-1");
        dto.setInstruccionesPago(cfg.getInstruccionesPago() != null ? cfg.getInstruccionesPago() : "Realiza la transferencia desde Bancolombia o Nequi y adjunta el comprobante para la verificaciÃ³n administrativa.");
        dto.setActualizadoPor(cfg.getActualizadoPor());
        dto.setActualizadoEn(cfg.getActualizadoEn());
        return dto;
    }

    @Transactional
    public ConfiguracionSuscripcionDTO actualizarConfiguracion(ConfiguracionSuscripcionDTO nuevo, String adminCorreo) {
        ConfiguracionSuscripcion actual = obtenerConfiguracion();
        String valorAnterior = String.format("freePrimary=%d, months=%d, primaryPrice=%s, addActPrice=%s, addMonthlyPrice=%s, allowNew=%s, banco=%s, cuenta=%s",
                actual.getFreePrimaryStores(), actual.getPrimaryFreePeriodMonths(), actual.getPrimaryMonthlyPrice(),
                actual.getAdditionalStoreActivationPrice(), actual.getAdditionalStoreMonthlyPrice(), actual.getAllowNewStores(),
                actual.getBancoNombre(), actual.getBancoNumeroCuenta());

        if (nuevo.getFreePrimaryStores() != null) actual.setFreePrimaryStores(nuevo.getFreePrimaryStores());
        if (nuevo.getPrimaryFreePeriodMonths() != null) actual.setPrimaryFreePeriodMonths(nuevo.getPrimaryFreePeriodMonths());
        if (nuevo.getPrimaryMonthlyPrice() != null) actual.setPrimaryMonthlyPrice(nuevo.getPrimaryMonthlyPrice());
        if (nuevo.getAdditionalStoreActivationPrice() != null) actual.setAdditionalStoreActivationPrice(nuevo.getAdditionalStoreActivationPrice());
        if (nuevo.getAdditionalStoreMonthlyPrice() != null) actual.setAdditionalStoreMonthlyPrice(nuevo.getAdditionalStoreMonthlyPrice());
        if (nuevo.getAllowNewStores() != null) actual.setAllowNewStores(nuevo.getAllowNewStores());
        if (nuevo.getBancoNombre() != null && !nuevo.getBancoNombre().isBlank()) actual.setBancoNombre(nuevo.getBancoNombre().trim());
        if (nuevo.getBancoTipoCuenta() != null && !nuevo.getBancoTipoCuenta().isBlank()) actual.setBancoTipoCuenta(nuevo.getBancoTipoCuenta().trim());
        if (nuevo.getBancoNumeroCuenta() != null && !nuevo.getBancoNumeroCuenta().isBlank()) actual.setBancoNumeroCuenta(nuevo.getBancoNumeroCuenta().trim());
        if (nuevo.getBancoTitular() != null && !nuevo.getBancoTitular().isBlank()) actual.setBancoTitular(nuevo.getBancoTitular().trim());
        if (nuevo.getBancoDocumento() != null && !nuevo.getBancoDocumento().isBlank()) actual.setBancoDocumento(nuevo.getBancoDocumento().trim());
        if (nuevo.getInstruccionesPago() != null && !nuevo.getInstruccionesPago().isBlank()) actual.setInstruccionesPago(nuevo.getInstruccionesPago().trim());

        actual.setActualizadoPor(adminCorreo != null ? adminCorreo : "ADMIN");
        actual.setActualizadoEn(LocalDateTime.now(BOGOTA_ZONE));

        ConfiguracionSuscripcion saved = configRepository.save(actual);

        String valorNuevo = String.format("freePrimary=%d, months=%d, primaryPrice=%s, addActPrice=%s, addMonthlyPrice=%s, allowNew=%s, banco=%s, cuenta=%s",
                saved.getFreePrimaryStores(), saved.getPrimaryFreePeriodMonths(), saved.getPrimaryMonthlyPrice(),
                saved.getAdditionalStoreActivationPrice(), saved.getAdditionalStoreMonthlyPrice(), saved.getAllowNewStores(),
                saved.getBancoNombre(), saved.getBancoNumeroCuenta());

        auditoriaRepository.save(new AuditoriaAdmin(
                adminCorreo != null ? adminCorreo : "ADMIN",
                "ACTUALIZAR_CONFIGURACION_SUSCRIPCIONES",
                "CONFIGURACION",
                String.valueOf(saved.getId()),
                valorAnterior,
                valorNuevo,
                "ActualizaciÃ³n de parÃ¡metros, tarifas globales y cuentas de recaudo FASTGO"
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
        ConfiguracionSuscripcion cfg = obtenerConfiguracion();
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
        dto.setComprobanteUrl(sub.getComprobanteUrl());
        dto.setComprobanteKey(sub.getComprobanteKey());
        dto.setMotivoRechazo(sub.getMotivoRechazo());
        dto.setRevisadoPor(sub.getRevisadoPor());
        dto.setRevisadoEn(sub.getRevisadoEn());

        // Nombre del comercio
        comercioRepository.findById(sub.getComercioId()).ifPresent(c -> dto.setComercioNombre(c.getNombre()));

        // CÃ¡lculo de dÃ­as restantes y alerta de 3 dÃ­as
        LocalDateTime ahora = LocalDateTime.now(BOGOTA_ZONE);
        boolean vencida = false;
        Long diasRestantes = null;
        Boolean alertaVencimiento = false;

        if (sub.getFechaFin() != null) {
            vencida = ahora.isAfter(sub.getFechaFin());
            long dias = ChronoUnit.DAYS.between(ahora.toLocalDate(), sub.getFechaFin().toLocalDate());
            diasRestantes = dias;
            if (dias >= 0 && dias <= 3 && ("ACTIVA".equalsIgnoreCase(sub.getEstado()) || "GRATUITO".equalsIgnoreCase(sub.getEstado()))) {
                alertaVencimiento = true;
            }
        }

        dto.setEsVencida(vencida);
        dto.setDiasRestantes(diasRestantes);
        dto.setAlertaVencimiento(alertaVencimiento);

        // Datos bancarios oficiales de FASTGO
        dto.setBancoNombre(cfg.getBancoNombre() != null ? cfg.getBancoNombre() : "Bancolombia");
        dto.setBancoTipoCuenta(cfg.getBancoTipoCuenta() != null ? cfg.getBancoTipoCuenta() : "Ahorros");
        dto.setBancoNumeroCuenta(cfg.getBancoNumeroCuenta() != null ? cfg.getBancoNumeroCuenta() : "123-456789-00");
        dto.setBancoTitular(cfg.getBancoTitular() != null ? cfg.getBancoTitular() : "FastGo S.A.S.");
        dto.setBancoDocumento(cfg.getBancoDocumento() != null ? cfg.getBancoDocumento() : "NIT 901.888.777-1");
        dto.setInstruccionesPago(cfg.getInstruccionesPago() != null ? cfg.getInstruccionesPago() : "Realiza la transferencia desde Bancolombia o Nequi y adjunta el comprobante para la verificaciÃ³n administrativa.");

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

    @Transactional
    public SuscripcionResponseDTO subirComprobante(Integer comercioId, MultipartFile archivo, String referencia, Usuario remitente) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo del comprobante es obligatorio");
        }
        FileValidationUtils.validatePaymentProof(archivo);

        Comercio comercio = comercioRepository.findById(comercioId)
                .orElseThrow(() -> new IllegalArgumentException("Comercio no encontrado con ID: " + comercioId));

        if (!remitente.hasRole("ADMIN") && !comercio.getUsuario().getId().equals(remitente.getId())) {
            throw new SecurityException("No tienes permisos para subir comprobantes en esta tienda");
        }

        String extension = FileValidationUtils.getCleanExtension(archivo.getOriginalFilename());
        String filename = "sub_proof_store_" + comercioId + "_" + UUID.randomUUID() + "." + extension;

        try {
            storageService.storePrivateProof(archivo, filename);
        } catch (IOException e) {
            throw new RuntimeException("Error guardando comprobante privado: " + e.getMessage(), e);
        }

        LocalDateTime ahora = LocalDateTime.now(BOGOTA_ZONE);
        Suscripcion sub = suscripcionRepository.findFirstByComercioIdOrderByCreadoEnDesc(comercioId)
                .orElseGet(() -> {
                    Suscripcion s = new Suscripcion();
                    s.setComercioId(comercioId);
                    s.setUsuarioId(comercio.getUsuario().getId());
                    s.setTipoPlan(Boolean.TRUE.equals(comercio.getEsPrincipal()) ? "TIENDA_PRINCIPAL" : "TIENDA_ADICIONAL");
                    s.setMonto(Boolean.TRUE.equals(comercio.getEsPrincipal())
                            ? obtenerConfiguracion().getPrimaryMonthlyPrice()
                            : obtenerConfiguracion().getAdditionalStoreActivationPrice());
                    s.setCreadoEn(ahora);
                    s.setCreadoPor(remitente.getCorreo());
                    return s;
                });

        sub.setEstado("PENDIENTE_VERIFICACION");
        sub.setComprobanteUrl("/api/comercios/" + comercioId + "/suscripcion/comprobante");
        sub.setComprobanteKey("payment-proofs/" + filename);
        sub.setReferenciaPago(referencia != null && !referencia.isBlank() ? referencia.trim() : "TRANSFERENCIA");
        sub.setMotivoRechazo(null);
        sub.setActualizadoPor(remitente.getCorreo());
        sub.setActualizadoEn(ahora);

        Suscripcion savedSub = suscripcionRepository.save(sub);

        comercio.setEstado("PENDIENTE_VERIFICACION");
        comercioRepository.save(comercio);

        return toDTO(savedSub);
    }

    public Resource cargarComprobantePrivado(Integer comercioId, Usuario usuario) {
        Comercio comercio = comercioRepository.findById(comercioId)
                .orElseThrow(() -> new IllegalArgumentException("Comercio no encontrado con ID: " + comercioId));

        if (!usuario.hasRole("ADMIN") && !comercio.getUsuario().getId().equals(usuario.getId())) {
            throw new SecurityException("No tienes permisos para visualizar este comprobante");
        }

        Suscripcion sub = suscripcionRepository.findFirstByComercioIdOrderByCreadoEnDesc(comercioId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontrÃ³ suscripciÃ³n para el comercio"));

        if (sub.getComprobanteKey() == null && sub.getComprobanteUrl() == null) {
            throw new IllegalArgumentException("La tienda no tiene comprobante registrado");
        }

        String key = sub.getComprobanteKey() != null ? sub.getComprobanteKey() : sub.getComprobanteUrl();
        Resource res = storageService.loadPrivateProof(null, key);
        if (res == null || !res.exists()) {
            throw new IllegalArgumentException("El archivo fÃ­sico del comprobante no existe o no se pudo cargar");
        }
        return res;
    }

    public MediaType obtenerMediaTypeComprobante(Integer comercioId) {
        Suscripcion sub = suscripcionRepository.findFirstByComercioIdOrderByCreadoEnDesc(comercioId)
                .orElse(null);
        if (sub == null) return MediaType.APPLICATION_OCTET_STREAM;
        String key = sub.getComprobanteKey() != null ? sub.getComprobanteKey() : sub.getComprobanteUrl();
        return storageService.getPrivateProofMediaType(key);
    }

    public Resource cargarComprobantePorSuscripcion(Integer suscripcionId) {
        Suscripcion sub = suscripcionRepository.findById(suscripcionId)
                .orElseThrow(() -> new IllegalArgumentException("SuscripciÃ³n no encontrada con ID: " + suscripcionId));
        if (sub.getComprobanteKey() == null && sub.getComprobanteUrl() == null) {
            throw new IllegalArgumentException("La suscripciÃ³n no tiene comprobante registrado");
        }
        String key = sub.getComprobanteKey() != null ? sub.getComprobanteKey() : sub.getComprobanteUrl();
        Resource res = storageService.loadPrivateProof(null, key);
        if (res == null || !res.exists()) {
            throw new IllegalArgumentException("El archivo fÃ­sico del comprobante no existe o no se pudo cargar");
        }
        return res;
    }

    public MediaType obtenerMediaTypeComprobantePorSuscripcion(Integer suscripcionId) {
        Suscripcion sub = suscripcionRepository.findById(suscripcionId).orElse(null);
        if (sub == null) return MediaType.APPLICATION_OCTET_STREAM;
        String key = sub.getComprobanteKey() != null ? sub.getComprobanteKey() : sub.getComprobanteUrl();
        return storageService.getPrivateProofMediaType(key);
    }

    public List<SuscripcionResponseDTO> listarPendientesVerificacion() {
        return suscripcionRepository.findByEstadoOrderByCreadoEnDesc("PENDIENTE_VERIFICACION")
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public SuscripcionResponseDTO aprobarSuscripcionAdmin(Integer suscripcionId, String adminCorreo) {
        Suscripcion sub = suscripcionRepository.findById(suscripcionId)
                .orElseThrow(() -> new IllegalArgumentException("SuscripciÃ³n no encontrada con ID: " + suscripcionId));

        LocalDateTime ahora = LocalDateTime.now(BOGOTA_ZONE);
        String estadoAnterior = sub.getEstado();

        sub.setEstado("ACTIVA");
        sub.setFechaPago(ahora);
        sub.setRevisadoPor(adminCorreo != null ? adminCorreo : "ADMIN");
        sub.setRevisadoEn(ahora);
        sub.setActualizadoPor(adminCorreo != null ? adminCorreo : "ADMIN");
        sub.setActualizadoEn(ahora);

        // CÃ¡lculo idempotente del perÃ­odo
        if (sub.getFechaFin() != null && sub.getFechaFin().isAfter(ahora)) {
            // PagÃ³ antes del vencimiento: el nuevo perÃ­odo inicia cuando venza el actual
            sub.setFechaInicio(sub.getFechaFin());
            sub.setFechaFin(sub.getFechaFin().plusMonths(1));
        } else {
            // PagÃ³ vencido o activaciÃ³n inicial: el nuevo perÃ­odo arranca desde hoy
            sub.setFechaInicio(ahora);
            sub.setFechaFin(ahora.plusMonths(1));
        }

        Suscripcion savedSub = suscripcionRepository.save(sub);

        Comercio comercio = comercioRepository.findById(sub.getComercioId()).orElse(null);
        if (comercio != null) {
            comercio.setEstado("ACTIVA");
            comercio.setActivo(true);
            comercioRepository.save(comercio);
        }

        auditoriaRepository.save(new AuditoriaAdmin(
                adminCorreo != null ? adminCorreo : "ADMIN",
                "APROBAR_SUSCRIPCION",
                "SUSCRIPCION",
                String.valueOf(sub.getId()),
                estadoAnterior,
                "ACTIVA",
                "Comprobante verificado y aprobado. Tienda activada por 1 mes."
        ));

        return toDTO(savedSub);
    }

    @Transactional
    public SuscripcionResponseDTO rechazarSuscripcionAdmin(Integer suscripcionId, String motivo, String adminCorreo) {
        Suscripcion sub = suscripcionRepository.findById(suscripcionId)
                .orElseThrow(() -> new IllegalArgumentException("SuscripciÃ³n no encontrada con ID: " + suscripcionId));

        LocalDateTime ahora = LocalDateTime.now(BOGOTA_ZONE);
        String estadoAnterior = sub.getEstado();

        sub.setEstado("RECHAZADA");
        sub.setMotivoRechazo(motivo != null && !motivo.isBlank() ? motivo.trim() : "Comprobante rechazado por administraciÃ³n");
        sub.setRevisadoPor(adminCorreo != null ? adminCorreo : "ADMIN");
        sub.setRevisadoEn(ahora);
        sub.setActualizadoPor(adminCorreo != null ? adminCorreo : "ADMIN");
        sub.setActualizadoEn(ahora);

        Suscripcion savedSub = suscripcionRepository.save(sub);

        Comercio comercio = comercioRepository.findById(sub.getComercioId()).orElse(null);
        if (comercio != null) {
            comercio.setEstado("RECHAZADA");
            comercio.setActivo(false);
            comercioRepository.save(comercio);
        }

        auditoriaRepository.save(new AuditoriaAdmin(
                adminCorreo != null ? adminCorreo : "ADMIN",
                "RECHAZAR_SUSCRIPCION",
                "SUSCRIPCION",
                String.valueOf(sub.getId()),
                estadoAnterior,
                "RECHAZADA",
                "Motivo: " + sub.getMotivoRechazo()
        ));

        return toDTO(savedSub);
    }

    @Transactional
    public int verificarVencimientosSuscripciones() {
        LocalDateTime ahora = LocalDateTime.now(BOGOTA_ZONE);
        List<Suscripcion> activas = suscripcionRepository.findByEstadoIn(List.of("ACTIVA", "GRATUITO"));
        int suspendidas = 0;

        for (Suscripcion sub : activas) {
            if (sub.getFechaFin() != null && ahora.isAfter(sub.getFechaFin())) {
                sub.setEstado("SUSPENDIDA_POR_MORA");
                sub.setActualizadoEn(ahora);
                sub.setActualizadoPor("SISTEMA_VENCIMIENTOS");
                suscripcionRepository.save(sub);

                comercioRepository.findById(sub.getComercioId()).ifPresent(c -> {
                    c.setEstado("SUSPENDIDA_POR_MORA");
                    c.setActivo(false);
                    comercioRepository.save(c);
                });

                suspendidas++;
                log.info("Tienda ID {} suspendida por mora (venciÃ³ en {})", sub.getComercioId(), sub.getFechaFin());
            }
        }

        return suspendidas;
    }
}
