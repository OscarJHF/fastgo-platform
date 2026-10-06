package com.fastgo.service;

import com.fastgo.dto.TrackingResponseDTO;
import com.fastgo.dto.TrackingUbicacionRequest;
import com.fastgo.entity.*;
import com.fastgo.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TrackingService {

    private final SeguimientoPedidoRepository seguimientoRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SucursalRepository sucursalRepository;
    private final DireccionRepository direccionRepository;
    private final ComercioRepository comercioRepository;

    public TrackingService(
            SeguimientoPedidoRepository seguimientoRepository,
            PedidoRepository pedidoRepository,
            UsuarioRepository usuarioRepository,
            SucursalRepository sucursalRepository,
            DireccionRepository direccionRepository,
            ComercioRepository comercioRepository) {
        this.seguimientoRepository = seguimientoRepository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.sucursalRepository = sucursalRepository;
        this.direccionRepository = direccionRepository;
        this.comercioRepository = comercioRepository;
    }

    @Transactional
    public TrackingResponseDTO actualizarUbicacion(TrackingUbicacionRequest request) {
        if (request == null || request.getPedidoId() == null) {
            throw new IllegalArgumentException("Datos de seguimiento inválidos");
        }

        Usuario usuario = usuario();
        if (!"DOMICILIARIO".equalsIgnoreCase(rol(usuario))) {
            throw new SecurityException("Solo un domiciliario puede transmitir coordenadas de entrega");
        }

        Pedido pedido = pedidoRepository.findById(request.getPedidoId())
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (pedido.getDomiciliarioId() == null || !pedido.getDomiciliarioId().equals(usuario.getId())) {
            throw new SecurityException("No tienes permiso para actualizar la ubicación de un pedido que no te pertenece");
        }

        if (!"EN_CAMINO".equalsIgnoreCase(pedido.getEstado())) {
            throw new IllegalStateException("Solo se puede transmitir la ubicación mientras el pedido esté EN_CAMINO");
        }

        SeguimientoPedido seguimiento = seguimientoRepository.findByPedidoId(pedido.getId())
                .orElseGet(() -> new SeguimientoPedido(pedido.getId(), usuario.getId(), request.getLatitud(), request.getLongitud()));

        seguimiento.setLatitud(request.getLatitud());
        seguimiento.setLongitud(request.getLongitud());
        if (request.getPrecision() != null) seguimiento.setPrecision(request.getPrecision());
        if (request.getRumbo() != null) seguimiento.setRumbo(request.getRumbo());
        if (request.getVelocidad() != null) seguimiento.setVelocidad(request.getVelocidad());
        seguimiento.setActualizadoEn(LocalDateTime.now());
        seguimiento = seguimientoRepository.save(seguimiento);

        return mapearDTO(pedido, seguimiento);
    }

    @Transactional(readOnly = true)
    public TrackingResponseDTO obtenerTracking(Integer pedidoId) {
        if (pedidoId == null) throw new IllegalArgumentException("El id del pedido es obligatorio");

        Usuario usuario = usuario();
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        validarAccesoTracking(pedido, usuario);

        SeguimientoPedido seguimiento = seguimientoRepository.findByPedidoId(pedido.getId()).orElse(null);
        return mapearDTO(pedido, seguimiento);
    }

    private void validarAccesoTracking(Pedido pedido, Usuario usuario) {
        String rol = rol(usuario);
        if ("ADMIN".equalsIgnoreCase(rol)) return;

        if ("CLIENTE".equalsIgnoreCase(rol)) {
            if (pedido.getUsuarioId().equals(usuario.getId())) return;
        }

        if ("DOMICILIARIO".equalsIgnoreCase(rol)) {
            if (pedido.getDomiciliarioId() != null && pedido.getDomiciliarioId().equals(usuario.getId())) return;
        }

        if ("COMERCIO".equalsIgnoreCase(rol)) {
            Sucursal sucursal = sucursalRepository.findById(pedido.getSucursalId()).orElse(null);
            if (sucursal != null && sucursal.getComercioId() != null) {
                Comercio comercio = comercioRepository.findById(sucursal.getComercioId()).orElse(null);
                if (comercio != null && comercio.getUsuario() != null && comercio.getUsuario().getId().equals(usuario.getId())) {
                    return;
                }
            }
        }

        throw new SecurityException("No tienes permiso para consultar el seguimiento de este pedido");
    }

    private TrackingResponseDTO mapearDTO(Pedido pedido, SeguimientoPedido seguimiento) {
        TrackingResponseDTO dto = new TrackingResponseDTO();
        dto.setPedidoId(pedido.getId());
        dto.setDomiciliarioId(pedido.getDomiciliarioId());
        dto.setEstadoPedido(pedido.getEstado());
        dto.setActivo("EN_CAMINO".equalsIgnoreCase(pedido.getEstado()));

        if (seguimiento != null) {
            dto.setId(seguimiento.getId());
            dto.setLatitud(seguimiento.getLatitud());
            dto.setLongitud(seguimiento.getLongitud());
            dto.setPrecision(seguimiento.getPrecision());
            dto.setRumbo(seguimiento.getRumbo());
            dto.setVelocidad(seguimiento.getVelocidad());
            dto.setActualizadoEn(seguimiento.getActualizadoEn());
            dto.setFechaHora(seguimiento.getActualizadoEn() != null ? seguimiento.getActualizadoEn().toString() : null);
        }

        if (pedido.getSucursalId() != null) {
            sucursalRepository.findById(pedido.getSucursalId()).ifPresent(s -> {
                dto.setOrigenLat(s.getLatitud());
                dto.setOrigenLng(s.getLongitud());
            });
        }

        if (pedido.getDireccionId() != null) {
            direccionRepository.findById(pedido.getDireccionId()).ifPresent(d -> {
                dto.setDestinoLat(d.getLatitud());
                dto.setDestinoLng(d.getLongitud());
                dto.setDestinoDireccion(d.getDireccion());
                dto.setDestinoCiudad(d.getCiudad());
            });
        }

        return dto;
    }

    private Usuario usuario() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new RuntimeException("Usuario no autenticado");
        }
        return usuarioRepository.findByCorreo(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));
    }

    private String rol(Usuario u) {
        return u.getRol() == null ? "" : u.getRol().getNombre();
    }
}
