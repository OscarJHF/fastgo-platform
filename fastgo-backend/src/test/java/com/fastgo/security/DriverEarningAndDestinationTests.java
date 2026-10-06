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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class DriverEarningAndDestinationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
    private DireccionRepository direccionRepository;

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private CarritoDetalleRepository carritoDetalleRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    private Integer categoriaComercioId;
    private Integer categoriaProductoId;

    @BeforeEach
    void setUp() {
        categoriaComercioId = categoriaComercioRepository.findAll().stream()
                .findFirst().map(CategoriaComercio::getId).orElseGet(() -> {
                    CategoriaComercio cat = new CategoriaComercio();
                    cat.setNombre("Restaurantes Test");
                    cat.setActivo(true);
                    return categoriaComercioRepository.save(cat).getId();
                });

        categoriaProductoId = categoriaProductoRepository.findAll().stream()
                .findFirst().map(CategoriaProducto::getId).orElseGet(() -> {
                    CategoriaProducto cp = new CategoriaProducto();
                    cp.setNombre("General Test");
                    cp.setActivo(true);
                    return categoriaProductoRepository.save(cp).getId();
                });
    }

    private static class AuthResult {
        String token;
        Usuario usuario;
    }

    private AuthResult registrarYLogin(String rolNombre, String prefix) throws Exception {
        String random = UUID.randomUUID().toString().substring(0, 6);
        String correo = prefix.toLowerCase() + "_" + random + "@fastgo.test";
        String password = "Password123*";

        RegistroUsuarioRequest regReq = new RegistroUsuarioRequest();
        regReq.setNombre(prefix);
        regReq.setApellido("Tester");
        regReq.setCorreo(correo);
        regReq.setTelefono("300" + (int)(Math.random() * 8999999 + 1000000));
        regReq.setPassword(password);
        regReq.setRol(rolNombre);

        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isOk());

        LoginRequest loginReq = new LoginRequest();
        loginReq.setCorreo(correo);
        loginReq.setPassword(password);

        MvcResult loginRes = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        LoginResponse authDTO = objectMapper.readValue(loginRes.getResponse().getContentAsString(), LoginResponse.class);
        AuthResult result = new AuthResult();
        result.token = authDTO.getToken();
        result.usuario = usuarioRepository.findByCorreo(correo).orElseThrow();
        return result;
    }

    @Test
    @DisplayName("1. Invariante: Ganancia del domiciliario es exactamente igual al deliveryFee congelado en pedido")
    void testGananciaDomiciliarioEsIgualADeliveryFee() throws Exception {
        // Comercio con tarifa estándar de $2.000 COP
        AuthResult authComercio = registrarYLogin("COMERCIO", "ChefMario");
        ComercioRequestDTO storeReq = new ComercioRequestDTO();
        storeReq.setNombre("Mario Burgers");
        storeReq.setCategoriaId(categoriaComercioId);
        storeReq.setTarifaDomicilio(new BigDecimal("2000.00"));
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
        prod.setNombre("Hamburguesa Simple");
        prod.setPrecio(new BigDecimal("15000.00"));
        prod.setDisponible(true);
        prod.setStock(20);
        prod = productoRepository.save(prod);

        // Cliente crea pedido: subtotal 15.000 + domicilio 2.000 = total 17.000
        AuthResult authCliente = registrarYLogin("CLIENTE", "CarlosCliente");
        Direccion dir = new Direccion();
        dir.setUsuarioId(authCliente.usuario.getId());
        dir.setAlias("Casa 102");
        dir.setDireccion("Carrera 7 # 45-10");
        dir.setCiudad("Bogotá");
        dir.setLatitud(new BigDecimal("4.6291000"));
        dir.setLongitud(new BigDecimal("-74.0652000"));
        dir.setPrincipal(true);
        dir = direccionRepository.save(dir);

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

        MvcResult pedidoRes = mockMvc.perform(post("/api/pedidos")
                .header("Authorization", "Bearer " + authCliente.token)
                .param("carritoId", carrito.getId().toString())
                .param("direccionId", dir.getId().toString())
                .param("metodoPago", "EFECTIVO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal").value(15000.00))
                .andExpect(jsonPath("$.costoEnvio").value(2000.00))
                .andExpect(jsonPath("$.total").value(17000.00))
                .andExpect(jsonPath("$.gananciaDomiciliario").value(2000.00))
                .andReturn();

        Integer pedidoId = objectMapper.readTree(pedidoRes.getResponse().getContentAsString()).get("id").asInt();

        // Comercio avanza pedido: PENDIENTE -> CONFIRMADO -> PREPARANDO -> LISTO
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/confirmar")
                .header("Authorization", "Bearer " + authComercio.token))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/preparar")
                .header("Authorization", "Bearer " + authComercio.token))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/listo")
                .header("Authorization", "Bearer " + authComercio.token))
                .andExpect(status().isOk());

        // Domiciliario consulta pedidos disponibles
        AuthResult authDomi = registrarYLogin("DOMICILIARIO", "PedroDomi");
        mockMvc.perform(get("/api/pedidos/domiciliario/disponibles")
                .header("Authorization", "Bearer " + authDomi.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + pedidoId + ")].costoEnvio").value(2000.00))
                .andExpect(jsonPath("$[?(@.id == " + pedidoId + ")].gananciaDomiciliario").value(2000.00))
                .andExpect(jsonPath("$[?(@.id == " + pedidoId + ")].total").value(17000.00));
    }

    @Test
    @DisplayName("2. Datos de destino completos y protección de privacidad del cliente para domiciliario")
    void testDatosDestinoYPrivacidad() throws Exception {
        AuthResult authComercio = registrarYLogin("COMERCIO", "SraRosa");
        ComercioRequestDTO storeReq = new ComercioRequestDTO();
        storeReq.setNombre("Cocina Rosa");
        storeReq.setCategoriaId(categoriaComercioId);
        storeReq.setTarifaDomicilio(new BigDecimal("3000.00"));
        MvcResult storeRes = mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + authComercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(storeReq)))
                .andExpect(status().isOk())
                .andReturn();
        Integer storeId = objectMapper.readTree(storeRes.getResponse().getContentAsString()).get("id").asInt();
        Sucursal sucursal = sucursalRepository.findByComercioId(storeId).get(0);
        sucursal.setLatitud(new BigDecimal("4.6500000"));
        sucursal.setLongitud(new BigDecimal("-74.0500000"));
        sucursal.setTelefono("3115554433");
        sucursalRepository.save(sucursal);

        Producto prod = new Producto();
        prod.setSucursalId(sucursal.getId());
        prod.setCategoriaId(categoriaProductoId);
        prod.setNombre("Arroz Especial");
        prod.setPrecio(new BigDecimal("20000.00"));
        prod.setDisponible(true);
        prod.setStock(10);
        prod = productoRepository.save(prod);

        AuthResult authCliente = registrarYLogin("CLIENTE", "LauraCliente");
        Direccion dir = new Direccion();
        dir.setUsuarioId(authCliente.usuario.getId());
        dir.setAlias("Apto 501 Torre B");
        dir.setDireccion("Calle 85 # 11-20");
        dir.setCiudad("Bogotá");
        dir.setLatitud(new BigDecimal("4.6700000"));
        dir.setLongitud(new BigDecimal("-74.0600000"));
        dir.setPrincipal(true);
        dir = direccionRepository.save(dir);

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

        MvcResult pedidoRes = mockMvc.perform(post("/api/pedidos")
                .header("Authorization", "Bearer " + authCliente.token)
                .param("carritoId", carrito.getId().toString())
                .param("direccionId", dir.getId().toString())
                .param("metodoPago", "EFECTIVO"))
                .andExpect(status().isOk())
                .andReturn();
        Integer pedidoId = objectMapper.readTree(pedidoRes.getResponse().getContentAsString()).get("id").asInt();

        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/confirmar")
                .header("Authorization", "Bearer " + authComercio.token))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/preparar")
                .header("Authorization", "Bearer " + authComercio.token))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/listo")
                .header("Authorization", "Bearer " + authComercio.token))
                .andExpect(status().isOk());

        // A. Domiciliario en 'disponibles': ve destino completo pero teléfono del cliente OCULTO (null)
        AuthResult authDomi = registrarYLogin("DOMICILIARIO", "AlfonsoRider");
        mockMvc.perform(get("/api/pedidos/domiciliario/disponibles")
                .header("Authorization", "Bearer " + authDomi.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + pedidoId + ")].destinoDireccion").value("Calle 85 # 11-20"))
                .andExpect(jsonPath("$[?(@.id == " + pedidoId + ")].destinoCiudad").value("Bogotá"))
                .andExpect(jsonPath("$[?(@.id == " + pedidoId + ")].destinoReferencia").value("Apto 501 Torre B"))
                .andExpect(jsonPath("$[?(@.id == " + pedidoId + ")].destinoLatitud").value(4.6700000))
                .andExpect(jsonPath("$[?(@.id == " + pedidoId + ")].destinoLongitud").value(-74.0600000))
                .andExpect(jsonPath("$[?(@.id == " + pedidoId + ")].clienteTelefono").value(hasItem((Object) null)));

        // B. Domiciliario toma el pedido
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/tomar")
                .header("Authorization", "Bearer " + authDomi.token))
                .andExpect(status().isOk());

        // C. Domiciliario en 'mios': teléfono ahora REVELADO para comunicarse durante entrega
        mockMvc.perform(get("/api/pedidos/domiciliario/mios")
                .header("Authorization", "Bearer " + authDomi.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + pedidoId + ")].clienteTelefono").value(authCliente.usuario.getTelefono()));
    }

    @Test
    @DisplayName("3. Tracking GPS en tiempo real: emisión, consulta y control estricto IDOR")
    void testTrackingRealTimeYControlIdor() throws Exception {
        AuthResult authComercio = registrarYLogin("COMERCIO", "ChefTracking");
        ComercioRequestDTO storeReq = new ComercioRequestDTO();
        storeReq.setNombre("Tracking Pizzería");
        storeReq.setCategoriaId(categoriaComercioId);
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
        prod.setNombre("Pizza Tracking");
        prod.setPrecio(new BigDecimal("25000.00"));
        prod.setDisponible(true);
        prod.setStock(10);
        prod = productoRepository.save(prod);

        AuthResult authCliente = registrarYLogin("CLIENTE", "JuanitoTracking");
        Direccion dir = new Direccion();
        dir.setUsuarioId(authCliente.usuario.getId());
        dir.setAlias("Oficina 401");
        dir.setDireccion("Calle 72 # 10-34");
        dir.setCiudad("Bogotá");
        dir.setLatitud(new BigDecimal("4.6550000"));
        dir.setLongitud(new BigDecimal("-74.0550000"));
        dir.setPrincipal(true);
        dir = direccionRepository.save(dir);

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

        MvcResult pedidoRes = mockMvc.perform(post("/api/pedidos")
                .header("Authorization", "Bearer " + authCliente.token)
                .param("carritoId", carrito.getId().toString())
                .param("direccionId", dir.getId().toString())
                .param("metodoPago", "EFECTIVO"))
                .andExpect(status().isOk())
                .andReturn();
        Integer pedidoId = objectMapper.readTree(pedidoRes.getResponse().getContentAsString()).get("id").asInt();

        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/confirmar").header("Authorization", "Bearer " + authComercio.token)).andExpect(status().isOk());
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/preparar").header("Authorization", "Bearer " + authComercio.token)).andExpect(status().isOk());
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/listo").header("Authorization", "Bearer " + authComercio.token)).andExpect(status().isOk());

        AuthResult authDomiAsignado = registrarYLogin("DOMICILIARIO", "DomiAsignado");
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/tomar").header("Authorization", "Bearer " + authDomiAsignado.token)).andExpect(status().isOk());
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/en-camino").header("Authorization", "Bearer " + authDomiAsignado.token)).andExpect(status().isOk());

        // A. Domiciliario asignado emite coordenadas GPS con telemetría extendida
        TrackingUbicacionRequest trackReq = new TrackingUbicacionRequest(pedidoId, new BigDecimal("4.6534000"), new BigDecimal("-74.0521000"));
        trackReq.setPrecision(new BigDecimal("5.50"));
        trackReq.setVelocidad(new BigDecimal("28.00"));
        trackReq.setRumbo(new BigDecimal("180.00"));

        mockMvc.perform(post("/api/tracking/ubicacion")
                .header("Authorization", "Bearer " + authDomiAsignado.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(trackReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pedidoId").value(pedidoId))
                .andExpect(jsonPath("$.latitud").value(4.6534000))
                .andExpect(jsonPath("$.longitud").value(-74.0521000))
                .andExpect(jsonPath("$.precision").value(5.50))
                .andExpect(jsonPath("$.velocidad").value(28.00))
                .andExpect(jsonPath("$.rumbo").value(180.00))
                .andExpect(jsonPath("$.fechaHora").isNotEmpty())
                .andExpect(jsonPath("$.activo").value(true));

        // B. Cliente dueño del pedido consulta el tracking
        mockMvc.perform(get("/api/tracking/pedido/" + pedidoId)
                .header("Authorization", "Bearer " + authCliente.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.latitud").value(4.6534000))
                .andExpect(jsonPath("$.longitud").value(-74.0521000))
                .andExpect(jsonPath("$.precision").value(5.50))
                .andExpect(jsonPath("$.velocidad").value(28.00))
                .andExpect(jsonPath("$.fechaHora").isNotEmpty())
                .andExpect(jsonPath("$.estadoPedido").value("EN_CAMINO"))
                .andExpect(jsonPath("$.activo").value(true));

        // C. IDOR: Otro domiciliario no asignado intenta transmitir o consultar
        AuthResult authDomiIntruso = registrarYLogin("DOMICILIARIO", "DomiIntruso");
        mockMvc.perform(post("/api/tracking/ubicacion")
                .header("Authorization", "Bearer " + authDomiIntruso.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(trackReq)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/tracking/pedido/" + pedidoId)
                .header("Authorization", "Bearer " + authDomiIntruso.token))
                .andExpect(status().isForbidden());

        // D. IDOR: Otro cliente no relacionado intenta consultar tracking del pedido
        AuthResult authClienteIntruso = registrarYLogin("CLIENTE", "ClienteEspia");
        mockMvc.perform(get("/api/tracking/pedido/" + pedidoId)
                .header("Authorization", "Bearer " + authClienteIntruso.token))
                .andExpect(status().isForbidden());

        // E. Al pasar a ENTREGADO: cesa la transmisión y tracking queda inactivo
        mockMvc.perform(put("/api/pedidos/" + pedidoId + "/entregado")
                .header("Authorization", "Bearer " + authDomiAsignado.token))
                .andExpect(status().isOk());

        // Intento de transmitir después de entrega -> Rechazado
        mockMvc.perform(post("/api/tracking/ubicacion")
                .header("Authorization", "Bearer " + authDomiAsignado.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(trackReq)))
                .andExpect(status().isBadRequest());

        // Cliente consulta tracking -> Activo es false
        mockMvc.perform(get("/api/tracking/pedido/" + pedidoId)
                .header("Authorization", "Bearer " + authCliente.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPedido").value("ENTREGADO"))
                .andExpect(jsonPath("$.activo").value(false));

        // F. Configuración de mapas sin exposición de secretos
        mockMvc.perform(get("/api/maps/config")
                .header("Authorization", "Bearer " + authCliente.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.provider").value("GOOGLE_MAPS"))
                .andExpect(jsonPath("$.enabled").exists());
    }
}
