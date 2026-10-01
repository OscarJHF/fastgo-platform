package com.fastgo.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fastgo.dto.*;
import com.fastgo.entity.*;
import com.fastgo.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class TarifaComercioAndBancolombiaTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private CategoriaComercioRepository categoriaComercioRepository;

    @Autowired
    private CategoriaProductoRepository categoriaProductoRepository;

    @Autowired
    private DireccionRepository direccionRepository;

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
    private UsuarioRepository usuarioRepository;

    private Integer categoriaComercioId;
    private Integer categoriaProductoId;

    private static class AuthResult {
        String token;
        Usuario usuario;
    }

    @BeforeEach
    void setUp() {
        for (String roleName : new String[]{"CLIENTE", "COMERCIO", "DOMICILIARIO"}) {
            if (rolRepository.findByNombreIgnoreCase(roleName).isEmpty()) {
                Rol r = new Rol();
                r.setNombre(roleName);
                rolRepository.save(r);
            }
        }
        if (categoriaComercioRepository.count() == 0) {
            CategoriaComercio cat = new CategoriaComercio();
            cat.setNombre("Restaurantes y Comidas");
            cat.setDescripcion("Restaurantes y cafeterías");
            cat.setActivo(true);
            categoriaComercioRepository.save(cat);
        }
        categoriaComercioId = categoriaComercioRepository.findAll().get(0).getId();

        if (categoriaProductoRepository.count() == 0) {
            CategoriaProducto cp = new CategoriaProducto();
            cp.setNombre("General");
            cp.setDescripcion("Productos generales");
            cp.setActivo(true);
            categoriaProductoRepository.save(cp);
        }
        categoriaProductoId = categoriaProductoRepository.findAll().get(0).getId();
    }

    private AuthResult registrarYLogin(String rol, String nombre) throws Exception {
        String correo = "user." + rol.toLowerCase() + "." + UUID.randomUUID().toString().substring(0, 8) + "@fastgo.com";
        RegistroUsuarioRequest reg = new RegistroUsuarioRequest();
        reg.setNombre(nombre);
        reg.setApellido("Test");
        reg.setCorreo(correo);
        reg.setTelefono("3101234567");
        reg.setPassword("Password123!");
        reg.setRol(rol);

        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk());

        LoginRequest login = new LoginRequest();
        login.setCorreo(correo);
        login.setPassword("Password123!");

        MvcResult res = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResult auth = new AuthResult();
        auth.token = objectMapper.readTree(res.getResponse().getContentAsString()).get("token").asText();
        auth.usuario = usuarioRepository.findByCorreo(correo).orElseThrow();
        return auth;
    }

    @Test
    @DisplayName("1. La tarifa de domicilio en comercio debe ser >= $2.000 COP, rechazando valores menores, 0 o negativos")
    void testTarifaMinimaValidation() throws Exception {
        AuthResult authComercio = registrarYLogin("COMERCIO", "ComercioTarifa");

        // Intentar crear con tarifa 1500 (menor a 2000) -> 400 Bad Request
        ComercioRequestDTO invalidReq = new ComercioRequestDTO();
        invalidReq.setNombre("Tienda Invalida");
        invalidReq.setCategoriaId(categoriaComercioId);
        invalidReq.setTarifaDomicilio(new BigDecimal("1500.00"));

        mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + authComercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest());

        // Intentar crear con tarifa 0 -> 400 Bad Request
        invalidReq.setTarifaDomicilio(BigDecimal.ZERO);
        mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + authComercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest());

        // Intentar crear con tarifa negativa -> 400 Bad Request
        invalidReq.setTarifaDomicilio(new BigDecimal("-500.00"));
        mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + authComercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest());

        // Crear con tarifa válida >= 2000 -> 200 OK
        ComercioRequestDTO validReq = new ComercioRequestDTO();
        validReq.setNombre("Tienda Valida Tarifa");
        validReq.setCategoriaId(categoriaComercioId);
        validReq.setTarifaDomicilio(new BigDecimal("3500.00"));

        mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + authComercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tarifaDomicilio").value(3500.00));
    }

    @Test
    @DisplayName("2. Configuración de Bancolombia: activar/desactivar y validar datos de cuenta")
    void testConfiguracionBancolombia() throws Exception {
        AuthResult authComercio = registrarYLogin("COMERCIO", "ComercioBanco");

        // Activar Bancolombia sin datos requeridos -> 400 Bad Request
        ComercioRequestDTO reqIncompleto = new ComercioRequestDTO();
        reqIncompleto.setNombre("Tienda Bancolombia Fallo");
        reqIncompleto.setCategoriaId(categoriaComercioId);
        reqIncompleto.setBancolombiaActivo(true);
        reqIncompleto.setBancolombiaNumeroCuenta(""); // vacio

        mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + authComercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqIncompleto)))
                .andExpect(status().isBadRequest());

        // Crear con Bancolombia activo y datos completos -> 200 OK
        ComercioRequestDTO reqValido = new ComercioRequestDTO();
        reqValido.setNombre("Tienda Bancolombia Exito");
        reqValido.setCategoriaId(categoriaComercioId);
        reqValido.setTarifaDomicilio(new BigDecimal("2500.00"));
        reqValido.setBancolombiaActivo(true);
        reqValido.setBancolombiaTipoCuenta("Ahorros");
        reqValido.setBancolombiaNumeroCuenta("123-456789-01");
        reqValido.setBancolombiaTitular("Comercio Oficial S.A.S");
        reqValido.setBancolombiaDocTitular("901234567-8");

        MvcResult res = mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + authComercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqValido)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bancolombiaActivo").value(true))
                .andExpect(jsonPath("$.bancolombiaNumeroCuenta").value("123-456789-01"))
                .andExpect(jsonPath("$.bancolombiaTitular").value("Comercio Oficial S.A.S"))
                .andReturn();

        Integer storeId = objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asInt();

        // Desactivar Bancolombia mediante actualización
        reqValido.setBancolombiaActivo(false);
        mockMvc.perform(put("/api/comercios/" + storeId)
                .header("Authorization", "Bearer " + authComercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqValido)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bancolombiaActivo").value(false));
    }

    @Test
    @DisplayName("3. Tarifa de domicilio autoritativa y congelada en pedido frente a cambios posteriores del comercio")
    void testTarifaCongeladaEnPedido() throws Exception {
        // 1. Comercio con tarifa de $4.500
        AuthResult authComercio = registrarYLogin("COMERCIO", "DonPepito");
        ComercioRequestDTO storeReq = new ComercioRequestDTO();
        storeReq.setNombre("Pizzería Pepito");
        storeReq.setCategoriaId(categoriaComercioId);
        storeReq.setTarifaDomicilio(new BigDecimal("4500.00"));
        MvcResult storeRes = mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + authComercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(storeReq)))
                .andExpect(status().isOk())
                .andReturn();
        Integer storeId = objectMapper.readTree(storeRes.getResponse().getContentAsString()).get("id").asInt();

        // Sucursal auto-creada
        Sucursal sucursal = sucursalRepository.findByComercioId(storeId).get(0);

        // Crear Producto en la sucursal
        Producto prod = new Producto();
        prod.setSucursalId(sucursal.getId());
        prod.setCategoriaId(categoriaProductoId);
        prod.setNombre("Pizza Pepperoni");
        prod.setPrecio(new BigDecimal("30000.00"));
        prod.setDisponible(true);
        prod.setStock(10);
        prod = productoRepository.save(prod);

        // 2. Cliente crea pedido
        AuthResult authCliente = registrarYLogin("CLIENTE", "JuanCliente");

        Direccion dir = new Direccion();
        dir.setUsuarioId(authCliente.usuario.getId());
        dir.setAlias("Casa");
        dir.setDireccion("Calle 100 # 15-20");
        dir.setCiudad("Bogotá");
        dir.setPrincipal(true);
        dir = direccionRepository.save(dir);

        // Carrito
        Carrito carrito = new Carrito();
        carrito.setUsuarioId(authCliente.usuario.getId());
        carrito.setSucursalId(sucursal.getId());
        carrito = carritoRepository.save(carrito);

        CarritoDetalle cd = new CarritoDetalle();
        cd.setCarritoId(carrito.getId());
        cd.setProductoId(prod.getId());
        cd.setCantidad(1);
        cd.setPrecio(prod.getPrecio());
        cd.setSubtotal(prod.getPrecio());
        carritoDetalleRepository.save(cd);

        // Cliente intenta inyectar costoEnvio = 500 COP (debe ser ignorado por backend, aplicando los $4.500 del comercio)
        MvcResult pedidoRes = mockMvc.perform(post("/api/pedidos")
                .header("Authorization", "Bearer " + authCliente.token)
                .param("carritoId", carrito.getId().toString())
                .param("direccionId", dir.getId().toString())
                .param("costoEnvio", "500.00")
                .param("metodoPago", "EFECTIVO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.costoEnvio").value(4500.00))
                .andExpect(jsonPath("$.total").value(34500.00)) // 30000 + 4500
                .andReturn();

        Integer pedidoId = objectMapper.readTree(pedidoRes.getResponse().getContentAsString()).get("id").asInt();

        // 3. Comercio modifica su tarifa a $7.000 COP
        storeReq.setTarifaDomicilio(new BigDecimal("7000.00"));
        mockMvc.perform(put("/api/comercios/" + storeId)
                .header("Authorization", "Bearer " + authComercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(storeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tarifaDomicilio").value(7000.00));

        // 4. El pedido histórico DEBE seguir congelado en $4.500 COP
        mockMvc.perform(get("/api/pedidos/" + pedidoId)
                .header("Authorization", "Bearer " + authCliente.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.costoEnvio").value(4500.00))
                .andExpect(jsonPath("$.total").value(34500.00));
    }

    @Test
    @DisplayName("4. Flujo Bancolombia: Comprobante obligatorio, estado PENDIENTE_VERIFICACION, y bloqueo crítico de despacho")
    void testBancolombiaFlujoYBloqueoDespacho() throws Exception {
        // 1. Comercio habilita Bancolombia
        AuthResult authComercio = registrarYLogin("COMERCIO", "DonBancolombia");
        ComercioRequestDTO storeReq = new ComercioRequestDTO();
        storeReq.setNombre("Hamburguesas Gourmet");
        storeReq.setCategoriaId(categoriaComercioId);
        storeReq.setTarifaDomicilio(new BigDecimal("3000.00"));
        storeReq.setBancolombiaActivo(true);
        storeReq.setBancolombiaTipoCuenta("Ahorros");
        storeReq.setBancolombiaNumeroCuenta("987-654321-00");
        storeReq.setBancolombiaTitular("Gourmet Burger SAS");
        storeReq.setBancolombiaDocTitular("900111222-3");

        MvcResult storeRes = mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + authComercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(storeReq)))
                .andExpect(status().isOk())
                .andReturn();
        Integer storeId = objectMapper.readTree(storeRes.getResponse().getContentAsString()).get("id").asInt();
        Sucursal sucursal = sucursalRepository.findByComercioId(storeId).get(0);

        Producto prod = new Producto();
        prod.setSucursalId(sucursal.getId());
        prod.setCategoriaId(categoriaProductoId);
        prod.setNombre("Burger Master");
        prod.setPrecio(new BigDecimal("25000.00"));
        prod.setDisponible(true);
        prod.setStock(20);
        prod = productoRepository.save(prod);

        // 2. Cliente
        AuthResult authCliente = registrarYLogin("CLIENTE", "MariaCliente");

        Direccion dir = new Direccion();
        dir.setUsuarioId(authCliente.usuario.getId());
        dir.setAlias("Trabajo");
        dir.setDireccion("Carrera 7 # 72-10");
        dir.setCiudad("Bogotá");
        dir.setPrincipal(true);
        dir = direccionRepository.save(dir);

        // Carrito 1: Intento sin comprobante con BANCOLOMBIA -> Debe fallar 400
        Carrito c1 = new Carrito();
        c1.setUsuarioId(authCliente.usuario.getId());
        c1.setSucursalId(sucursal.getId());
        c1 = carritoRepository.save(c1);

        CarritoDetalle cd1 = new CarritoDetalle();
        cd1.setCarritoId(c1.getId());
        cd1.setProductoId(prod.getId());
        cd1.setCantidad(1);
        cd1.setPrecio(prod.getPrecio());
        cd1.setSubtotal(prod.getPrecio());
        carritoDetalleRepository.save(cd1);

        mockMvc.perform(post("/api/pedidos")
                .header("Authorization", "Bearer " + authCliente.token)
                .param("carritoId", c1.getId().toString())
                .param("direccionId", dir.getId().toString())
                .param("metodoPago", "BANCOLOMBIA"))
                .andExpect(status().isBadRequest());

        // Carrito 1 sigue existiendo con su detalle ya que el primer intento falló 400.
        // Ahora reintenta con comprobante -> Debe crearse con PENDIENTE_VERIFICACION
        MvcResult pedidoRes = mockMvc.perform(post("/api/pedidos")
                .header("Authorization", "Bearer " + authCliente.token)
                .param("carritoId", c1.getId().toString())
                .param("direccionId", dir.getId().toString())
                .param("metodoPago", "BANCOLOMBIA")
                .param("comprobantePagoUrl", "/api/uploads/comprobante-test-123.png"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.metodoPago").value("BANCOLOMBIA"))
                .andExpect(jsonPath("$.estadoPago").value("PENDIENTE_VERIFICACION"))
                .andExpect(jsonPath("$.comprobantePagoUrl").value("/api/uploads/comprobante-test-123.png"))
                .andReturn();

        Integer pedidoId = objectMapper.readTree(pedidoRes.getResponse().getContentAsString()).get("id").asInt();

        // 3. Flujo en comercio: Confirmar y Preparar
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/confirmar")
                .header("Authorization", "Bearer " + authComercio.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CONFIRMADO"));

        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/preparar")
                .header("Authorization", "Bearer " + authComercio.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("PREPARANDO"));

        // 4. REGLA CRÍTICA: Intentar marcar LISTO con pago PENDIENTE_VERIFICACION -> BLOQUEADO
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/listo")
                .header("Authorization", "Bearer " + authComercio.token))
                .andExpect(status().isBadRequest());

        // 5. Comercio APROBAR PAGO
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/aprobar-pago")
                .header("Authorization", "Bearer " + authComercio.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPago").value("APROBADO"));

        // 6. Ahora que está APROBADO, el pedido SI puede pasar a LISTO (despachado)
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/listo")
                .header("Authorization", "Bearer " + authComercio.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("LISTO"));
    }

    @Test
    @DisplayName("5. Rechazo de pago Bancolombia: cancela el pedido, restaura stock y registra motivo")
    void testRechazoPagoBancolombia() throws Exception {
        AuthResult authComercio = registrarYLogin("COMERCIO", "DonRechazo");
        ComercioRequestDTO storeReq = new ComercioRequestDTO();
        storeReq.setNombre("Sushi Express");
        storeReq.setCategoriaId(categoriaComercioId);
        storeReq.setTarifaDomicilio(new BigDecimal("3500.00"));
        storeReq.setBancolombiaActivo(true);
        storeReq.setBancolombiaNumeroCuenta("111-222-333");
        storeReq.setBancolombiaTitular("Sushi Express");

        MvcResult storeRes = mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + authComercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(storeReq)))
                .andExpect(status().isOk())
                .andReturn();
        Integer storeId = objectMapper.readTree(storeRes.getResponse().getContentAsString()).get("id").asInt();
        Sucursal sucursal = sucursalRepository.findByComercioId(storeId).get(0);

        Producto prod = new Producto();
        prod.setSucursalId(sucursal.getId());
        prod.setCategoriaId(categoriaProductoId);
        prod.setNombre("Sushi Roll");
        prod.setPrecio(new BigDecimal("22000.00"));
        prod.setDisponible(true);
        prod.setStock(5);
        prod = productoRepository.save(prod);

        AuthResult authCliente = registrarYLogin("CLIENTE", "PedroCliente");

        Direccion dir = new Direccion();
        dir.setUsuarioId(authCliente.usuario.getId());
        dir.setAlias("Apartamento");
        dir.setDireccion("Calle 45 # 13-05");
        dir.setCiudad("Bogotá");
        dir = direccionRepository.save(dir);

        Carrito c = new Carrito();
        c.setUsuarioId(authCliente.usuario.getId());
        c.setSucursalId(sucursal.getId());
        c = carritoRepository.save(c);

        CarritoDetalle cd = new CarritoDetalle();
        cd.setCarritoId(c.getId());
        cd.setProductoId(prod.getId());
        cd.setCantidad(2);
        cd.setPrecio(prod.getPrecio());
        cd.setSubtotal(prod.getPrecio().multiply(BigDecimal.valueOf(2)));
        carritoDetalleRepository.save(cd);

        MvcResult pedidoRes = mockMvc.perform(post("/api/pedidos")
                .header("Authorization", "Bearer " + authCliente.token)
                .param("carritoId", c.getId().toString())
                .param("direccionId", dir.getId().toString())
                .param("metodoPago", "BANCOLOMBIA")
                .param("comprobantePagoUrl", "/api/uploads/comprobante-rechazar.png"))
                .andExpect(status().isOk())
                .andReturn();
        Integer pedidoId = objectMapper.readTree(pedidoRes.getResponse().getContentAsString()).get("id").asInt();

        // Verificar stock decrementado (5 - 2 = 3)
        Producto prodAfter = productoRepository.findById(prod.getId()).orElseThrow();
        assertThat(prodAfter.getStock()).isEqualTo(3);

        // Comercio rechaza el pago
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/rechazar-pago")
                .header("Authorization", "Bearer " + authComercio.token)
                .param("motivo", "Comprobante ilegible / valor no coincide"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPago").value("RECHAZADO"))
                .andExpect(jsonPath("$.estado").value("CANCELADO"));

        // Verificar stock restaurado (3 + 2 = 5)
        Producto prodRestaurado = productoRepository.findById(prod.getId()).orElseThrow();
        assertThat(prodRestaurado.getStock()).isEqualTo(5);
    }

    @Test
    @DisplayName("6. Domiciliario: Información de entrega y asignación atómica anti-colisión")
    void testDomiciliarioAsignacionAtomica() throws Exception {
        // Preparar pedido en estado LISTO
        AuthResult authComercio = registrarYLogin("COMERCIO", "DonAtomic");
        ComercioRequestDTO storeReq = new ComercioRequestDTO();
        storeReq.setNombre("Taquería Átomo");
        storeReq.setCategoriaId(categoriaComercioId);
        storeReq.setTarifaDomicilio(new BigDecimal("5000.00"));

        MvcResult storeRes = mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + authComercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(storeReq)))
                .andExpect(status().isOk())
                .andReturn();
        Integer storeId = objectMapper.readTree(storeRes.getResponse().getContentAsString()).get("id").asInt();
        Sucursal sucursal = sucursalRepository.findByComercioId(storeId).get(0);

        Producto prod = new Producto();
        prod.setSucursalId(sucursal.getId());
        prod.setCategoriaId(categoriaProductoId);
        prod.setNombre("Tacos al Pastor");
        prod.setPrecio(new BigDecimal("18000.00"));
        prod.setDisponible(true);
        prod.setStock(20);
        prod = productoRepository.save(prod);

        AuthResult authCliente = registrarYLogin("CLIENTE", "LauraCliente");

        Direccion dir = new Direccion();
        dir.setUsuarioId(authCliente.usuario.getId());
        dir.setAlias("Oficina");
        dir.setDireccion("Calle 85 # 11-53");
        dir.setCiudad("Bogotá");
        dir = direccionRepository.save(dir);

        Carrito c = new Carrito();
        c.setUsuarioId(authCliente.usuario.getId());
        c.setSucursalId(sucursal.getId());
        c = carritoRepository.save(c);

        CarritoDetalle cd = new CarritoDetalle();
        cd.setCarritoId(c.getId());
        cd.setProductoId(prod.getId());
        cd.setCantidad(1);
        cd.setPrecio(prod.getPrecio());
        cd.setSubtotal(prod.getPrecio());
        carritoDetalleRepository.save(cd);

        MvcResult pedidoRes = mockMvc.perform(post("/api/pedidos")
                .header("Authorization", "Bearer " + authCliente.token)
                .param("carritoId", c.getId().toString())
                .param("direccionId", dir.getId().toString())
                .param("metodoPago", "EFECTIVO"))
                .andExpect(status().isOk())
                .andReturn();
        Integer pedidoId = objectMapper.readTree(pedidoRes.getResponse().getContentAsString()).get("id").asInt();

        // Mover a LISTO
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/confirmar").header("Authorization", "Bearer " + authComercio.token)).andExpect(status().isOk());
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/preparar").header("Authorization", "Bearer " + authComercio.token)).andExpect(status().isOk());
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/listo").header("Authorization", "Bearer " + authComercio.token)).andExpect(status().isOk());

        // 2 Domiciliarios
        AuthResult domi1 = registrarYLogin("DOMICILIARIO", "DomiUno");
        AuthResult domi2 = registrarYLogin("DOMICILIARIO", "DomiDos");

        // Verificar que disponibles contiene origen, destino y tarifa de envío ganada ($5.000)
        mockMvc.perform(get("/api/pedidos/domiciliario/disponibles")
                .header("Authorization", "Bearer " + domi1.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + pedidoId + ")].costoEnvio").value(5000.00))
                .andExpect(jsonPath("$[?(@.id == " + pedidoId + ")].comercioNombre").value("Taquería Átomo"))
                .andExpect(jsonPath("$[?(@.id == " + pedidoId + ")].direccionTexto").value("Calle 85 # 11-53, Bogotá"));

        // Domiciliario 1 toma el pedido exitosamente
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/tomar")
                .header("Authorization", "Bearer " + domi1.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.domiciliarioId").isNumber());

        // Domiciliario 2 intenta tomar el mismo pedido -> debe ser rechazado con 409 CONFLICT
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/tomar")
                .header("Authorization", "Bearer " + domi2.token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Este domicilio ya fue tomado por otro domiciliario."));
    }

    @Test
    @DisplayName("7. Subida de archivos públicos (/api/uploads): solo imágenes JPG, PNG, WEBP, rechaza PDF y ejecutables")
    void testSubidaSeguraArchivos() throws Exception {
        AuthResult authCliente = registrarYLogin("CLIENTE", "UploaderCliente");

        // Subida válida: Imagen PNG real
        MockMultipartFile validImage = new MockMultipartFile(
                "file",
                "producto_foto.png",
                "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D}
        );

        MvcResult uploadRes = mockMvc.perform(multipart("/api/uploads")
                .file(validImage)
                .header("Authorization", "Bearer " + authCliente.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").exists())
                .andExpect(jsonPath("$.filename").exists())
                .andReturn();

        String fileUrl = objectMapper.readTree(uploadRes.getResponse().getContentAsString()).get("url").asText();

        // Archivo de producto servible públicamente (sin token)
        mockMvc.perform(get(fileUrl))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG));

        // Subida inválida: archivo ejecutable .exe -> 400 Bad Request
        MockMultipartFile dangerousFile = new MockMultipartFile(
                "file",
                "exploit.exe",
                "application/octet-stream",
                "malicious script".getBytes()
        );

        mockMvc.perform(multipart("/api/uploads")
                .file(dangerousFile)
                .header("Authorization", "Bearer " + authCliente.token))
                .andExpect(status().isBadRequest());

        // Subida inválida: archivo con extensión falsa (.png pero contenido no es imagen) -> 400 Bad Request
        MockMultipartFile spoofedImage = new MockMultipartFile(
                "file",
                "fake.png",
                "image/png",
                "MZ\u0090\u0000\u0003\u0000\u0000\u0000".getBytes() // PE executable magic
        );

        mockMvc.perform(multipart("/api/uploads")
                .file(spoofedImage)
                .header("Authorization", "Bearer " + authCliente.token))
                .andExpect(status().isBadRequest());

        // Subida inválida a /api/uploads: archivo PDF (no admitido para productos) -> 400 Bad Request
        MockMultipartFile pdfFile = new MockMultipartFile(
                "file",
                "manual.pdf",
                "application/pdf",
                "%PDF-1.4\n1 0 obj\n<<\n>>\nendobj".getBytes()
        );

        mockMvc.perform(multipart("/api/uploads")
                .file(pdfFile)
                .header("Authorization", "Bearer " + authCliente.token))
                .andExpect(status().isBadRequest());

        // Path traversal bloqueado
        mockMvc.perform(get("/api/uploads/../application.properties"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("8. Seguridad estricta IDOR y privacidad de comprobantes de pago")
    void testSeguridadComprobantesPrivadosEIdor() throws Exception {
        // Comercio A
        AuthResult authComercioA = registrarYLogin("COMERCIO", "ComercioPrivadoA");
        ComercioRequestDTO reqA = new ComercioRequestDTO();
        reqA.setNombre("Tienda A Privada");
        reqA.setCategoriaId(categoriaComercioId);
        reqA.setTarifaDomicilio(new BigDecimal("2000.00"));
        reqA.setBancolombiaActivo(true);
        reqA.setBancolombiaNumeroCuenta("1111-2222");
        reqA.setBancolombiaTitular("Tienda A");

        MvcResult storeResA = mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + authComercioA.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqA)))
                .andExpect(status().isOk())
                .andReturn();
        Integer storeAId = objectMapper.readTree(storeResA.getResponse().getContentAsString()).get("id").asInt();
        Sucursal sucursalA = sucursalRepository.findByComercioId(storeAId).get(0);

        Producto prodA = new Producto();
        prodA.setSucursalId(sucursalA.getId());
        prodA.setCategoriaId(categoriaProductoId);
        prodA.setNombre("Prod A");
        prodA.setPrecio(new BigDecimal("10000.00"));
        prodA.setDisponible(true);
        prodA.setStock(10);
        prodA = productoRepository.save(prodA);

        // Comercio B
        AuthResult authComercioB = registrarYLogin("COMERCIO", "ComercioPrivadoB");
        ComercioRequestDTO reqB = new ComercioRequestDTO();
        reqB.setNombre("Tienda B Privada");
        reqB.setCategoriaId(categoriaComercioId);
        reqB.setTarifaDomicilio(new BigDecimal("2000.00"));
        mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + authComercioB.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqB)))
                .andExpect(status().isOk());

        // Cliente A
        AuthResult authClienteA = registrarYLogin("CLIENTE", "ClienteA");
        Direccion dirA = new Direccion();
        dirA.setUsuarioId(authClienteA.usuario.getId());
        dirA.setAlias("Casa A");
        dirA.setDireccion("Calle A # 1-2");
        dirA.setCiudad("Bogotá");
        dirA.setPrincipal(true);
        dirA = direccionRepository.save(dirA);

        Carrito carA = new Carrito();
        carA.setUsuarioId(authClienteA.usuario.getId());
        carA.setSucursalId(sucursalA.getId());
        carA = carritoRepository.save(carA);

        CarritoDetalle cdA = new CarritoDetalle();
        cdA.setCarritoId(carA.getId());
        cdA.setProductoId(prodA.getId());
        cdA.setCantidad(1);
        cdA.setPrecio(prodA.getPrecio());
        cdA.setSubtotal(prodA.getPrecio());
        carritoDetalleRepository.save(cdA);

        // Comprobante PNG válido
        MockMultipartFile validProof = new MockMultipartFile(
                "comprobante",
                "recibo.png",
                "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00}
        );

        // Cliente A crea pedido con archivo comprobante adjunto
        MvcResult pedRes = mockMvc.perform(multipart("/api/pedidos")
                .file(validProof)
                .header("Authorization", "Bearer " + authClienteA.token)
                .param("carritoId", carA.getId().toString())
                .param("direccionId", dirA.getId().toString())
                .param("metodoPago", "BANCOLOMBIA"))
                .andExpect(status().isOk())
                .andReturn();

        Integer pedidoAId = objectMapper.readTree(pedRes.getResponse().getContentAsString()).get("id").asInt();

        // 1. Acceso NO autenticado a comprobante privado -> 401/403
        mockMvc.perform(get("/api/pedidos/" + pedidoAId + "/comprobante"))
                .andExpect(status().isUnauthorized());

        // 2. Cliente A accede a su propio comprobante -> 200 OK
        mockMvc.perform(get("/api/pedidos/" + pedidoAId + "/comprobante")
                .header("Authorization", "Bearer " + authClienteA.token))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG));

        // 3. Cliente B intenta acceder al comprobante de Cliente A -> 403 Forbidden
        AuthResult authClienteB = registrarYLogin("CLIENTE", "ClienteB");
        mockMvc.perform(get("/api/pedidos/" + pedidoAId + "/comprobante")
                .header("Authorization", "Bearer " + authClienteB.token))
                .andExpect(status().isForbidden());

        // 4. Comercio A accede al comprobante de su pedido -> 200 OK
        mockMvc.perform(get("/api/pedidos/" + pedidoAId + "/comprobante")
                .header("Authorization", "Bearer " + authComercioA.token))
                .andExpect(status().isOk());

        // 5. Comercio B intenta acceder al comprobante de Comercio A -> 403 Forbidden
        mockMvc.perform(get("/api/pedidos/" + pedidoAId + "/comprobante")
                .header("Authorization", "Bearer " + authComercioB.token))
                .andExpect(status().isForbidden());

        // 6. Domiciliario intenta acceder al comprobante bancario -> 403 Forbidden
        AuthResult authDomi = registrarYLogin("DOMICILIARIO", "DomiCurioso");
        mockMvc.perform(get("/api/pedidos/" + pedidoAId + "/comprobante")
                .header("Authorization", "Bearer " + authDomi.token))
                .andExpect(status().isForbidden());

        // 7. Cliente B intenta subir comprobante al pedido de Cliente A -> 403 Forbidden
        MockMultipartFile newProof = new MockMultipartFile(
                "file",
                "nuevo_recibo.png",
                "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}
        );
        mockMvc.perform(multipart("/api/pedidos/" + pedidoAId + "/comprobante")
                .file(newProof)
                .header("Authorization", "Bearer " + authClienteB.token))
                .andExpect(status().isForbidden());

        // 8. Cliente A actualiza su propio comprobante -> 200 OK
        mockMvc.perform(multipart("/api/pedidos/" + pedidoAId + "/comprobante")
                .file(newProof)
                .header("Authorization", "Bearer " + authClienteA.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("/api/pedidos/" + pedidoAId + "/comprobante"));

        // 9. Comprobante inexistente (pedido sin comprobante) -> 404 Not Found
        // Creamos un pedido en efectivo sin comprobante utilizando carA
        CarritoDetalle cdEf = new CarritoDetalle();
        cdEf.setCarritoId(carA.getId());
        cdEf.setProductoId(prodA.getId());
        cdEf.setCantidad(1);
        cdEf.setPrecio(prodA.getPrecio());
        cdEf.setSubtotal(prodA.getPrecio());
        carritoDetalleRepository.save(cdEf);

        MvcResult efRes = mockMvc.perform(post("/api/pedidos")
                .header("Authorization", "Bearer " + authClienteA.token)
                .param("carritoId", carA.getId().toString())
                .param("direccionId", dirA.getId().toString())
                .param("metodoPago", "EFECTIVO"))
                .andExpect(status().isOk())
                .andReturn();
        Integer pedidoEfId = objectMapper.readTree(efRes.getResponse().getContentAsString()).get("id").asInt();

        mockMvc.perform(get("/api/pedidos/" + pedidoEfId + "/comprobante")
                .header("Authorization", "Bearer " + authClienteA.token))
                .andExpect(status().isNotFound());

        // 10. Verificación de que comprobantes NO se pueden acceder vía URL pública /api/uploads/
        mockMvc.perform(get("/api/uploads/proof_" + pedidoAId + "_random.png"))
                .andExpect(status().isForbidden());
    }
}
