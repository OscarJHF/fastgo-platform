package com.fastgo.service;

import com.fastgo.dto.AnalyticsEventRequestDTO;
import com.fastgo.dto.AnalyticsMetricsResponseDTO;
import com.fastgo.entity.AnalyticsEvent;
import com.fastgo.entity.Usuario;
import com.fastgo.repository.AnalyticsEventRepository;
import com.fastgo.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AnalyticsService {

    private static final ZoneId COLOMBIA_ZONE = ZoneId.of("America/Bogota");
    private final AnalyticsEventRepository analyticsEventRepository;
    private final UsuarioRepository usuarioRepository;

    public AnalyticsService(
            AnalyticsEventRepository analyticsEventRepository,
            UsuarioRepository usuarioRepository) {
        this.analyticsEventRepository = analyticsEventRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public AnalyticsEvent registrarEvento(AnalyticsEventRequestDTO dto, HttpServletRequest request) {
        if (dto.getEventType() == null || dto.getEventType().isBlank()) {
            return null;
        }

        String eventType = dto.getEventType().trim().toUpperCase();

        // Idempotencia estricta para APP_FIRST_OPEN
        if ("APP_FIRST_OPEN".equals(eventType) && dto.getAnonymousId() != null && !dto.getAnonymousId().isBlank()) {
            if (analyticsEventRepository.existsByAnonymousIdAndEventType(dto.getAnonymousId().trim(), "APP_FIRST_OPEN")) {
                return null; // Ya registrado previamente para este dispositivo
            }
        }

        AnalyticsEvent event = new AnalyticsEvent();
        event.setEventType(eventType);
        event.setAnonymousId(dto.getAnonymousId() != null ? dto.getAnonymousId().trim() : null);
        event.setSessionId(dto.getSessionId() != null ? dto.getSessionId().trim() : null);
        
        String src = dto.getUtmSource();
        if (src == null || src.isBlank()) {
            src = dto.getReferrer();
        }
        event.setSource(src);
        event.setMedium(dto.getUtmMedium());
        event.setCampaign(dto.getUtmCampaign());
        event.setPagePath(dto.getPathOrScreen());
        event.setMetadataJson(dto.getMetadata());
        event.setCreatedAt(LocalDateTime.now(COLOMBIA_ZONE));

        // Determinar usuario autenticado si aplica
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
                usuarioRepository.findByCorreo(auth.getName()).ifPresent(u -> event.setUserId(u.getId()));
            }
        } catch (Exception ignored) {
        }

        try {
            return analyticsEventRepository.save(event);
        } catch (DataIntegrityViolationException ex) {
            // Manejo de carrera para índice único condicional de APP_FIRST_OPEN
            return null;
        }
    }

    @Transactional(readOnly = true)
    public AnalyticsMetricsResponseDTO obtenerMetricas(String periodoParam) {
        String periodo = (periodoParam == null || periodoParam.isBlank()) ? "7_DIAS" : periodoParam.trim().toUpperCase();
        if (periodo.equals("7") || periodo.equals("7D")) periodo = "7_DIAS";
        if (periodo.equals("30") || periodo.equals("30D")) periodo = "30_DIAS";

        LocalDate today = LocalDate.now(COLOMBIA_ZONE);
        LocalDateTime now = LocalDateTime.now(COLOMBIA_ZONE);
        LocalDateTime start;

        switch (periodo) {
            case "HOY":
                start = today.atStartOfDay();
                break;
            case "30_DIAS":
                start = today.minusDays(30).atStartOfDay();
                break;
            case "TODO":
                start = LocalDateTime.of(2025, 1, 1, 0, 0, 0);
                break;
            case "7_DIAS":
            default:
                periodo = "7_DIAS";
                start = today.minusDays(7).atStartOfDay();
                break;
        }

        List<AnalyticsEvent> eventos = periodo.equals("TODO")
                ? analyticsEventRepository.findAllByOrderByCreatedAtDesc()
                : analyticsEventRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, now);

        Map<String, Long> conteoPorTipo = new HashMap<>();
        Map<String, Map<String, Long>> tendenciaPorFecha = new TreeMap<>();
        Map<String, Long> fuentesConteo = new HashMap<>();

        for (AnalyticsEvent ev : eventos) {
            String tipo = ev.getEventType();
            conteoPorTipo.put(tipo, conteoPorTipo.getOrDefault(tipo, 0L) + 1);

            // Tendencias diarias
            if (ev.getCreatedAt() != null) {
                String fechaKey = ev.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE);
                tendenciaPorFecha.putIfAbsent(fechaKey, new HashMap<>());
                Map<String, Long> mapFecha = tendenciaPorFecha.get(fechaKey);
                mapFecha.put(tipo, mapFecha.getOrDefault(tipo, 0L) + 1);
            }

            // Fuentes de tráfico
            String fuente = ev.getSource();
            if (fuente != null && !fuente.isBlank()) {
                fuente = limpiarFuente(fuente);
                fuentesConteo.put(fuente, fuentesConteo.getOrDefault(fuente, 0L) + 1);
            } else {
                fuentesConteo.put("Directo / Orgánico", fuentesConteo.getOrDefault("Directo / Orgánico", 0L) + 1);
            }
        }

        long pageViews = conteoPorTipo.getOrDefault("PAGE_VIEW", 0L);
        long downloadPageViews = conteoPorTipo.getOrDefault("DOWNLOAD_PAGE_VIEW", 0L);
        long totalVisitas = pageViews + downloadPageViews;

        long descargas = conteoPorTipo.getOrDefault("APK_DOWNLOAD", 0L);
        long appFirstOpen = conteoPorTipo.getOrDefault("APP_FIRST_OPEN", 0L);
        long registros = conteoPorTipo.getOrDefault("REGISTER", 0L);
        long pedidos = conteoPorTipo.getOrDefault("ORDER_CREATED", 0L);
        long entregas = conteoPorTipo.getOrDefault("ORDER_DELIVERED", 0L);

        AnalyticsMetricsResponseDTO response = new AnalyticsMetricsResponseDTO();
        response.setVisitasTotales(totalVisitas);
        response.setDescargasIniciadas(downloadPageViews);
        response.setDescargasCompletadas(descargas);
        response.setAppPrimerasAperturas(appFirstOpen);
        response.setRegistrosTotales(registros);
        response.setPedidosCreados(pedidos);
        response.setPedidosEntregados(entregas);
        response.setPeriodo(periodo);
        response.setFechaInicio(start.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        response.setFechaFin(now.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        response.setZonaHoraria(COLOMBIA_ZONE.getId());

        // Embudo de conversión seguro (sin NaN ni Infinity)
        List<AnalyticsMetricsResponseDTO.EmbudoPasoDTO> embudo = new ArrayList<>();
        long paso1 = totalVisitas;
        long paso2 = registros;
        long paso3 = pedidos;
        long paso4 = entregas;

        embudo.add(new AnalyticsMetricsResponseDTO.EmbudoPasoDTO(
                "Visitas",
                paso1,
                100.0,
                100.0
        ));
        embudo.add(new AnalyticsMetricsResponseDTO.EmbudoPasoDTO(
                "Registros",
                paso2,
                calcularPorcentaje(paso2, paso1),
                calcularPorcentaje(paso2, paso1)
        ));
        embudo.add(new AnalyticsMetricsResponseDTO.EmbudoPasoDTO(
                "Pedidos Creados",
                paso3,
                calcularPorcentaje(paso3, paso2),
                calcularPorcentaje(paso3, paso1)
        ));
        embudo.add(new AnalyticsMetricsResponseDTO.EmbudoPasoDTO(
                "Pedidos Entregados",
                paso4,
                calcularPorcentaje(paso4, paso3),
                calcularPorcentaje(paso4, paso1)
        ));
        response.setEmbudo(embudo);

        // Tendencias diarias
        List<AnalyticsMetricsResponseDTO.TendenciaDiariaDTO> tendencias = new ArrayList<>();
        for (Map.Entry<String, Map<String, Long>> entry : tendenciaPorFecha.entrySet()) {
            Map<String, Long> m = entry.getValue();
            long v = m.getOrDefault("PAGE_VIEW", 0L) + m.getOrDefault("DOWNLOAD_PAGE_VIEW", 0L);
            long d = m.getOrDefault("APK_DOWNLOAD", 0L);
            long r = m.getOrDefault("REGISTER", 0L);
            long p = m.getOrDefault("ORDER_CREATED", 0L);
            tendencias.add(new AnalyticsMetricsResponseDTO.TendenciaDiariaDTO(entry.getKey(), v, d, r, p));
        }
        response.setTendencias(tendencias);

        // Fuentes de tráfico
        long totalEventosFuente = fuentesConteo.values().stream().mapToLong(Long::longValue).sum();
        List<AnalyticsMetricsResponseDTO.FuenteTraficoDTO> fuentes = new ArrayList<>();
        fuentesConteo.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(10)
                .forEach(e -> {
                    double pct = calcularPorcentaje(e.getValue(), totalEventosFuente);
                    fuentes.add(new AnalyticsMetricsResponseDTO.FuenteTraficoDTO(e.getKey(), e.getValue(), pct));
                });
        response.setFuentes(fuentes);

        return response;
    }

    @Transactional(readOnly = true)
    public String exportarCsv(String periodoParam) {
        String periodo = (periodoParam == null || periodoParam.isBlank()) ? "30_DIAS" : periodoParam.trim().toUpperCase();
        LocalDate today = LocalDate.now(COLOMBIA_ZONE);
        LocalDateTime now = LocalDateTime.now(COLOMBIA_ZONE);
        LocalDateTime start;
        switch (periodo) {
            case "HOY":
                start = today.atStartOfDay();
                break;
            case "7_DIAS":
                start = today.minusDays(7).atStartOfDay();
                break;
            case "TODO":
                start = LocalDateTime.of(2025, 1, 1, 0, 0, 0);
                break;
            case "30_DIAS":
            default:
                start = today.minusDays(30).atStartOfDay();
                break;
        }

        List<AnalyticsEvent> eventos = periodo.equals("TODO")
                ? analyticsEventRepository.findAllByOrderByCreatedAtDesc()
                : analyticsEventRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, now);

        StringBuilder sb = new StringBuilder();
        sb.append("id,event_type,anonymous_id,user_id,session_id,source,medium,campaign,page_path,created_at\n");

        for (AnalyticsEvent ev : eventos) {
            sb.append(ev.getId()).append(",");
            sb.append(escapeCsv(ev.getEventType())).append(",");
            sb.append(escapeCsv(ev.getAnonymousId())).append(",");
            sb.append(ev.getUserId() != null ? ev.getUserId() : "").append(",");
            sb.append(escapeCsv(ev.getSessionId())).append(",");
            sb.append(escapeCsv(ev.getSource())).append(",");
            sb.append(escapeCsv(ev.getMedium())).append(",");
            sb.append(escapeCsv(ev.getCampaign())).append(",");
            sb.append(escapeCsv(ev.getPagePath())).append(",");
            sb.append(ev.getCreatedAt() != null ? ev.getCreatedAt().toString() : "").append("\n");
        }

        return sb.toString();
    }

    private double calcularPorcentaje(long parte, long total) {
        if (total <= 0 || parte <= 0) return 0.0;
        double res = ((double) parte / total) * 100.0;
        if (Double.isNaN(res) || Double.isInfinite(res)) return 0.0;
        return Math.round(res * 100.0) / 100.0;
    }

    private String limpiarFuente(String raw) {
        if (raw == null) return "Desconocido";
        String s = raw.trim();
        if (s.startsWith("http://") || s.startsWith("https://")) {
            try {
                java.net.URI uri = new java.net.URI(s);
                String host = uri.getHost();
                return host != null ? host : s;
            } catch (Exception ignored) {
            }
        }
        return s;
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
