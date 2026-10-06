package com.fastgo.service;

import com.fastgo.dto.CrearOfertaRequest;
import com.fastgo.dto.EncomiendaResponseDTO;
import com.fastgo.dto.OfertaEncomiendaResponseDTO;
import com.fastgo.entity.Encomienda;
import com.fastgo.entity.OfertaEncomienda;
import com.fastgo.entity.Usuario;
import com.fastgo.repository.EncomiendaRepository;
import com.fastgo.repository.OfertaEncomiendaRepository;
import com.fastgo.repository.UsuarioRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OfertaEncomiendaService {

    private final OfertaEncomiendaRepository ofertaEncomiendaRepository;
    private final EncomiendaRepository encomiendaRepository;
    private final UsuarioRepository usuarioRepository;

    public OfertaEncomiendaService(
            OfertaEncomiendaRepository ofertaEncomiendaRepository,
            EncomiendaRepository encomiendaRepository,
            UsuarioRepository usuarioRepository) {
        this.ofertaEncomiendaRepository = ofertaEncomiendaRepository;
        this.encomiendaRepository = encomiendaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public OfertaEncomiendaResponseDTO crearOferta(Integer encomiendaId, CrearOfertaRequest req) {
        Usuario domiciliario = usuarioAutenticado();
        validarRol(domiciliario, "DOMICILIARIO", "ADMIN");

        Encomienda encomienda = encomiendaRepository.findById(encomiendaId)
                .orElseThrow(() -> new IllegalArgumentException("Encomienda #" + encomiendaId + " no encontrada"));

        String estadoEncomienda = encomienda.getEstado();
        if (!"PENDIENTE".equalsIgnoreCase(estadoEncomienda) && !"OFERTA".equalsIgnoreCase(estadoEncomienda)) {
            throw new IllegalStateException("No se pueden hacer ofertas a una encomienda en estado: " + estadoEncomienda);
        }

        // Si ya tiene una oferta PENDIENTE para esta encomienda, se actualiza el valor y mensaje
        Optional<OfertaEncomienda> ofertaExistente = ofertaEncomiendaRepository
                .findByEncomiendaIdAndDomiciliarioIdAndEstado(encomiendaId, domiciliario.getId(), "PENDIENTE");

        OfertaEncomienda oferta;
        if (ofertaExistente.isPresent()) {
            oferta = ofertaExistente.get();
            oferta.setValor(req.getValor());
            oferta.setMensaje(req.getMensaje());
            oferta.setActualizadoEn(LocalDateTime.now());
        } else {
            oferta = new OfertaEncomienda();
            oferta.setEncomienda(encomienda);
            oferta.setDomiciliario(domiciliario);
            oferta.setValor(req.getValor());
            oferta.setMensaje(req.getMensaje());
            oferta.setEstado("PENDIENTE");
        }

        oferta = ofertaEncomiendaRepository.save(oferta);

        // Actualizar encomienda a estado OFERTA si estaba en PENDIENTE
        if ("PENDIENTE".equalsIgnoreCase(encomienda.getEstado())) {
            encomienda.setEstado("OFERTA");
            encomiendaRepository.save(encomienda);
        }

        return toDto(oferta);
    }

    @Transactional(readOnly = true)
    public List<OfertaEncomiendaResponseDTO> listarOfertasPorEncomienda(Integer encomiendaId) {
        Usuario usuario = usuarioAutenticado();
        Encomienda encomienda = encomiendaRepository.findById(encomiendaId)
                .orElseThrow(() -> new IllegalArgumentException("Encomienda #" + encomiendaId + " no encontrada"));

        validarAccesoOfertas(encomienda, usuario);

        return ofertaEncomiendaRepository.findByEncomiendaIdOrderByCreadoEnDesc(encomiendaId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public EncomiendaResponseDTO aceptarOferta(Integer encomiendaId, Integer ofertaId) {
        Usuario cliente = usuarioAutenticado();
        Encomienda encomienda = encomiendaRepository.findById(encomiendaId)
                .orElseThrow(() -> new IllegalArgumentException("Encomienda #" + encomiendaId + " no encontrada"));

        if (!cliente.getId().equals(encomienda.getClienteId()) && !esAdmin(cliente)) {
            throw new AccessDeniedException("Solo el remitente de la encomienda puede aceptar ofertas");
        }

        String estadoActual = encomienda.getEstado();
        if (!"PENDIENTE".equalsIgnoreCase(estadoActual) && !"OFERTA".equalsIgnoreCase(estadoActual)) {
            throw new IllegalStateException("La encomienda ya fue asignada o no está disponible (estado actual: " + estadoActual + ")");
        }

        OfertaEncomienda oferta = ofertaEncomiendaRepository.findById(ofertaId)
                .orElseThrow(() -> new IllegalArgumentException("Oferta #" + ofertaId + " no encontrada"));

        if (!oferta.getEncomienda().getId().equals(encomiendaId)) {
            throw new IllegalArgumentException("La oferta #" + ofertaId + " no pertenece a la encomienda #" + encomiendaId);
        }

        if (!"PENDIENTE".equalsIgnoreCase(oferta.getEstado())) {
            throw new IllegalStateException("La oferta #" + ofertaId + " no está en estado PENDIENTE (estado actual: " + oferta.getEstado() + ")");
        }

        // Asignación atómica y transaccional
        oferta.setEstado("ACEPTADA");
        ofertaEncomiendaRepository.save(oferta);

        encomienda.setDomiciliarioId(oferta.getDomiciliario().getId());
        encomienda.setCostoEnvio(oferta.getValor());
        encomienda.setEstado("ACEPTADA");
        Encomienda encomiendaGuardada = encomiendaRepository.save(encomienda);

        // Cancelar automáticamente todas las demás ofertas pendientes para esta encomienda
        ofertaEncomiendaRepository.cancelarOtrasOfertasPendientes(encomiendaId, ofertaId);

        return toEncomiendaDto(encomiendaGuardada);
    }

    @Transactional
    public OfertaEncomiendaResponseDTO rechazarOferta(Integer encomiendaId, Integer ofertaId) {
        Usuario cliente = usuarioAutenticado();
        Encomienda encomienda = encomiendaRepository.findById(encomiendaId)
                .orElseThrow(() -> new IllegalArgumentException("Encomienda #" + encomiendaId + " no encontrada"));

        if (!cliente.getId().equals(encomienda.getClienteId()) && !esAdmin(cliente)) {
            throw new AccessDeniedException("Solo el remitente puede rechazar ofertas");
        }

        OfertaEncomienda oferta = ofertaEncomiendaRepository.findById(ofertaId)
                .orElseThrow(() -> new IllegalArgumentException("Oferta #" + ofertaId + " no encontrada"));

        if (!"PENDIENTE".equalsIgnoreCase(oferta.getEstado())) {
            throw new IllegalStateException("Solo se pueden rechazar ofertas en estado PENDIENTE");
        }

        oferta.setEstado("RECHAZADA");
        oferta = ofertaEncomiendaRepository.save(oferta);

        // Si ya no quedan ofertas pendientes para esta encomienda, regresar a PENDIENTE
        long pendientesRestantes = ofertaEncomiendaRepository.countByEncomiendaIdAndEstado(encomiendaId, "PENDIENTE");
        if (pendientesRestantes == 0 && "OFERTA".equalsIgnoreCase(encomienda.getEstado())) {
            encomienda.setEstado("PENDIENTE");
            encomiendaRepository.save(encomienda);
        }

        return toDto(oferta);
    }

    @Transactional
    public OfertaEncomiendaResponseDTO cancelarOferta(Integer encomiendaId, Integer ofertaId) {
        Usuario domiciliario = usuarioAutenticado();
        OfertaEncomienda oferta = ofertaEncomiendaRepository.findById(ofertaId)
                .orElseThrow(() -> new IllegalArgumentException("Oferta #" + ofertaId + " no encontrada"));

        if (!domiciliario.getId().equals(oferta.getDomiciliario().getId()) && !esAdmin(domiciliario)) {
            throw new AccessDeniedException("Solo el domiciliario que creó la oferta puede cancelarla");
        }

        if (!"PENDIENTE".equalsIgnoreCase(oferta.getEstado())) {
            throw new IllegalStateException("Solo se pueden cancelar ofertas en estado PENDIENTE");
        }

        oferta.setEstado("CANCELADA");
        oferta = ofertaEncomiendaRepository.save(oferta);

        Encomienda encomienda = oferta.getEncomienda();
        long pendientesRestantes = ofertaEncomiendaRepository.countByEncomiendaIdAndEstado(encomiendaId, "PENDIENTE");
        if (pendientesRestantes == 0 && "OFERTA".equalsIgnoreCase(encomienda.getEstado())) {
            encomienda.setEstado("PENDIENTE");
            encomiendaRepository.save(encomienda);
        }

        return toDto(oferta);
    }

    @Transactional(readOnly = true)
    public List<OfertaEncomiendaResponseDTO> listarMisOfertas() {
        Usuario domiciliario = usuarioAutenticado();
        validarRol(domiciliario, "DOMICILIARIO", "ADMIN");

        return ofertaEncomiendaRepository.findByDomiciliarioIdOrderByCreadoEnDesc(domiciliario.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    private Usuario usuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new AccessDeniedException("Usuario no autenticado");
        }
        return usuarioRepository.findFirstByCorreo(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado no encontrado"));
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

    private void validarAccesoOfertas(Encomienda e, Usuario u) {
        if (esAdmin(u)) return;
        if (u.getId().equals(e.getClienteId())) return;
        if (u.getRol() != null && "DOMICILIARIO".equalsIgnoreCase(u.getRol().getNombre())) return;
        throw new AccessDeniedException("No tienes permiso para ver las ofertas de esta encomienda");
    }

    public OfertaEncomiendaResponseDTO toDto(OfertaEncomienda o) {
        String domiNombre = o.getDomiciliario() != null
                ? o.getDomiciliario().getNombre() + " " + o.getDomiciliario().getApellido()
                : null;
        String domiTel = o.getDomiciliario() != null ? o.getDomiciliario().getTelefono() : null;

        return new OfertaEncomiendaResponseDTO(
                o.getId(),
                o.getEncomienda().getId(),
                o.getDomiciliario().getId(),
                domiNombre,
                domiTel,
                o.getValor(),
                o.getMensaje(),
                o.getEstado(),
                o.getCreadoEn(),
                o.getActualizadoEn()
        );
    }

    public EncomiendaResponseDTO toEncomiendaDto(Encomienda e) {
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
        dto.setValorInicial(e.getValorInicial());
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

        long count = ofertaEncomiendaRepository.countByEncomiendaIdAndEstado(e.getId(), "PENDIENTE");
        dto.setNumeroOfertas((int) count);

        return dto;
    }
}
