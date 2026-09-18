package com.fastgo.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fastgo.dto.*;
import com.fastgo.entity.*;
import com.fastgo.jwt.JwtService;
import com.fastgo.repository.*;
import com.fastgo.service.TarifaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EndToEndOfficialFlowTests {

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
    private ComercioRepository comercioRepository;

    @Autowired
    private SucursalRepository sucursalRepository;

    @Autowired
    private CategoriaComercioRepository categoriaComercioRepository;

    @Autowired
    private CategoriaProductoRepository categoriaProductoRepository;

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
    private EncomiendaRepository encomiendaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private TarifaService tarifaService;

    private Rol rolCliente;
    private Rol rolComercio;
    private Rol rolDomiciliario;

    private Usuario clienteUser;
    private Usuario comercioUser;
    private Usuario domiciliarioUserA;
    private Usuario domiciliarioUserB;

    private String tokenCliente;
    private String tokenComercio;
    private String tokenDomiciliarioA;
    private String tokenDomiciliarioB;

    private Comercio testComercio;
    private Sucursal testSucursal;
    private Producto testProducto;

    @BeforeEach
    void setUp() {
        rolCliente = rolRepository.findByNombreIgnoreCase("CLIENTE").orElseGet(() -> {
            Rol r = new Rol();
            r.setNombre("CLIENTE");
            return rolRepository.save(r);
        });

        rolComercio = rolRepository.findByNombreIgnoreCase("COMERCIO").orElseGet(() -> {
            Rol r = new Rol();
            r.setNombre("COMERCIO");
            return rolRepository.save(r);
        });

        rolDomiciliario = rolRepository.findByNombreIgnoreCase("DOMICILIARIO").orElseGet(() -> {
            Rol r = new Rol();
            r.setNombre("DOMICILIARIO");
            return rolRepository.save(r);
        });

        clienteUser = crearOActualizarUsuario("flow.cliente@fastgo.com", "Cliente", "Flow", "3101112233", rolCliente);
        comercioUser = crearOActualizarUsuario("flow.comercio@fastgo.com", "Comercio", "Flow", "3104445566", rolComercio);
        domiciliarioUserA = crearOActualizarUsuario("flow.domiA@fastgo.com", "Domi", "A", "3107778899", rolDomiciliario);
        domiciliarioUserB = crearOActualizarUsuario("flow.domiB@fastgo.com", "Domi", "B", "3100001122", rolDomiciliario);

        tokenCliente = jwtService.generarToken(clienteUser.getCorreo(), "CLIENTE");
        tokenComercio = jwtService.generarToken(comercioUser.getCorreo(), "COMERCIO");
        tokenDomiciliarioA = jwtService.generarToken(domiciliarioUserA.getCorreo(), "DOMICILIARIO");
        tokenDomiciliarioB = jwtService.generarToken(domiciliarioUserB.getCorreo(), "DOMICILIARIO");

        CategoriaComercio catCom = categoriaComercioRepository.findAll().stream().findFirst().orElseGet(() -> {
            CategoriaComercio c = new CategoriaComercio();
            c.setNombre("Restaurantes Flow");
            c.setActivo(true);
            return categoriaComercioRepository.save(c);
        });

        testComercio = comercioRepository.findByUsuarioId(comercioUser.getId()).orElseGet(() -> {
            Comercio c = new Comercio();
            c.setUsuario(comercioUser);
            c.setCategoria(catCom);
            c.setNombre("Burger Fast Flow");
            c.setActivo(true);
            c.setPausaManual(false);
            c.setMetodosPago("EFECTIVO,TARJETA,PSE,TRANSFERENCIA");
            c.setHoraApertura(java.time.LocalTime.of(6, 0));
            c.setHoraCierre(java.time.LocalTime.of(23, 59));
            c.setDiasAtencion("1,2,3,4,5,6,7");
            return comercioRepository.save(c);
        });
        testComercio.setActivo(true);
        testComercio.setPausaManual(false);
        testComercio.setDiasAtencion("1,2,3,4,5,6,7");
        testComercio = comercioRepository.save(testComercio);

        testSucursal = sucursalRepository.findByComercioId(testComercio.getId()).stream().findFirst().orElseGet(() -> {
            Sucursal s = new Sucursal();
            s.setComercioId(testComercio.getId());
            s.setNombre("Sucursal Principal Flow");
            s.setDireccion("Cra 7 # 72-01");
            s.setCiudad("Bogotá");
            s.setLatitud(new BigDecimal("4.6533000"));
            s.setLongitud(new BigDecimal("-74.0560000"));
            s.setAbierta(true);
            return sucursalRepository.save(s);
        });

        CategoriaProducto catProd = categoriaProductoRepository.findAll().stream().findFirst().orElseGet(() -> {
            CategoriaProducto cp = new CategoriaProducto();
            cp.setNombre("Hamburguesas Flow");
            cp.setActivo(true);
            return categoriaProductoRepository.save(cp);
        });

        testProducto = productoRepository.findBySucursalId(testSucursal.getId()).stream().findFirst().orElseGet(() -> {
            Producto p = new Producto();
            p.setSucursalId(testSucursal.getId());
            p.setCategoriaId(catProd.getId());
            p.setNombre("Super Burger Flow");
            p.setPrecio(new BigDecimal("18000.00"));
            p.setDisponible(true);
            p.setStock(10);
            return productoRepository.save(p);
        });
        testProducto.setDisponible(true);
        testProducto.setStock(10);
        testProducto = productoRepository.save(testProducto);
    }

    private Usuario crearOActualizarUsuario(String correo, String nombre, String apellido, String telefono, Rol rol) {
        return usuarioRepository.findByCorreoAndRolId(correo, rol.getId()).orElseGet(() -> {
            Usuario u = new Usuario();
            u.setNombre(nombre);
            u.setApellido(apellido);
            u.setCorreo(correo);
            u.setTelefono(telefono);
            u.setPassword(passwordEncoder.encode("Password123"));
            u.setRol(rol);
            u.setEstado(true);
            return usuarioRepository.save(u);
        });
    }

    // =========================================================================
    // 1. MULTI-ROL Y TELÉFONO COMPARTIDO
    // =========================================================================

    @Test
    @DisplayName("Multi-rol: Mismo número de teléfono permitido en cuentas con diferente correo")
    void testPermitirMismoTelefonoEnCuentasDistintas() throws Exception {
        String sharedPhone = "3199998877";
        long now = System.currentTimeMillis();
        String email1 = "juan.c." + now + "@fastgo.com";
        String email2 = "juan.d." + (now + 1) + "@fastgo.com";

        RegistroUsuarioRequest req1 = new RegistroUsuarioRequest();
        req1.setNombre("Juan");
        req1.setApellido("Cliente");
        req1.setCorreo(email1);
        req1.setTelefono(sharedPhone);
        req1.setPassword("Password123");
        req1.setRol("CLIENTE");

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isOk());

        RegistroUsuarioRequest req2 = new RegistroUsuarioRequest();
        req2.setNombre("Juan");
        req2.setApellido("Repartidor");
        req2.setCorreo(email2);
        req2.setTelefono(sharedPhone);
        req2.setPassword("Password123");
        req2.setRol("DOMICILIARIO");

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isOk());
    }

    // =========================================================================
    // 2. FLUJO COMPLETO DE COMPRA, COCINA, DESPACHO Y CONCURRENCIA
    // =========================================================================

    @Test
    @DisplayName("Flujo Oficial: Compra -> Cocina -> Listo -> Concurrencia Couriers -> En Camino -> Entregado")
    void testFlujoOficialCompletoConConcurrencia() throws Exception {
        // A. Cliente crea dirección
        for (Direccion d : direccionRepository.findByUsuarioId(clienteUser.getId())) {
            d.setPrincipal(false);
            direccionRepository.save(d);
        }

        Direccion dir = new Direccion();
        dir.setUsuarioId(clienteUser.getId());
        dir.setAlias("Apartamento Flow");
        dir.setDireccion("Calle 80 # 11-42");
        dir.setCiudad("Bogotá");
        dir.setLatitud(new BigDecimal("4.6650000"));
        dir.setLongitud(new BigDecimal("-74.0580000"));
        dir.setPrincipal(true);
        dir = direccionRepository.save(dir);

        // B. Cliente prepara Carrito
        Carrito carrito = carritoRepository.findByUsuarioIdAndSucursalId(clienteUser.getId(), testSucursal.getId())
                .orElseGet(() -> {
                    Carrito c = new Carrito();
                    c.setUsuarioId(clienteUser.getId());
                    c.setSucursalId(testSucursal.getId());
                    return carritoRepository.save(c);
                });
        carritoDetalleRepository.deleteAll(carritoDetalleRepository.findByCarritoId(carrito.getId()));

        int initialStock = testProducto.getStock();
        int qtyToBuy = 2;

        CarritoDetalle cd = new CarritoDetalle();
        cd.setCarritoId(carrito.getId());
        cd.setProductoId(testProducto.getId());
        cd.setCantidad(qtyToBuy);
        cd.setPrecio(testProducto.getPrecio());
        cd.setSubtotal(testProducto.getPrecio().multiply(BigDecimal.valueOf(qtyToBuy)));
        carritoDetalleRepository.save(cd);

        // C. Cliente finaliza Checkout
        MvcResult resPedido = mockMvc.perform(post("/api/pedidos")
                        .header("Authorization", "Bearer " + tokenCliente)
                        .param("carritoId", carrito.getId().toString())
                        .param("direccionId", dir.getId().toString())
                        .param("metodoPago", "EFECTIVO")
                        .param("observaciones", "Timbre 301, sin cebolla"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado", is("PENDIENTE")))
                .andExpect(jsonPath("$.subtotal", is(36000.0)))
                .andExpect(jsonPath("$.costoEnvio", greaterThanOrEqualTo(2000)))
                .andExpect(jsonPath("$.total", greaterThan(36000.0)))
                .andReturn();

        JsonNode pedidoJson = objectMapper.readTree(resPedido.getResponse().getContentAsString());
        int pedidoId = pedidoJson.get("id").asInt();

        // Verificar descuento de Stock
        Producto prodActualizado = productoRepository.findById(testProducto.getId()).orElseThrow();
        assertEquals(initialStock - qtyToBuy, prodActualizado.getStock(), "El stock debe decrementar autoritativamente");

        // D. Comercio ve el pedido con enriquecimiento (clienteNombre, clienteTelefono, direccionTexto)
        MvcResult resConsultaComercio = mockMvc.perform(get("/api/pedidos/sucursal/" + testSucursal.getId())
                        .header("Authorization", "Bearer " + tokenComercio))
                .andExpect(status().isOk())
                .andReturn();

        String bodyComercio = resConsultaComercio.getResponse().getContentAsString();
        assertTrue(bodyComercio.contains("Cliente Flow") || bodyComercio.contains("flow.cliente"), "Debe enriquecer nombre del cliente");

        // E. Comercio consulta productos a empacar (/detalles)
        mockMvc.perform(get("/api/pedidos/" + pedidoId + "/detalles")
                        .header("Authorization", "Bearer " + tokenComercio))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].productoNombre", notNullValue()))
                .andExpect(jsonPath("$[0].cantidad", is(qtyToBuy)));

        // F. Comercio confirma el pedido: PENDIENTE -> CONFIRMADO
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/confirmar")
                        .header("Authorization", "Bearer " + tokenComercio))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado", is("CONFIRMADO")));

        // G. Comercio inicia preparación: CONFIRMADO -> PREPARANDO
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/preparar")
                        .header("Authorization", "Bearer " + tokenComercio))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado", is("PREPARANDO")));

        // H. Comercio marca LISTO: PREPARANDO -> LISTO (Publicación automática)
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/listo")
                        .header("Authorization", "Bearer " + tokenComercio))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado", is("LISTO")));

        // I. Pedido aparece en la lista de pedidos disponibles para domiciliarios
        mockMvc.perform(get("/api/pedidos/domiciliario/disponibles")
                        .header("Authorization", "Bearer " + tokenDomiciliarioA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem(pedidoId)));

        // J. CONCURRENCIA: Domiciliario A y Domiciliario B intentan tomar el mismo pedido
        // Domiciliario A toma el pedido
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/tomar")
                        .header("Authorization", "Bearer " + tokenDomiciliarioA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado", is("EN_CAMINO")))
                .andExpect(jsonPath("$.domiciliarioId", is(domiciliarioUserA.getId())));

        // Domiciliario B intenta tomar el mismo pedido ya asignado -> DEBE FALLAR con 400 Bad Request
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/tomar")
                        .header("Authorization", "Bearer " + tokenDomiciliarioB))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("El pedido ya no está disponible")));

        // K. Domiciliario A entrega el pedido: EN_CAMINO -> ENTREGADO
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/entregar")
                        .header("Authorization", "Bearer " + tokenDomiciliarioA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado", is("ENTREGADO")));

        // L. Cliente ve su pedido como ENTREGADO
        mockMvc.perform(get("/api/pedidos/" + pedidoId)
                        .header("Authorization", "Bearer " + tokenCliente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado", is("ENTREGADO")));
    }

    // =========================================================================
    // 3. CONTROL DE STOCK Y TIENDA PAUSADA
    // =========================================================================

    @Test
    @DisplayName("Validación: No permite comprar si la tienda está pausada o cerrada")
    void testBloqueoPedidoTiendaPausada() throws Exception {
        testComercio.setPausaManual(true);
        comercioRepository.save(testComercio);

        Direccion dir = new Direccion();
        dir.setUsuarioId(clienteUser.getId());
        dir.setAlias("Pausa Test");
        dir.setDireccion("Cra 10 # 20");
        dir.setCiudad("Bogotá");
        dir = direccionRepository.save(dir);

        Carrito c = carritoRepository.findByUsuarioIdAndSucursalId(clienteUser.getId(), testSucursal.getId())
                .orElseGet(() -> {
                    Carrito cr = new Carrito();
                    cr.setUsuarioId(clienteUser.getId());
                    cr.setSucursalId(testSucursal.getId());
                    return carritoRepository.save(cr);
                });
        carritoDetalleRepository.deleteAll(carritoDetalleRepository.findByCarritoId(c.getId()));

        CarritoDetalle cd = new CarritoDetalle();
        cd.setCarritoId(c.getId());
        cd.setProductoId(testProducto.getId());
        cd.setCantidad(1);
        cd.setPrecio(testProducto.getPrecio());
        cd.setSubtotal(testProducto.getPrecio());
        carritoDetalleRepository.save(cd);

        mockMvc.perform(post("/api/pedidos")
                        .header("Authorization", "Bearer " + tokenCliente)
                        .param("carritoId", c.getId().toString())
                        .param("direccionId", dir.getId().toString())
                        .param("metodoPago", "EFECTIVO"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("cerrado")));

        // Restaurar estado
        testComercio.setPausaManual(false);
        comercioRepository.save(testComercio);
    }

    @Test
    @DisplayName("Validación: No permite comprar más unidades que el stock disponible")
    void testRechazoStockInsuficiente() throws Exception {
        testProducto.setStock(1);
        testProducto.setDisponible(true);
        productoRepository.save(testProducto);

        Direccion dir = new Direccion();
        dir.setUsuarioId(clienteUser.getId());
        dir.setAlias("Stock Test");
        dir.setDireccion("Calle 50 # 10");
        dir.setCiudad("Bogotá");
        dir = direccionRepository.save(dir);

        Carrito c = carritoRepository.findByUsuarioIdAndSucursalId(clienteUser.getId(), testSucursal.getId())
                .orElseGet(() -> {
                    Carrito cr = new Carrito();
                    cr.setUsuarioId(clienteUser.getId());
                    cr.setSucursalId(testSucursal.getId());
                    return carritoRepository.save(cr);
                });
        carritoDetalleRepository.deleteAll(carritoDetalleRepository.findByCarritoId(c.getId()));

        // Intentar comprar 2 unidades cuando stock es 1
        CarritoDetalle cd = new CarritoDetalle();
        cd.setCarritoId(c.getId());
        cd.setProductoId(testProducto.getId());
        cd.setCantidad(2);
        cd.setPrecio(testProducto.getPrecio());
        cd.setSubtotal(testProducto.getPrecio().multiply(BigDecimal.valueOf(2)));
        carritoDetalleRepository.save(cd);

        mockMvc.perform(post("/api/pedidos")
                        .header("Authorization", "Bearer " + tokenCliente)
                        .param("carritoId", c.getId().toString())
                        .param("direccionId", dir.getId().toString())
                        .param("metodoPago", "EFECTIVO"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Stock insuficiente")));
    }
}
