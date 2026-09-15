package com.fastgo.service;

import com.fastgo.entity.Pago;
import com.fastgo.entity.Pedido;
import com.fastgo.entity.Usuario;
import com.fastgo.entity.Sucursal;
import com.fastgo.repository.PagoRepository;
import com.fastgo.repository.PedidoRepository;
import com.fastgo.repository.UsuarioRepository;
import com.fastgo.repository.SucursalRepository;
import com.fastgo.repository.ComercioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PagoService {

    private final PagoRepository pagoRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SucursalRepository sucursalRepository;
    private final ComercioRepository comercioRepository;

    public PagoService(
            PagoRepository pagoRepository,
            PedidoRepository pedidoRepository,
            UsuarioRepository usuarioRepository,
            SucursalRepository sucursalRepository,
            ComercioRepository comercioRepository) {
        this.pagoRepository = pagoRepository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.sucursalRepository = sucursalRepository;
        this.comercioRepository = comercioRepository;
    }

    public Pago registrarPago(
            Integer pedidoId,
            String metodo,
            String referencia) {

        Pedido pedido = pedido(pedidoId);
        Usuario usuario = usuario();

        if (!pedido.getUsuarioId().equals(usuario.getId())) {
            throw new RuntimeException(
                    "No tienes permiso para registrar un pago para este pedido");
        }

        if (pagoRepository
                .findFirstByPedidoIdOrderByIdDesc(pedidoId)
                .isPresent()) {
            throw new RuntimeException(
                    "El pedido ya tiene un pago registrado");
        }

        if (metodo == null || metodo.isBlank() || metodo.trim().length() > 50) {
            throw new IllegalArgumentException("El método de pago no es válido");
        }

        String metodoNormalizado = metodo.trim().toUpperCase();
        if (!List.of("EFECTIVO", "TARJETA", "PSE", "TRANSFERENCIA").contains(metodoNormalizado)) {
            throw new IllegalArgumentException("Método de pago no permitido");
        }

        if (referencia != null && referencia.length() > 150) {
            throw new IllegalArgumentException("La referencia de pago es demasiado larga");
        }

        Pago pago = new Pago();
        pago.setPedidoId(pedidoId);
        pago.setMetodo(metodoNormalizado);
        pago.setEstado("PENDIENTE");
        pago.setReferencia(referencia == null || referencia.isBlank() ? null : referencia.trim());
        pago.setFechaPago(LocalDateTime.now());

        return pagoRepository.save(pago);
    }

    public Pago obtenerPorId(Integer id) {
        Pago pago = pago(id);
        autorizarPedido(pago.getPedidoId());
        return pago;
    }

    public List<Pago> listarPorPedido(Integer pedidoId) {
        autorizarPedido(pedidoId);
        return pagoRepository.findByPedidoId(pedidoId);
    }

    public Pago actualizarEstado(
            Integer pagoId,
            String nuevoEstado) {

        Pago pago = pago(pagoId);
        Pedido pedido = pedido(pago.getPedidoId());
        Usuario usuario = usuario();

        if (!esComercioPropietario(pedido, usuario)) {
            throw new RuntimeException(
                    "No tienes permiso para actualizar este pago");
        }

        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            throw new RuntimeException(
                    "El estado es obligatorio");
        }

        nuevoEstado = nuevoEstado.trim().toUpperCase();

        if (!"PENDIENTE".equalsIgnoreCase(pago.getEstado())
                || !"CONFIRMADO".equals(nuevoEstado)) {
            throw new RuntimeException(
                    "Transición de estado no permitida: "
                            + pago.getEstado()
                            + " → "
                            + nuevoEstado);
        }

        pago.setEstado(nuevoEstado);
        pago.setFechaPago(LocalDateTime.now());

        return pagoRepository.save(pago);
    }

    private void autorizarPedido(Integer pedidoId) {
        Pedido pedido = pedido(pedidoId);
        Usuario usuario = usuario();

        boolean esClientePropio =
                pedido.getUsuarioId().equals(usuario.getId());

        boolean esComercioPropio =
                esComercioPropietario(pedido, usuario);

        if (!esClientePropio && !esComercioPropio) {
            throw new RuntimeException(
                    "No tienes permiso para consultar este pago");
        }
    }

    private boolean esComercioPropietario(
            Pedido pedido,
            Usuario usuario) {

        Sucursal sucursal = sucursalRepository.findById(
                pedido.getSucursalId()
        ).orElseThrow(() ->
                new RuntimeException("Sucursal no encontrada"));

        return comercioRepository.findByIdAndUsuarioId(
                sucursal.getComercioId(),
                usuario.getId()
        ).isPresent();
    }

    private Pedido pedido(Integer id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Pedido no encontrado"));
    }

    private Pago pago(Integer id) {
        return pagoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Pago no encontrado"));
    }

    private Usuario usuario() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            throw new RuntimeException("Usuario no autenticado");
        }

        return usuarioRepository.findByCorreo(
                        authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Usuario autenticado no encontrado"));
    }
}
