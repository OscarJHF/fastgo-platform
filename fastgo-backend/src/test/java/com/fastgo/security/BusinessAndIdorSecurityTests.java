package com.fastgo.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fastgo.dto.*;
import com.fastgo.entity.*;
import com.fastgo.jwt.JwtService;
import com.fastgo.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BusinessAndIdorSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private DireccionRepository direccionRepository;

    @Autowired
    private CategoriaComercioRepository categoriaComercioRepository;

    @Autowired
    private CategoriaProductoRepository categoriaProductoRepository;

    @Autowired
    private ComercioRepository comercioRepository;

    @Autowired
    private SucursalRepository sucursalRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private CarritoDetalleRepository carritoDetalleRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Value("${fastgo.wompi.events-secret:TEST_EVENTS_SECRET_32_CHARS_MINIMUM}")
    private String eventsSecret;

    private Usuario clienteA;
    private Usuario clienteB;
    private Usuario comercioUserA;
    private Usuario comercioUserB;
    private Usuario domiciliarioUserA;
    private Usuario domiciliarioUserB;
    private Usuario adminUser;

    private String tokenClienteA;
    private String tokenClienteB;
    private String tokenComercioA;
    private String tokenComercioB;
    private String tokenDomiciliarioA;
    private String tokenDomiciliarioB;
    private String tokenAdmin;

    private Comercio comercioA;
    private Sucursal sucursalA;
    private CategoriaProducto catProd;
    private Producto productoA;

    @BeforeEach
    void setUp() {
        Rol rolCliente = obtenerOCrearRol("CLIENTE");
        Rol rolComercio = obtenerOCrearRol("COMERCIO");
        Rol rolDomiciliario = obtenerOCrearRol("DOMICILIARIO");
        Rol rolAdmin = obtenerOCrearRol("ADMIN");

        clienteA = obtenerOCrearUsuario("clienteA@fastgo.com", "Cliente", "A", rolCliente);
        clienteB = obtenerOCrearUsuario("clienteB@fastgo.com", "Cliente", "B", rolCliente);
        comercioUserA = obtenerOCrearUsuario("comercioA@fastgo.com", "Comercio", "A", rolComercio);
        comercioUserB = obtenerOCrearUsuario("comercioB@fastgo.com", "Comercio", "B", rolComercio);
        domiciliarioUserA = obtenerOCrearUsuario("domiciliarioA@fastgo.com", "Domi", "A", rolDomiciliario);
        domiciliarioUserB = obtenerOCrearUsuario("domiciliarioB@fastgo.com", "Domi", "B", rolDomiciliario);
        adminUser = obtenerOCrearUsuario("admin.security@fastgo.com", "Admin", "Sec", rolAdmin);

        tokenClienteA = jwtService.generarToken(clienteA.getCorreo(), "CLIENTE");
        tokenClienteB = jwtService.generarToken(clienteB.getCorreo(), "CLIENTE");
        tokenComercioA = jwtService.generarToken(comercioUserA.getCorreo(), "COMERCIO");
        tokenComercioB = jwtService.generarToken(comercioUserB.getCorreo(), "COMERCIO");
        tokenDomiciliarioA = jwtService.generarToken(domiciliarioUserA.getCorreo(), "DOMICILIARIO");
        tokenDomiciliarioB = jwtService.generarToken(domiciliarioUserB.getCorreo(), "DOMICILIARIO");
        tokenAdmin = jwtService.generarToken(adminUser.getCorreo(), "ADMIN");

        for (Direccion d : direccionRepository.findByUsuarioId(clienteA.getId())) {
            if (Boolean.TRUE.equals(d.getPrincipal())) {
                d.setPrincipal(false);
                direccionRepository.save(d);
            }
        }
        for (Direccion d : direccionRepository.findByUsuarioId(clienteB.getId())) {
            if (Boolean.TRUE.equals(d.getPrincipal())) {
                d.setPrincipal(false);
                direccionRepository.save(d);
            }
        }

        CategoriaComercio catCom = categoriaComercioRepository.findAll().stream().findFirst().orElseGet(() -> {
            CategoriaComercio c = new CategoriaComercio();
            c.setNombre("Restaurantes Test");
            c.setActivo(true);
            return categoriaComercioRepository.save(c);
        });

        comercioA = comercioRepository.findByUsuarioId(comercioUserA.getId()).orElseGet(() -> {
            Comercio c = new Comercio();
            c.setNombre("Comercio Alpha");
            c.setUsuario(comercioUserA);
            c.setCategoria(catCom);
            c.setActivo(true);
            return comercioRepository.save(c);
        });

        sucursalA = sucursalRepository.findByComercioId(comercioA.getId()).stream().findFirst().orElseGet(() -> {
            Sucursal s = new Sucursal();
            s.setComercioId(comercioA.getId());
            s.setNombre("Sucursal Principal");
            s.setDireccion("Calle 10 # 20-30");
            s.setCiudad("Manizales");
            s.setAbierta(true);
            return sucursalRepository.save(s);
        });

        catProd = categoriaProductoRepository.findAll().stream().findFirst().orElseGet(() -> {
            CategoriaProducto cp = new CategoriaProducto();
            cp.setNombre("Comidas Rápidas");
            cp.setActivo(true);
            return categoriaProductoRepository.save(cp);
        });

        productoA = productoRepository.findBySucursalId(sucursalA.getId()).stream().findFirst().orElseGet(() -> {
            Producto p = new Producto();
            p.setSucursalId(sucursalA.getId());
            p.setCategoriaId(catProd.getId());
            p.setNombre("Hamburguesa Doble");
            p.setPrecio(new BigDecimal("25000.00"));
            p.setDisponible(true);
            return productoRepository.save(p);
        });
    }

    private Rol obtenerOCrearRol(String nombre) {
        return rolRepository.findByNombreIgnoreCase(nombre).orElseGet(() -> {
            Rol r = new Rol();
            r.setNombre(nombre);
            return rolRepository.save(r);
        });
    }

    private Usuario obtenerOCrearUsuario(String correo, String nombre, String apellido, Rol rol) {
        return usuarioRepository.findByCorreo(correo).orElseGet(() -> {
            Usuario u = new Usuario();
            u.setNombre(nombre);
            u.setApellido(apellido);
            u.setCorreo(correo);
            u.setPassword(passwordEncoder.encode("Password123"));
            u.setRol(rol);
            u.setEstado(true);
            return usuarioRepository.save(u);
        });
    }

    // ==========================================
    // 1. IDOR - DIRECCIONES
    // ==========================================

    @Test
    @DisplayName("IDOR: Cliente B no puede consultar la dirección de Cliente A (403/404)")
    void testIdorConsultarDireccionAjena() throws Exception {
        Direccion dirA = new Direccion();
        dirA.setUsuarioId(clienteA.getId());
        dirA.setAlias("Casa Cliente A");
        dirA.setDireccion("Carrera 1 # 2-3");
        dirA.setCiudad("Bogotá");
        dirA.setPrincipal(false);
        dirA = direccionRepository.save(dirA);

        mockMvc.perform(get("/api/direcciones/" + dirA.getId())
                        .header("Authorization", "Bearer " + tokenClienteB))
                .andExpect(result -> assertTrue(
                        result.getResponse().getStatus() == 403 || result.getResponse().getStatus() == 404,
                        "Debe rechazar con 403 o 404"));
    }

    @Test
    @DisplayName("IDOR: Cliente B no puede modificar la dirección de Cliente A (403/404)")
    void testIdorModificarDireccionAjena() throws Exception {
        Direccion dirA = new Direccion();
        dirA.setUsuarioId(clienteA.getId());
        dirA.setAlias("Casa Cliente A");
        dirA.setDireccion("Carrera 1 # 2-3");
        dirA.setCiudad("Bogotá");
        dirA.setPrincipal(false);
        dirA = direccionRepository.save(dirA);

        Direccion datosModificados = new Direccion();
        datosModificados.setAlias("Hackeado");
        datosModificados.setDireccion("Calle Falsa 123");
        datosModificados.setCiudad("Cali");

        mockMvc.perform(put("/api/direcciones/" + dirA.getId())
                        .header("Authorization", "Bearer " + tokenClienteB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(datosModificados)))
                .andExpect(result -> assertTrue(
                        result.getResponse().getStatus() == 403 || result.getResponse().getStatus() == 404,
                        "Debe rechazar con 403 o 404"));
    }

    @Test
    @DisplayName("IDOR: Cliente B no puede eliminar la dirección de Cliente A (403/404)")
    void testIdorEliminarDireccionAjena() throws Exception {
        Direccion dirA = new Direccion();
        dirA.setUsuarioId(clienteA.getId());
        dirA.setAlias("Oficina A");
        dirA.setDireccion("Calle 50 # 10-20");
        dirA.setCiudad("Medellín");
        dirA.setPrincipal(false);
        dirA = direccionRepository.save(dirA);

        mockMvc.perform(delete("/api/direcciones/" + dirA.getId())
                        .header("Authorization", "Bearer " + tokenClienteB))
                .andExpect(result -> assertTrue(
                        result.getResponse().getStatus() == 403 || result.getResponse().getStatus() == 404,
                        "Debe rechazar con 403 o 404"));
    }

    // ==========================================
    // 2. IDOR - PRODUCTOS Y COMERCIO
    // ==========================================

    @Test
    @DisplayName("IDOR: Comercio B no puede modificar productos del Comercio A (403/400)")
    void testIdorModificarProductoAjeno() throws Exception {
        ProductoRequestDTO req = new ProductoRequestDTO();
        req.setSucursalId(sucursalA.getId());
        req.setCategoriaId(catProd.getId());
        req.setNombre("Hamburguesa Hackeada");
        req.setPrecio(new BigDecimal("100.00"));

        mockMvc.perform(put("/api/productos/" + productoA.getId())
                        .header("Authorization", "Bearer " + tokenComercioB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(result -> assertTrue(
                        result.getResponse().getStatus() == 403 || result.getResponse().getStatus() == 400,
                        "Debe rechazar con 403 o 400"));
    }

    @Test
    @DisplayName("IDOR: Comercio B no puede eliminar productos del Comercio A (403/400)")
    void testIdorEliminarProductoAjeno() throws Exception {
        mockMvc.perform(delete("/api/productos/" + productoA.getId())
                        .header("Authorization", "Bearer " + tokenComercioB))
                .andExpect(result -> assertTrue(
                        result.getResponse().getStatus() == 403 || result.getResponse().getStatus() == 400,
                        "Debe rechazar con 403 o 400"));
    }

    // ==========================================
    // 3. IDOR - PEDIDOS Y CARRITO
    // ==========================================

    @Test
    @DisplayName("IDOR: Cliente B no puede consultar carrito de Cliente A (403/400)")
    void testIdorConsultarCarritoAjeno() throws Exception {
        Carrito carritoA = carritoRepository.findByUsuarioIdAndSucursalId(clienteA.getId(), sucursalA.getId())
                .orElseGet(() -> {
                    Carrito c = new Carrito();
                    c.setUsuarioId(clienteA.getId());
                    c.setSucursalId(sucursalA.getId());
                    return carritoRepository.save(c);
                });

        mockMvc.perform(get("/api/carritos/" + carritoA.getId())
                        .header("Authorization", "Bearer " + tokenClienteB))
                .andExpect(result -> assertTrue(
                        result.getResponse().getStatus() == 403 || result.getResponse().getStatus() == 400,
                        "Debe rechazar con 403 o 400"));
    }

    @Test
    @DisplayName("IDOR: Cliente B no puede consultar ni cancelar pedido de Cliente A")
    void testIdorConsultarYCancelarPedidoAjeno() throws Exception {
        Direccion dirA = new Direccion();
        dirA.setUsuarioId(clienteA.getId());
        dirA.setAlias("Casa A");
        dirA.setDireccion("Calle 1 # 2");
        dirA.setCiudad("Armenia");
        dirA = direccionRepository.save(dirA);

        Pedido pedidoA = new Pedido();
        pedidoA.setUsuarioId(clienteA.getId());
        pedidoA.setSucursalId(sucursalA.getId());
        pedidoA.setDireccionId(dirA.getId());
        pedidoA.setEstado("PENDIENTE");
        pedidoA.setSubtotal(new BigDecimal("25000.00"));
        pedidoA.setCostoEnvio(BigDecimal.ZERO);
        pedidoA.setTotal(new BigDecimal("25000.00"));
        pedidoA = pedidoRepository.save(pedidoA);

        // Consulta ajena
        mockMvc.perform(get("/api/pedidos/" + pedidoA.getId())
                        .header("Authorization", "Bearer " + tokenClienteB))
                .andExpect(result -> assertTrue(
                        result.getResponse().getStatus() == 403 || result.getResponse().getStatus() == 400,
                        "Debe rechazar la consulta"));

        // Cancelación ajena
        mockMvc.perform(put("/api/pedidos/" + pedidoA.getId() + "/cancelar")
                        .header("Authorization", "Bearer " + tokenClienteB))
                .andExpect(result -> assertTrue(
                        result.getResponse().getStatus() == 403 || result.getResponse().getStatus() == 400,
                        "Debe rechazar la cancelación ajena"));
    }

    // ==========================================
    // 4. INTEGRIDAD DE PRECIOS Y TOTALES
    // ==========================================

    @Test
    @DisplayName("Integridad: Creación de pedido calcula totales desde el backend (ignora intentos de tampering)")
    void testCrearPedidoCalculaPreciosServidor() throws Exception {
        Direccion dirA = new Direccion();
        dirA.setUsuarioId(clienteA.getId());
        dirA.setAlias("Entrega");
        dirA.setDireccion("Avenida 19 # 10");
        dirA.setCiudad("Pereira");
        dirA = direccionRepository.save(dirA);

        Carrito carrito = carritoRepository.findByUsuarioIdAndSucursalId(clienteA.getId(), sucursalA.getId())
                .orElseGet(() -> {
                    Carrito c = new Carrito();
                    c.setUsuarioId(clienteA.getId());
                    c.setSucursalId(sucursalA.getId());
                    return carritoRepository.save(c);
                });

        carritoDetalleRepository.deleteByCarritoId(carrito.getId());

        CarritoDetalle item = new CarritoDetalle();
        item.setCarritoId(carrito.getId());
        item.setProductoId(productoA.getId());
        item.setCantidad(2);
        item.setPrecio(productoA.getPrecio());
        item.setSubtotal(productoA.getPrecio().multiply(BigDecimal.valueOf(2)));
        carritoDetalleRepository.save(item);

        // El cliente intenta enviar costoEnvio negativo o fraudulento por query params
        mockMvc.perform(post("/api/pedidos")
                        .header("Authorization", "Bearer " + tokenClienteA)
                        .param("carritoId", carrito.getId().toString())
                        .param("direccionId", dirA.getId().toString())
                        .param("costoEnvio", "-99999.00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.costoEnvio", is(2000)))
                .andExpect(jsonPath("$.subtotal", is(50000.0)))
                .andExpect(jsonPath("$.total", is(52000.0)))
                .andExpect(jsonPath("$.estado", is("PENDIENTE")));
    }

    // ==========================================
    // 5. TRANSICIONES ILEGALES DE ESTADOS
    // ==========================================

    @Test
    @DisplayName("Estados: No se permite transición ilegal de estados de pedido")
    void testTransicionIlegalPedido() throws Exception {
        Direccion dirA = new Direccion();
        dirA.setUsuarioId(clienteA.getId());
        dirA.setAlias("Casa Test");
        dirA.setDireccion("Calle 100");
        dirA.setCiudad("Bogotá");
        dirA = direccionRepository.save(dirA);

        Pedido p = new Pedido();
        p.setUsuarioId(clienteA.getId());
        p.setSucursalId(sucursalA.getId());
        p.setDireccionId(dirA.getId());
        p.setEstado("PENDIENTE");
        p.setSubtotal(new BigDecimal("10000.00"));
        p.setCostoEnvio(BigDecimal.ZERO);
        p.setTotal(new BigDecimal("10000.00"));
        p = pedidoRepository.save(p);

        // Comercio intenta saltar a "LISTO" sin pasar por "CONFIRMADO" y "PREPARANDO"
        mockMvc.perform(put("/api/pedidos/" + p.getId() + "/listo")
                        .header("Authorization", "Bearer " + tokenComercioA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Transición de estado no permitida")));
    }

    // ==========================================
    // 6. FLUJO Y ASIGNACIÓN DE DOMICILIARIOS
    // ==========================================

    @Test
    @DisplayName("Domiciliario: No puede entregar un pedido que no le ha sido asignado")
    void testDomiciliarioNoPuedeEntregarPedidoNoAsignado() throws Exception {
        Direccion dirA = new Direccion();
        dirA.setUsuarioId(clienteA.getId());
        dirA.setAlias("Casa");
        dirA.setDireccion("Calle 5");
        dirA.setCiudad("Bogotá");
        dirA = direccionRepository.save(dirA);

        Pedido p = new Pedido();
        p.setUsuarioId(clienteA.getId());
        p.setSucursalId(sucursalA.getId());
        p.setDireccionId(dirA.getId());
        p.setEstado("EN_CAMINO");
        p.setDomiciliarioId(domiciliarioUserA.getId()); // Asignado al domiciliario A
        p.setSubtotal(new BigDecimal("20000.00"));
        p.setCostoEnvio(BigDecimal.ZERO);
        p.setTotal(new BigDecimal("20000.00"));
        p = pedidoRepository.save(p);

        // Domiciliario B intenta marcarlo como entregado
        mockMvc.perform(put("/api/pedidos/" + p.getId() + "/entregar")
                        .header("Authorization", "Bearer " + tokenDomiciliarioB))
                .andExpect(result -> assertTrue(
                        result.getResponse().getStatus() == 403 || result.getResponse().getStatus() == 400,
                        "Debe rechazar que un domiciliario ajeno entregue"));
    }

    // ==========================================
    // 7. VALIDACIONES DE NEGOCIO NEGATIVAS
    // ==========================================

    @Test
    @DisplayName("Validación: No permite crear producto con precio <= 0")
    void testValidacionProductoPrecioNegativoOCero() throws Exception {
        ProductoRequestDTO req = new ProductoRequestDTO();
        req.setSucursalId(sucursalA.getId());
        req.setCategoriaId(catProd.getId());
        req.setNombre("Producto Inválido");
        req.setPrecio(BigDecimal.ZERO);

        mockMvc.perform(post("/api/productos")
                        .header("Authorization", "Bearer " + tokenComercioA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Validación: No permite agregar cantidad negativa o cero al carrito")
    void testValidacionCantidadInvalidaEnCarrito() throws Exception {
        Carrito carrito = carritoRepository.findByUsuarioIdAndSucursalId(clienteA.getId(), sucursalA.getId())
                .orElseGet(() -> {
                    Carrito c = new Carrito();
                    c.setUsuarioId(clienteA.getId());
                    c.setSucursalId(sucursalA.getId());
                    return carritoRepository.save(c);
                });

        AgregarCarritoDTO req = new AgregarCarritoDTO();
        req.setCarritoId(carrito.getId());
        req.setProductoId(productoA.getId());
        req.setCantidad(0);

        mockMvc.perform(post("/api/carritos/productos")
                        .header("Authorization", "Bearer " + tokenClienteA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Validación: Dirección con coordenadas geográficas fuera de rango es rechazada")
    void testValidacionCoordenadasGeograficasFueraDeRango() throws Exception {
        Direccion dir = new Direccion();
        dir.setAlias("Polo Norte Imposible");
        dir.setDireccion("Calle 100");
        dir.setCiudad("Bogotá");
        dir.setLatitud(new BigDecimal("95.000000")); // Máximo es 90

        mockMvc.perform(post("/api/direcciones")
                        .header("Authorization", "Bearer " + tokenClienteA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dir)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("latitud")));
    }

    // ==========================================
    // 8. WEBHOOK WOMPI & CATEGORIAS ADMIN
    // ==========================================

    @Test
    @DisplayName("Seguridad: Webhook de Wompi con firma inválida es rechazado")
    void testWompiWebhookFirmaInvalidaRechazada() throws Exception {
        String eventPayload = """
                {
                    "event": "transaction.updated",
                    "data": {
                        "transaction": {
                            "id": "wompi-test-123",
                            "reference": "FASTGO-TEST-REF",
                            "status": "APPROVED",
                            "amount_in_cents": 2500000
                        }
                    },
                    "timestamp": 1690000000,
                    "signature": {
                        "properties": ["transaction.id", "transaction.status", "transaction.amount_in_cents"],
                        "checksum": "checksum_falso_invalido_12345"
                    }
                }
                """;

        mockMvc.perform(post("/api/pagos/wompi/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(eventPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Firma de evento")));
    }

    @Test
    @DisplayName("Categorías: Admin puede actualizar y eliminar categorías no vinculadas")
    void testAdminActualizaYEliminaCategoria() throws Exception {
        CategoriaProducto nueva = new CategoriaProducto();
        nueva.setNombre("Temporal Para Borrar");
        nueva.setActivo(true);
        nueva = categoriaProductoRepository.save(nueva);

        CategoriaProducto actualizacion = new CategoriaProducto();
        actualizacion.setNombre("Temporal Modificada");
        actualizacion.setActivo(true);

        // Actualizar
        mockMvc.perform(put("/api/categorias-producto/" + nueva.getId())
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(actualizacion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre", is("Temporal Modificada")));

        // Eliminar
        mockMvc.perform(delete("/api/categorias-producto/" + nueva.getId())
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isNoContent());

        assertTrue(categoriaProductoRepository.findById(nueva.getId()).isEmpty());
    }

    @Test
    @DisplayName("Categorías: No se permite eliminar categoría con productos asociados")
    void testNoEliminarCategoriaConProductosAsociados() throws Exception {
        mockMvc.perform(delete("/api/categorias-producto/" + catProd.getId())
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("productos asociados")));
    }
}
