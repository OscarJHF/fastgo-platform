package com.fastgo.service;

import com.fastgo.entity.*;
import com.fastgo.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final CarritoService carritoService;
    private final CarritoDetalleService carritoDetalleService;
    private final UsuarioRepository usuarioRepository;
    private final DireccionRepository direccionRepository;
    private final SucursalRepository sucursalRepository;
    private final ComercioRepository comercioRepository;
    private final ProductoRepository productoRepository;
    private final TarifaService tarifaService;
    private final PagoRepository pagoRepository;

    public PedidoService(
            PedidoRepository pedidoRepository,
            DetallePedidoRepository detallePedidoRepository,
            CarritoService carritoService,
            CarritoDetalleService carritoDetalleService,
            UsuarioRepository usuarioRepository,
            DireccionRepository direccionRepository,
            SucursalRepository sucursalRepository,
            ComercioRepository comercioRepository,
            ProductoRepository productoRepository,
            TarifaService tarifaService,
            PagoRepository pagoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.carritoService = carritoService;
        this.carritoDetalleService = carritoDetalleService;
        this.usuarioRepository = usuarioRepository;
        this.direccionRepository = direccionRepository;
        this.sucursalRepository = sucursalRepository;
        this.comercioRepository = comercioRepository;
        this.productoRepository = productoRepository;
        this.tarifaService = tarifaService;
        this.pagoRepository = pagoRepository;
    }

    @Transactional
    public Pedido crearPedido(
            Integer carritoId,
            Integer direccionId,
            BigDecimal costoEnvio,
            String observaciones) {
        return crearPedido(carritoId, direccionId, costoEnvio, observaciones, "EFECTIVO");
    }

    @Transactional
    public Pedido crearPedido(
            Integer carritoId,
            Integer direccionId,
            BigDecimal costoEnvio,
            String observaciones,
            String metodoPago) {

        Usuario usuario = usuario();

        Carrito carrito = carritoService.obtenerPropio(carritoId);

        Direccion direccion = direccionRepository
                .findByIdAndUsuarioId(direccionId, usuario.getId())
                .orElseThrow(() -> new RuntimeException("La dirección no existe o no pertenece al usuario"));

        List<CarritoDetalle> detalles =
                carritoDetalleService.detallesInternos(carritoId);

        if (detalles.isEmpty()) {
            throw new RuntimeException(
                    "No se puede crear un pedido con un carrito vacío");
        }

        Sucursal sucursal = sucursalRepository.findById(carrito.getSucursalId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));

        Comercio comercio = comercioRepository.findById(sucursal.getComercioId())
                .orElseThrow(() -> new RuntimeException("Comercio no encontrado"));

        // Validar si el comercio se encuentra abierto
        if (!comercio.isAbierto()) {
            throw new IllegalStateException("El comercio '" + comercio.getNombre() + "' se encuentra actualmente cerrado. Consulta sus horarios de atención.");
        }

        // Validar método de pago aceptado por el comercio
        String metodoNormalizado = (metodoPago == null || metodoPago.isBlank()) ? "EFECTIVO" : metodoPago.trim().toUpperCase();
        if (!comercio.aceptaMetodoPago(metodoNormalizado)) {
            throw new IllegalArgumentException("El comercio no acepta el método de pago: " + metodoNormalizado);
        }

        BigDecimal distanciaKm = BigDecimal.ONE;
        if (sucursal.getLatitud() != null && sucursal.getLongitud() != null
                && direccion.getLatitud() != null && direccion.getLongitud() != null) {
            distanciaKm = tarifaService.calcularDistanciaHaversine(
                    sucursal.getLatitud(), sucursal.getLongitud(),
                    direccion.getLatitud(), direccion.getLongitud());
        }

        costoEnvio = tarifaService.calcularTarifaPorDistancia(distanciaKm);

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CarritoDetalle detalleCarrito : detalles) {
            Producto producto = productoRepository.findById(detalleCarrito.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado en el catálogo"));

            if (!Boolean.TRUE.equals(producto.getDisponible())) {
                throw new RuntimeException("El producto '" + producto.getNombre() + "' no está disponible");
            }

            if (producto.getStock() != null && producto.getStock() < detalleCarrito.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto '" + producto.getNombre() + "'. Stock actual: " + producto.getStock());
            }

            if (!producto.getSucursalId().equals(carrito.getSucursalId())) {
                throw new RuntimeException("El producto no pertenece a la sucursal del pedido");
            }

            BigDecimal precioUnitario = producto.getPrecio();
            BigDecimal lineaSubtotal = precioUnitario.multiply(BigDecimal.valueOf(detalleCarrito.getCantidad()));
            subtotal = subtotal.add(lineaSubtotal);
        }

        Pedido pedido = new Pedido();
        pedido.setUsuarioId(usuario.getId());
        pedido.setSucursalId(carrito.getSucursalId());
        pedido.setDireccionId(direccionId);
        pedido.setEstado("PENDIENTE");
        pedido.setSubtotal(subtotal);
        pedido.setDistanciaKm(distanciaKm);
        pedido.setCostoEnvio(costoEnvio);
        pedido.setTarifaAceptada(true);
        pedido.setTotal(subtotal.add(costoEnvio));
        pedido.setMetodoPago(metodoNormalizado);
        pedido.setObservaciones(normalizarObservaciones(observaciones));

        pedido = pedidoRepository.save(pedido);

        for (CarritoDetalle detalleCarrito : detalles) {
            Producto producto = productoRepository.findById(detalleCarrito.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (producto.getStock() != null) {
                int nuevoStock = producto.getStock() - detalleCarrito.getCantidad();
                producto.setStock(Math.max(0, nuevoStock));
                if (nuevoStock <= 0) {
                    producto.setDisponible(false);
                }
                productoRepository.save(producto);
            }

            DetallePedido detallePedido = new DetallePedido();
            detallePedido.setPedidoId(pedido.getId());
            detallePedido.setProductoId(detalleCarrito.getProductoId());
            detallePedido.setCantidad(detalleCarrito.getCantidad());
            detallePedido.setPrecio(producto.getPrecio());
            detallePedido.setSubtotal(producto.getPrecio().multiply(BigDecimal.valueOf(detalleCarrito.getCantidad())));
            detallePedidoRepository.save(detallePedido);
        }

        // Crear registro automático de pago
        Pago pago = new Pago();
        pago.setPedidoId(pedido.getId());
        pago.setMetodo(metodoNormalizado);
        pago.setEstado("PENDIENTE");
        pago.setFechaPago(java.time.LocalDateTime.now());
        pagoRepository.save(pago);

        carritoDetalleService.vaciarCarrito(carritoId);
        return pedido;
    }

    public Pedido obtenerPorId(Integer id) {
        Pedido pedido = pedido(id);
        Usuario usuario = usuario();

        if (pedido.getUsuarioId().equals(usuario.getId())) {
            return pedido;
        }

        if (esComercioPropietario(pedido, usuario)) {
            return pedido;
        }

        if ("DOMICILIARIO".equalsIgnoreCase(rol(usuario))
                && usuario.getId().equals(pedido.getDomiciliarioId())) {
            return pedido;
        }

        throw new RuntimeException(
                "No tienes permiso para consultar este pedido");
    }

    public List<Pedido> listarPorUsuario() {
        return pedidoRepository.findByUsuarioId(usuario().getId());
    }

    public List<Pedido> listarPorUsuario(Integer usuarioId) {
        Usuario usuario = usuario();
        if (!usuario.getId().equals(usuarioId)) {
            throw new RuntimeException(
                    "No tienes permiso para consultar estos pedidos");
        }
        return pedidoRepository.findByUsuarioId(usuarioId);
    }

    public List<Pedido> listarPorSucursal(Integer sucursalId) {
        Usuario usuario = usuario();
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() ->
                        new RuntimeException("Sucursal no encontrada"));

        exigirComercioPropietario(sucursal.getComercioId(), usuario);

        return pedidoRepository.findBySucursalId(sucursalId);
    }

    public List<Pedido> listarPorEstado(String estado) {
        Usuario usuario = usuario();
        if (!"COMERCIO".equalsIgnoreCase(rol(usuario))) {
            throw new RuntimeException(
                    "Solo un comercio puede consultar pedidos por estado");
        }

        String estadoNormalizado = estado == null
                ? ""
                : estado.trim().toUpperCase();

        return sucursalRepository.findByComercioId(
                        comercioPropio(usuario).getId())
                .stream()
                .flatMap(sucursal ->
                        pedidoRepository.findBySucursalId(sucursal.getId()).stream())
                .filter(pedido ->
                        pedido.getEstado().equalsIgnoreCase(estadoNormalizado))
                .toList();
    }

    public List<Pedido> disponiblesParaDomiciliario() {
        return pedidoRepository.findByEstadoAndDomiciliarioIdIsNull("LISTO");
    }

    public List<Pedido> misPedidosDomiciliario() {
        Usuario usuario = usuario();
        if (!"DOMICILIARIO".equalsIgnoreCase(rol(usuario))) {
            throw new RuntimeException(
                    "Solo un domiciliario puede consultar sus pedidos");
        }
        return pedidoRepository.findByDomiciliarioId(usuario.getId());
    }

    public List<DetallePedido> detalles(Integer pedidoId) {
        Pedido pedido = pedido(pedidoId);
        Usuario usuario = usuario();

        boolean permitido =
                pedido.getUsuarioId().equals(usuario.getId())
                        || esComercioPropietario(pedido, usuario)
                        || (pedido.getDomiciliarioId() != null
                        && pedido.getDomiciliarioId().equals(usuario.getId()));

        if (!permitido) {
            throw new RuntimeException(
                    "No tienes permiso para consultar los detalles");
        }

        return detallePedidoRepository.findByPedidoId(pedidoId);
    }

    public Pedido confirmar(Integer id) {
        return cambiarEstadoComercio(id, "CONFIRMADO");
    }

    public Pedido preparar(Integer id) {
        return cambiarEstadoComercio(id, "PREPARANDO");
    }

    public Pedido listo(Integer id) {
        return cambiarEstadoComercio(id, "LISTO");
    }

    private Pedido cambiarEstadoComercio(
            Integer id,
            String nuevoEstado) {

        Pedido pedido = pedido(id);
        Usuario usuario = usuario();

        exigirComercioPropietario(pedido, usuario);

        if (!transicionValida(
                pedido.getEstado(),
                nuevoEstado)) {
            throw new RuntimeException(
                    "Transición de estado no permitida: "
                            + pedido.getEstado()
                            + " → "
                            + nuevoEstado);
        }

        pedido.setEstado(nuevoEstado);
        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido tomarPedido(Integer id) {
        Usuario usuario = usuario();

        if (!"DOMICILIARIO".equalsIgnoreCase(rol(usuario))) {
            throw new RuntimeException("Solo un domiciliario puede tomar pedidos");
        }

        if (!pedidoRepository.existsById(id)) {
            throw new RuntimeException("Pedido no encontrado");
        }

        int actualizadas = pedidoRepository.asignarPedidoAtomicamente(id, usuario.getId());
        if (actualizadas != 1) {
            throw new RuntimeException("El pedido ya no está disponible para ser asignado");
        }

        return pedido(id);
    }

    public Pedido enCamino(Integer id) {
        Usuario usuario = usuario();
        Pedido pedido = pedido(id);
        if (!usuario.getId().equals(pedido.getDomiciliarioId())) {
            throw new RuntimeException("Este pedido no está asignado al domiciliario autenticado");
        }
        if (!"EN_CAMINO".equalsIgnoreCase(pedido.getEstado())) {
            throw new RuntimeException("El pedido debe pasar primero por la asignación al domiciliario");
        }
        return pedido;
    }

    public Pedido entregar(Integer id) {
        Usuario usuario = usuario();
        Pedido pedido = pedido(id);

        if (!usuario.getId().equals(pedido.getDomiciliarioId())) {
            throw new RuntimeException(
                    "Este pedido no está asignado al domiciliario autenticado");
        }

        if (!"EN_CAMINO".equalsIgnoreCase(pedido.getEstado())) {
            throw new RuntimeException(
                    "El pedido no está en camino");
        }

        pedido.setEstado("ENTREGADO");
        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido cancelar(Integer id) {
        Pedido pedido = pedido(id);
        Usuario usuario = usuario();

        if (!pedido.getUsuarioId().equals(usuario.getId())) {
            throw new RuntimeException(
                    "No tienes permiso para cancelar este pedido");
        }

        if (!"PENDIENTE".equalsIgnoreCase(pedido.getEstado())) {
            throw new RuntimeException(
                    "Solo se pueden cancelar pedidos pendientes");
        }

        pedido.setEstado("CANCELADO");
        restaurarStock(pedido.getId());
        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido rechazar(Integer id, String motivo) {
        Pedido pedido = pedido(id);
        Usuario usuario = usuario();
        exigirComercioPropietario(pedido, usuario);

        if (!"PENDIENTE".equalsIgnoreCase(pedido.getEstado())) {
            throw new RuntimeException("Solo se pueden rechazar pedidos en estado PENDIENTE");
        }

        pedido.setEstado("CANCELADO");
        String obs = pedido.getObservaciones() == null ? "" : pedido.getObservaciones() + " | ";
        pedido.setObservaciones(obs + "Rechazado por comercio: " + (motivo == null || motivo.isBlank() ? "Sin motivo especificado" : motivo.trim()));
        restaurarStock(pedido.getId());
        return pedidoRepository.save(pedido);
    }

    private void restaurarStock(Integer pedidoId) {
        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoId(pedidoId);
        for (DetallePedido dp : detalles) {
            productoRepository.findById(dp.getProductoId()).ifPresent(prod -> {
                if (prod.getStock() != null) {
                    prod.setStock(prod.getStock() + dp.getCantidad());
                    if (prod.getStock() > 0) {
                        prod.setDisponible(true);
                    }
                    productoRepository.save(prod);
                }
            });
        }
    }

    private String normalizarObservaciones(String observaciones) {
        if (observaciones == null) {
            return null;
        }
        String normalizada = observaciones.trim();
        if (normalizada.length() > 500) {
            throw new IllegalArgumentException("Las observaciones no pueden superar 500 caracteres");
        }
        return normalizada.isBlank() ? null : normalizada;
    }

    private boolean transicionValida(
            String actual,
            String nuevo) {

        return ("PENDIENTE".equalsIgnoreCase(actual)
                && "CONFIRMADO".equalsIgnoreCase(nuevo))
                || ("CONFIRMADO".equalsIgnoreCase(actual)
                && "PREPARANDO".equalsIgnoreCase(nuevo))
                || ("PREPARANDO".equalsIgnoreCase(actual)
                && "LISTO".equalsIgnoreCase(nuevo));
    }

    private boolean esComercioPropietario(
            Pedido pedido,
            Usuario usuario) {

        return esComercioPropietarioPorSucursal(
                pedido.getSucursalId(),
                usuario);
    }

    private boolean esComercioPropietarioPorSucursal(
            Integer sucursalId,
            Usuario usuario) {

        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() ->
                        new RuntimeException("Sucursal no encontrada"));

        return esComercioPropietario(
                sucursal.getComercioId(),
                usuario);
    }

    private boolean esComercioPropietario(
            Integer comercioId,
            Usuario usuario) {

        return comercioRepository
                .findByIdAndUsuarioId(
                        comercioId,
                        usuario.getId())
                .isPresent();
    }

    private void exigirComercioPropietario(
            Integer comercioId,
            Usuario usuario) {

        if (!esComercioPropietario(comercioId, usuario)) {
            throw new RuntimeException(
                    "No tienes permiso para administrar este comercio");
        }
    }

    private void exigirComercioPropietario(
            Pedido pedido,
            Usuario usuario) {

        if (!esComercioPropietario(pedido, usuario)) {
            throw new RuntimeException(
                    "No tienes permiso para administrar este pedido");
        }
    }

    private Comercio comercioPropio(Usuario usuario) {
        return comercioRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Comercio no encontrado o no pertenece al usuario"));
    }

    private Pedido pedido(Integer id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Pedido no encontrado"));
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

    private String rol(Usuario usuario) {
        return usuario.getRol() == null
                ? ""
                : usuario.getRol().getNombre();
    }
}
