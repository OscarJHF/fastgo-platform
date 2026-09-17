package com.fastgo.service;

import com.fastgo.dto.ActualizarEstadoEncomiendaRequest;
import com.fastgo.dto.CrearEncomiendaRequest;
import com.fastgo.dto.EncomiendaResponseDTO;
import com.fastgo.entity.Encomienda;
import com.fastgo.entity.Usuario;
import com.fastgo.repository.EncomiendaRepository;
import com.fastgo.repository.UsuarioRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class EncomiendaService {

    private final EncomiendaRepository encomiendaRepository;
    private final UsuarioRepository usuarioRepository;
    private final TarifaService tarifaService;

    public EncomiendaService(
            EncomiendaRepository encomiendaRepository,
            UsuarioRepository usuarioRepository,
            TarifaService tarifaService) {
        this.encomiendaRepository = encomiendaRepository;
        this.usuarioRepository = usuarioRepository;
        this.tarifaService = tarifaService;
    }

    @Transactional
    public EncomiendaResponseDTO crear(CrearEncomiendaRequest request) {
        Usuario usuario = usuarioAutenticado();

        if (Boolean.FALSE.equals(request.getTarifaAceptada())) {
            throw new IllegalArgumentException("El cliente debe aceptar la tarifa de entrega antes de crear el servicio");
        }

        BigDecimal distancia = request.getDistanciaKm();
        if (distancia == null || distancia.compareTo(BigDecimal.ZERO) <= 0) {
            if (request.getOrigenLat() != null && request.getOrigenLng() != null
                    && request.getDestinoLat() != null && request.getDestinoLng() != null) {
                distancia = tarifaService.calcularDistanciaHaversine(
                        request.getOrigenLat(), request.getOrigenLng(),
                        request.getDestinoLat(), request.getDestinoLng());
            } else {
                distancia = BigDecimal.ONE;
            }
        }

        BigDecimal costoEnvio = tarifaService.calcularTarifaPorDistancia(distancia);

        Encomienda encomienda = new Encomienda();
        encomienda.setClienteId(usuario.getId());
        encomienda.setRemitenteNombre(request.getRemitenteNombre().trim());
        encomienda.setRemitenteTelefono(request.getRemitenteTelefono().trim());
        encomienda.setDireccionOrigen(request.getDireccionOrigen().trim());
        encomienda.setOrigenLat(request.getOrigenLat());
        encomienda.setOrigenLng(request.getOrigenLng());

        encomienda.setDestinatarioNombre(request.getDestinatarioNombre().trim());
        encomienda.setDestinatarioTelefono(request.getDestinatarioTelefono().trim());
        encomienda.setDireccionDestino(request.getDireccionDestino().trim());
        encomienda.setDestinoLat(request.getDestinoLat());
        encomienda.setDestinoLng(request.getDestinoLng());

        encomienda.setDescripcion(request.getDescripcion().trim());
        encomienda.setTamanoPeso(request.getTamanoPeso());
        encomienda.setDistanciaKm(distancia);
        encomienda.setCostoEnvio(costoEnvio);
        encomienda.setTarifaAceptada(true);
        encomienda.setEstado("PENDIENTE");
        encomienda.setObservaciones(request.getObservaciones());

        return toDto(encomiendaRepository.save(encomienda));
    }

    public List<EncomiendaResponseDTO> listarMisEncomiendas() {
        Usuario usuario = usuarioAutenticado();
        return encomiendaRepository.findByClienteIdOrderByCreadoEnDesc(usuario.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<EncomiendaResponseDTO> listarDisponibles() {
        return encomiendaRepository.findByEstadoOrderByCreadoEnDesc("PENDIENTE")
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<EncomiendaResponseDTO> listarAsignadas() {
        Usuario usuario = usuarioAutenticado();
        return encomiendaRepository.findByDomiciliarioIdOrderByCreadoEnDesc(usuario.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    public EncomiendaResponseDTO obtenerPorId(Integer id) {
        Encomienda encomienda = encomiendaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Encomienda no encontrada"));
        validarAcceso(encomienda);
        return toDto(encomienda);
    }

    @Transactional
    public EncomiendaResponseDTO tomarEncomienda(Integer id) {
        Usuario domiciliario = usuarioAutenticado();
        validarRol(domiciliario, "DOMICILIARIO", "ADMIN");

        Encomienda encomienda = encomiendaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Encomienda no encontrada"));

        if (!"PENDIENTE".equalsIgnoreCase(encomienda.getEstado())) {
            throw new IllegalStateException("La encomienda ya no está disponible (estado actual: " + encomienda.getEstado() + ")");
        }

        encomienda.setDomiciliarioId(domiciliario.getId());
        encomienda.setEstado("ACEPTADA");

        return toDto(encomiendaRepository.save(encomienda));
    }

    @Transactional
    public EncomiendaResponseDTO actualizarEstado(Integer id, ActualizarEstadoEncomiendaRequest request) {
        Usuario usuario = usuarioAutenticado();
        validarRol(usuario, "DOMICILIARIO", "ADMIN");

        Encomienda encomienda = encomiendaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Encomienda no encontrada"));

        if (!usuario.getId().equals(encomienda.getDomiciliarioId()) && !esAdmin(usuario)) {
            throw new AccessDeniedException("Solo el domiciliario asignado o el administrador pueden actualizar el estado");
        }

        String nuevo = request.getEstado() != null ? request.getEstado().trim().toUpperCase() : "";
        String actual = encomienda.getEstado();

        // Validar transiciones legales: PENDIENTE -> ACEPTADA -> EN_RECOGIDA -> EN_CAMINO -> ENTREGADA
        boolean transicionValida = switch (actual) {
            case "PENDIENTE" -> "ACEPTADA".equals(nuevo) || "CANCELADA".equals(nuevo);
            case "ACEPTADA" -> "EN_RECOGIDA".equals(nuevo) || "EN_CAMINO".equals(nuevo) || "CANCELADA".equals(nuevo);
            case "EN_RECOGIDA" -> "EN_CAMINO".equals(nuevo) || "ENTREGADA".equals(nuevo);
            case "EN_CAMINO" -> "ENTREGADA".equals(nuevo);
            default -> false;
        };

        if (!transicionValida && !esAdmin(usuario)) {
            throw new IllegalArgumentException(String.format(
                    "Transición no permitida: %s -> %s. Estados permitidos: ACEPTADA -> EN_RECOGIDA -> EN_CAMINO -> ENTREGADA",
                    actual, nuevo));
        }

        encomienda.setEstado(nuevo);
        if (request.getObservaciones() != null) {
            encomienda.setObservaciones(request.getObservaciones());
        }

        return toDto(encomiendaRepository.save(encomienda));
    }

    @Transactional
    public EncomiendaResponseDTO cancelar(Integer id) {
        Usuario usuario = usuarioAutenticado();
        Encomienda encomienda = encomiendaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Encomienda no encontrada"));

        if (!usuario.getId().equals(encomienda.getClienteId()) && !esAdmin(usuario)) {
            throw new AccessDeniedException("No tienes permiso para cancelar esta encomienda");
        }

        if (!"PENDIENTE".equalsIgnoreCase(encomienda.getEstado())) {
            throw new IllegalStateException("No se puede cancelar una encomienda que ya ha sido tomada o procesada");
        }

        encomienda.setEstado("CANCELADA");
        return toDto(encomiendaRepository.save(encomienda));
    }

    private Usuario usuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new AccessDeniedException("Usuario no autenticado");
        }
        return usuarioRepository.findFirstByCorreo(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    private void validarAcceso(Encomienda e) {
        Usuario u = usuarioAutenticado();
        if (esAdmin(u)) return;
        if (u.getId().equals(e.getClienteId())) return;
        if (e.getDomiciliarioId() != null && u.getId().equals(e.getDomiciliarioId())) return;
        if ("PENDIENTE".equalsIgnoreCase(e.getEstado())) return; // Los domiciliarios pueden ver encomiendas pendientes
        throw new AccessDeniedException("Acceso no autorizado a la encomienda #" + e.getId());
    }

    private void validarRol(Usuario u, String... rolesPermitidos) {
        if (u.getRol() == null) throw new AccessDeniedException("Usuario sin rol asignado");
        String rol = u.getRol().getNombre().toUpperCase();
        for (String r : rolesPermitidos) {
            if (r.equalsIgnoreCase(rol)) return;
        }
        throw new AccessDeniedException("Rol " + rol + " no tiene permisos para esta acción");
    }

    private boolean esAdmin(Usuario u) {
        return u.getRol() != null && ("ADMIN".equalsIgnoreCase(u.getRol().getNombre()) || "ADMINISTRADOR".equalsIgnoreCase(u.getRol().getNombre()));
    }

    private EncomiendaResponseDTO toDto(Encomienda e) {
        EncomiendaResponseDTO dto = new EncomiendaResponseDTO();
        dto.setId(e.getId());
        dto.setClienteId(e.getClienteId());
        dto.setRemitenteNombre(e.getRemitenteNombre());
        dto.setRemitenteTelefono(e.getRemitenteTelefono());
        dto.setDireccionOrigen(e.getDireccionOrigen());
        dto.setOrigenLat(e.getOrigenLat());
        dto.setOrigenLng(e.getOrigenLng());

        dto.setDestinatarioNombre(e.getDestinatarioNombre());
        dto.setDestinatarioTelefono(e.getDestinatarioTelefono());
        dto.setDireccionDestino(e.getDireccionDestino());
        dto.setDestinoLat(e.getDestinoLat());
        dto.setDestinoLng(e.getDestinoLng());

        dto.setDescripcion(e.getDescripcion());
        dto.setTamanoPeso(e.getTamanoPeso());
        dto.setDistanciaKm(e.getDistanciaKm());
        dto.setCostoEnvio(e.getCostoEnvio());
        dto.setTarifaAceptada(e.getTarifaAceptada());
        dto.setDomiciliarioId(e.getDomiciliarioId());

        if (e.getDomiciliarioId() != null) {
            usuarioRepository.findById(e.getDomiciliarioId())
                    .ifPresent(d -> dto.setDomiciliarioNombre(d.getNombre() + " " + d.getApellido()));
        }

        dto.setEstado(e.getEstado());
        dto.setObservaciones(e.getObservaciones());
        dto.setCreadoEn(e.getCreadoEn());
        dto.setActualizadoEn(e.getActualizadoEn());
        return dto;
    }
}
