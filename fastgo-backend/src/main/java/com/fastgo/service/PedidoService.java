package com.fastgo.service;

import com.fastgo.entity.*;
import com.fastgo.repository.*;
import com.fastgo.util.FileValidationUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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
    private final StorageService storageService;

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
            PagoRepository pagoRepository,
            StorageService storageService) {
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
        this.storageService = storageService;
    }

    @Transactional
    public Pedido crearPedido(
            Integer carritoId,
            Integer direccionId,
            BigDecimal costoEnvio,
            String observaciones) {
        return crearPedido(carritoId, direccionId, costoEnvio, observaciones, "EFECTIVO", null);
    }

    @Transactional
    public Pedido crearPedido(
            Integer carritoId,
            Integer direccionId,
            BigDecimal costoEnvio,
            String observaciones,
            String metodoPago) {
        return crearPedido(carritoId, direccionId, costoEnvio, observaciones, metodoPago, null);
    }

    @Transactional
    public Pedido crearPedido(
            Integer carritoId,
            Integer direccionId,
            BigDecimal costoEnvio,
            String observaciones,
            String metodoPago,
            String comprobantePagoUrl) {
        return crearPedido(carritoId, direccionId, costoEnvio, observaciones, metodoPago, comprobantePagoUrl, null);
    }

    @Transactional
    public Pedido crearPedido(
            Integer carritoId,
            Integer direccionId,
            BigDecimal costoEnvio,
            String observaciones,
            String metodoPago,
            String comprobantePagoUrl,
            MultipartFile comprobanteArchivo) {

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

        // Validar si el comercio se encuentra activo y operativo
        if (!comercio.isOperativa()) {
            throw new IllegalStateException("El comercio '" + comercio.getNombre() + "' no se encuentra activo u operativo actualmente (" + comercio.getEstado() + ").");
        }

        // Validar si el comercio se encuentra abierto
        if (!comercio.isAbierto()) {
            throw new IllegalStateException("El comercio '" + comercio.getNombre() + "' se encuentra actualmente cerrado. Consulta sus horarios de atención.");
        }

        // Validar método de pago aceptado por el comercio
        String metodoNormalizado = (metodoPago == null || metodoPago.isBlank()) ? "EFECTIVO" : metodoPago.trim().toUpperCase();
        if (!comercio.aceptaMetodoPago(metodoNormalizado)) {
            throw new IllegalArgumentException("El comercio no acepta el método de pago: " + metodoNormalizado);
        }

        // Validar comprobante y estado de pago para Bancolombia
        String estadoPago = "APROBADO";
        if ("BANCOLOMBIA".equals(metodoNormalizado)) {
            boolean hasUrl = comprobantePagoUrl != null && !comprobantePagoUrl.isBlank();
            boolean hasFile = comprobanteArchivo != null && !comprobanteArchivo.isEmpty();
            if (!hasUrl && !hasFile) {
                throw new IllegalArgumentException("El comprobante de pago es obligatorio para compras con Bancolombia");
            }
            estadoPago = "PENDIENTE_VERIFICACION";
        }

        BigDecimal distanciaKm = BigDecimal.ONE;
        if (sucursal.getLatitud() != null && sucursal.getLongitud() != null
                && direccion.getLatitud() != null && direccion.getLongitud() != null) {
            distanciaKm = tarifaService.calcularDistanciaHaversine(
                    sucursal.getLatitud(), sucursal.getLongitud(),
                    direccion.getLatitud(), direccion.getLongitud());
        }

        // NUEVA REGLA: Tarifa de domicilio configurada por el comercio (mínimo $2.000 COP)
        BigDecimal tarifaComercio = comercio.getTarifaDomicilio();
        if (tarifaComercio == null || tarifaComercio.compareTo(BigDecimal.valueOf(2000)) < 0) {
            tarifaComercio = BigDecimal.valueOf(2000);
        }
        costoEnvio = tarifaComercio;

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
        pedido.setEstadoPago(estadoPago);
        pedido.setComprobantePagoUrl(comprobantePagoUrl != null && !comprobantePagoUrl.isBlank() ? comprobantePagoUrl.trim() : null);
        pedido.setObservaciones(normalizarObservaciones(observaciones));

        pedido = pedidoRepository.save(pedido);

        if (comprobanteArchivo != null && !comprobanteArchivo.isEmpty()) {
            FileValidationUtils.validatePaymentProof(comprobanteArchivo);
            String extension = FileValidationUtils.getCleanExtension(comprobanteArchivo.getOriginalFilename());
            String secureFilename = "proof_" + pedido.getId() + "_" + UUID.randomUUID() + "." + extension;
            try {
                storageService.storePrivateProof(comprobanteArchivo, secureFilename);
            } catch (IOException e) {
                throw new RuntimeException("Error al guardar el comprobante: " + e.getMessage(), e);
            }
            String publicUrl = "/api/pedidos/" + pedido.getId() + "/comprobante";
            pedido.setComprobantePagoUrl(publicUrl);
            pedido = pedidoRepository.save(pedido);
        }

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
            detallePedido.setProductoNombre(producto.getNombre());
            detallePedido.setCantidad(detalleCarrito.getCantidad());
            detallePedido.setPrecio(producto.getPrecio());
            detallePedido.setSubtotal(producto.getPrecio().multiply(BigDecimal.valueOf(detalleCarrito.getCantidad())));
            detallePedidoRepository.save(detallePedido);
        }

        // Crear registro automático de pago
        Pago pago = new Pago();
        pago.setPedidoId(pedido.getId());
        pago.setMetodo(metodoNormalizado);
        pago.setEstado("BANCOLOMBIA".equals(metodoNormalizado) ? "PENDIENTE" : "APROBADO");
        pago.setReferencia(pedido.getComprobantePagoUrl());
        pago.setFechaPago(java.time.LocalDateTime.now());
        pagoRepository.save(pago);

        carritoDetalleService.vaciarCarrito(carritoId);
        return pedido;
    }

    public Pedido obtenerPorId(Integer id) {
        Pedido pedido = pedido(id);
        Usuario usuario = usuario();

        if (pedido.getUsuarioId().equals(usuario.getId())) {
            return enriquecerPedido(pedido);
        }

        if (esComercioPropietario(pedido, usuario)) {
            return enriquecerPedido(pedido);
        }

        if ("ADMIN".equalsIgnoreCase(rol(usuario))) {
            return enriquecerPedido(pedido);
        }

        if ("DOMICILIARIO".equalsIgnoreCase(rol(usuario))
                && usuario.getId().equals(pedido.getDomiciliarioId())) {
            return enriquecerPedido(pedido);
        }

        throw new RuntimeException(
                "No tienes permiso para consultar este pedido");
    }

    public List<Pedido> listarPorUsuario() {
        return enriquecerPedidos(pedidoRepository.findByUsuarioId(usuario().getId()));
    }

    public List<Pedido> listarPorUsuario(Integer usuarioId) {
        Usuario usuario = usuario();
        if (!usuario.getId().equals(usuarioId)) {
            throw new RuntimeException(
                    "No tienes permiso para consultar estos pedidos");
        }
        return enriquecerPedidos(pedidoRepository.findByUsuarioId(usuarioId));
    }

    public List<Pedido> listarPorSucursal(Integer sucursalId) {
        Usuario usuario = usuario();
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() ->
                        new RuntimeException("Sucursal no encontrada"));

        exigirComercioPropietario(sucursal.getComercioId(), usuario);

        return enriquecerPedidos(pedidoRepository.findBySucursalId(sucursalId));
    }

    public List<Pedido> listarPorEstado(String estado) {
        return listarPorEstado(estado, null);
    }

    public List<Pedido> listarPorEstado(String estado, Integer comercioId) {
        Usuario usuario = usuario();
        if (!"COMERCIO".equalsIgnoreCase(rol(usuario))) {
            throw new RuntimeException(
                    "Solo un comercio puede consultar pedidos por estado");
        }

        String estadoNormalizado = estado == null
                ? ""
                : estado.trim().toUpperCase();

        List<Comercio> comercios;
        if (comercioId != null) {
            Comercio c = comercioRepository.findByIdAndUsuarioId(comercioId, usuario.getId())
                    .orElseThrow(() -> new RuntimeException("Comercio no encontrado o no pertenece al usuario"));
            comercios = List.of(c);
        } else {
            comercios = comercioRepository.findAllByUsuarioIdOrderByCreadoEnAsc(usuario.getId());
        }

        return enriquecerPedidos(comercios.stream()
                .flatMap(c -> sucursalRepository.findByComercioId(c.getId()).stream())
                .flatMap(sucursal -> pedidoRepository.findBySucursalId(sucursal.getId()).stream())
                .filter(pedido -> estadoNormalizado.isBlank() || "TODOS".equalsIgnoreCase(estadoNormalizado) || pedido.getEstado().equalsIgnoreCase(estadoNormalizado))
                .sorted((p1, p2) -> p2.getId().compareTo(p1.getId()))
                .toList());
    }

    public List<Pedido> disponiblesParaDomiciliario() {
        return enriquecerPedidos(pedidoRepository.findByEstadoAndDomiciliarioIdIsNull("LISTO"));
    }

    public List<Pedido> misPedidosDomiciliario() {
        Usuario usuario = usuario();
        if (!"DOMICILIARIO".equalsIgnoreCase(rol(usuario))) {
            throw new RuntimeException(
                    "Solo un domiciliario puede consultar sus pedidos");
        }
        return enriquecerPedidos(pedidoRepository.findByDomiciliarioId(usuario.getId()));
    }

    public List<DetallePedido> detalles(Integer pedidoId) {
        Pedido pedido = pedido(pedidoId);
        Usuario usuario = usuario();

        boolean permitido =
                pedido.getUsuarioId().equals(usuario.getId())
                        || esComercioPropietario(pedido, usuario)
                        || "ADMIN".equalsIgnoreCase(rol(usuario))
                        || (pedido.getDomiciliarioId() != null
                        && pedido.getDomiciliarioId().equals(usuario.getId()));

        if (!permitido) {
            throw new RuntimeException(
                    "No tienes permiso para consultar los detalles");
        }

        List<DetallePedido> lista = detallePedidoRepository.findByPedidoId(pedidoId);
        for (DetallePedido d : lista) {
            if (d.getProductoNombre() == null || d.getProductoNombre().isBlank()) {
                if (d.getProductoId() != null) {
                    productoRepository.findById(d.getProductoId()).ifPresent(p -> d.setProductoNombre(p.getNombre()));
                }
            }
            if (d.getProductoNombre() == null || d.getProductoNombre().isBlank()) {
                d.setProductoNombre("Producto #" + d.getProductoId());
            }
        }
        return lista;
    }

    private Pedido enriquecerPedido(Pedido p) {
        if (p == null) return null;

        // Invariante de negocio: Ganancia del domiciliario es exactamente el deliveryFee congelado en el pedido
        BigDecimal costo = p.getCostoEnvio() != null ? p.getCostoEnvio() : BigDecimal.valueOf(2000);
        p.setGananciaDomiciliario(costo);

        if (p.getUsuarioId() != null) {
            usuarioRepository.findById(p.getUsuarioId()).ifPresent(u -> {
                String nombreCompleto = u.getNombre() + (u.getApellido() != null && !u.getApellido().isBlank() ? " " + u.getApellido() : "");
                p.setClienteNombre(nombreCompleto.trim());
                p.setClienteTelefono(u.getTelefono());
            });
        }
        if (p.getDireccionId() != null) {
            direccionRepository.findById(p.getDireccionId()).ifPresent(d -> {
                String dir = d.getDireccion() + (d.getCiudad() != null && !d.getCiudad().isBlank() ? ", " + d.getCiudad() : "");
                p.setDireccionTexto(dir);
                p.setDestinoDireccion(d.getDireccion());
                p.setDestinoCiudad(d.getCiudad());
                p.setDestinoReferencia(d.getAlias());
                p.setDestinoLatitud(d.getLatitud());
                p.setDestinoLongitud(d.getLongitud());
            });
        }
        if (p.getSucursalId() != null) {
            sucursalRepository.findById(p.getSucursalId()).ifPresent(s -> {
                p.setSucursalNombre(s.getNombre());
                String dir = s.getDireccion() + (s.getCiudad() != null && !s.getCiudad().isBlank() ? ", " + s.getCiudad() : "");
                p.setComercioDireccion(dir);
                p.setOrigenLatitud(s.getLatitud());
                p.setOrigenLongitud(s.getLongitud());
                p.setOrigenTelefono(s.getTelefono());
                if (s.getComercioId() != null) {
                    comercioRepository.findById(s.getComercioId()).ifPresent(c -> {
                        p.setComercioNombre(c.getNombre());
                    });
                }
            });
        }
        if (p.getDomiciliarioId() != null) {
            usuarioRepository.findById(p.getDomiciliarioId()).ifPresent(d -> {
                String nombreCompleto = d.getNombre() + (d.getApellido() != null && !d.getApellido().isBlank() ? " " + d.getApellido() : "");
                p.setDomiciliarioNombre(nombreCompleto.trim());
                p.setDomiciliarioTelefono(d.getTelefono());
            });
        }

        // REGLA DE PRIVACIDAD: Si el usuario actual es un domiciliario y el pedido aún no está asignado a él,
        // ocultamos el teléfono privado del cliente para prevenir recolección no autorizada de datos.
        Usuario solicitante = usuarioOpcional();
        if (solicitante != null && "DOMICILIARIO".equalsIgnoreCase(rol(solicitante))) {
            if (p.getDomiciliarioId() == null || !p.getDomiciliarioId().equals(solicitante.getId())) {
                p.setClienteTelefono(null);
            }
        }

        return p;
    }

    private List<Pedido> enriquecerPedidos(List<Pedido> lista) {
        if (lista == null) return List.of();
        for (Pedido p : lista) {
            enriquecerPedido(p);
        }
        return lista;
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

    @Transactional
    public Pedido aprobarPago(Integer id) {
        Pedido pedido = pedido(id);
        Usuario usuario = usuario();
        exigirComercioPropietario(pedido, usuario);

        if ("CANCELADO".equalsIgnoreCase(pedido.getEstado()) || "ENTREGADO".equalsIgnoreCase(pedido.getEstado())) {
            throw new IllegalStateException("No se puede verificar el pago de un pedido en estado " + pedido.getEstado());
        }

        pedido.setEstadoPago("APROBADO");
        List<Pago> pagos = pagoRepository.findByPedidoId(pedido.getId());
        for (Pago p : pagos) {
            p.setEstado("APROBADO");
            pagoRepository.save(p);
        }
        return enriquecerPedido(pedidoRepository.save(pedido));
    }

    @Transactional
    public Pedido rechazarPago(Integer id, String motivo) {
        Pedido pedido = pedido(id);
        Usuario usuario = usuario();
        exigirComercioPropietario(pedido, usuario);

        if ("ENTREGADO".equalsIgnoreCase(pedido.getEstado())) {
            throw new IllegalStateException("No se puede rechazar el pago de un pedido ya entregado");
        }

        pedido.setEstadoPago("RECHAZADO");
        pedido.setEstado("CANCELADO");
        String obs = pedido.getObservaciones() == null ? "" : pedido.getObservaciones() + " | ";
        pedido.setObservaciones(obs + "Pago rechazado por el comercio: " + (motivo == null || motivo.isBlank() ? "Comprobante inválido o no recibido" : motivo.trim()));
        restaurarStock(pedido.getId());

        List<Pago> pagos = pagoRepository.findByPedidoId(pedido.getId());
        for (Pago p : pagos) {
            p.setEstado("RECHAZADO");
            pagoRepository.save(p);
        }
        return enriquecerPedido(pedidoRepository.save(pedido));
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

        // REGLA CRÍTICA: Un pedido pagado con BANCOLOMBIA que esté en PENDIENTE_VERIFICACION NO PUEDE pasar a LISTO (despachado)
        if ("LISTO".equalsIgnoreCase(nuevoEstado)) {
            if ("BANCOLOMBIA".equalsIgnoreCase(pedido.getMetodoPago())
                    && !"APROBADO".equalsIgnoreCase(pedido.getEstadoPago())) {
                throw new IllegalStateException("No se puede despachar el pedido: el pago por Bancolombia está pendiente de verificación.");
            }
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
            throw new com.fastgo.exception.PedidoYaAsignadoException("Este domicilio ya fue tomado por otro domiciliario.");
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

    private Usuario usuarioOpcional() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        return usuarioRepository.findByCorreo(authentication.getName()).orElse(null);
    }

    private String rol(Usuario usuario) {
        return usuario.getRol() == null
                ? ""
                : usuario.getRol().getNombre();
    }

    public record ComprobanteResourceInfo(Resource resource, MediaType mediaType) {}

    public ComprobanteResourceInfo obtenerComprobante(Integer id) {
        Usuario usuario = usuario();
        Pedido pedido = pedido(id);

        String rol = rol(usuario);
        if ("DOMICILIARIO".equalsIgnoreCase(rol)) {
            throw new RuntimeException("No tienes permiso para consultar el comprobante de este pedido");
        }

        if ("CLIENTE".equalsIgnoreCase(rol)) {
            if (!pedido.getUsuarioId().equals(usuario.getId())) {
                throw new RuntimeException("No tienes permiso para consultar el comprobante de este pedido");
            }
        } else if ("COMERCIO".equalsIgnoreCase(rol)) {
            if (!esComercioPropietario(pedido, usuario)) {
                throw new RuntimeException("No tienes permiso para consultar el comprobante de este pedido");
            }
        } else if (!"ADMIN".equalsIgnoreCase(rol)) {
            throw new RuntimeException("No tienes permiso para consultar el comprobante de este pedido");
        }

        String comprobanteUrl = pedido.getComprobantePagoUrl();
        if (comprobanteUrl == null || comprobanteUrl.isBlank()) {
            throw new RuntimeException("El comprobante no existe o no ha sido cargado para este pedido");
        }

        Resource resource = storageService.loadPrivateProof(pedido.getId(), comprobanteUrl);
        if (resource == null || !resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("El archivo del comprobante no existe en el servidor");
        }

        MediaType mediaType = storageService.getPrivateProofMediaType(resource.getFilename());
        return new ComprobanteResourceInfo(resource, mediaType);
    }

    @Transactional
    public Map<String, Object> subirComprobante(Integer id, MultipartFile file) {
        Usuario usuario = usuario();
        Pedido pedido = pedido(id);

        if (!pedido.getUsuarioId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para subir el comprobante de este pedido");
        }

        FileValidationUtils.validatePaymentProof(file);

        String extension = FileValidationUtils.getCleanExtension(file.getOriginalFilename());
        String secureFilename = "proof_" + pedido.getId() + "_" + UUID.randomUUID() + "." + extension;

        try {
            storageService.storePrivateProof(file, secureFilename);
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el comprobante en el servidor: " + e.getMessage(), e);
        }

        String publicUrl = "/api/pedidos/" + pedido.getId() + "/comprobante";
        pedido.setComprobantePagoUrl(publicUrl);
        pedidoRepository.save(pedido);

        List<Pago> pagos = pagoRepository.findByPedidoId(pedido.getId());
        if (pagos != null && !pagos.isEmpty()) {
            for (Pago p : pagos) {
                p.setReferencia(publicUrl);
                pagoRepository.save(p);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("url", publicUrl);
        response.put("filename", secureFilename);
        response.put("mensaje", "Comprobante subido exitosamente");
        return response;
    }
}
