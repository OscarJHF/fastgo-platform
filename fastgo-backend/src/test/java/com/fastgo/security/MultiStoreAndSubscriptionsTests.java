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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import org.springframework.mock.web.MockMultipartFile;
import com.fastgo.service.SuscripcionService;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class MultiStoreAndSubscriptionsTests {

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

    @Autowired
    private ComercioRepository comercioRepository;

    @Autowired
    private SuscripcionRepository suscripcionRepository;

    @Autowired
    private ConfiguracionSuscripcionRepository configuracionSuscripcionRepository;

    @Autowired
    private AuditoriaAdminRepository auditoriaAdminRepository;

    @Autowired
    private com.fastgo.jwt.JwtService jwtService;

    @Autowired
    private SuscripcionService suscripcionService;

    private Integer categoriaComercioId;
    private Integer categoriaProductoId;

    private static class AuthResult {
        String token;
        Usuario usuario;
    }

    @BeforeEach
    void setUp() {
        objectMapper.findAndRegisterModules();
        configuracionSuscripcionRepository.findGlobalConfig().ifPresent(c -> {
            c.setFreePrimaryStores(1);
            c.setPrimaryFreePeriodMonths(6);
            c.setPrimaryMonthlyPrice(new BigDecimal("20000.00"));
            c.setAdditionalStoreActivationPrice(new BigDecimal("50000.00"));
            c.setAdditionalStoreMonthlyPrice(new BigDecimal("30000.00"));
            c.setAllowNewStores(true);
            configuracionSuscripcionRepository.save(c);
        });
        for (String roleName : new String[]{"CLIENTE", "COMERCIO", "DOMICILIARIO", "ADMIN"}) {
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

    private AuthResult crearAdmin(String nombre) {
        String correo = "admin." + UUID.randomUUID().toString().substring(0, 8) + "@fastgo.com";
        Rol rolAdmin = rolRepository.findByNombreIgnoreCase("ADMIN").orElseGet(() -> {
            Rol r = new Rol();
            r.setNombre("ADMIN");
            return rolRepository.save(r);
        });

        Usuario u = new Usuario();
        u.setNombre(nombre);
        u.setApellido("Admin");
        u.setCorreo(correo);
        u.setTelefono("3001234567");
        u.setPassword("Password123!");
        u.setRol(rolAdmin);
        u.getRoles().add(rolAdmin);
        u.setEstado(true);
        u = usuarioRepository.save(u);

        String token = jwtService.generarToken(u.getCorreo(), "ADMIN");
        AuthResult auth = new AuthResult();
        auth.token = token;
        auth.usuario = u;
        return auth;
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

        LoginResponse resp = objectMapper.readValue(res.getResponse().getContentAsString(), LoginResponse.class);
        AuthResult auth = new AuthResult();
        auth.token = resp.getToken();
        auth.usuario = usuarioRepository.findByCorreo(correo).orElseThrow();
        return auth;
    }

    private ComercioResponseDTO crearComercio(String token, String nombre, String direccion) throws Exception {
        ComercioRequestDTO req = new ComercioRequestDTO();
        req.setNombre(nombre);
        req.setDescripcion("Descripción de " + nombre);
        req.setCategoriaId(categoriaComercioId);
        req.setTelefono("3112223344");
        req.setCorreo("contacto." + UUID.randomUUID().toString().substring(0, 8) + "@fastgo.com");
        req.setDireccion(direccion);
        req.setCiudad("Bogotá");
        req.setDiasAtencion("1,2,3,4,5,6,7");
        req.setHoraApertura("00:00");
        req.setHoraCierre("23:59");
        req.setMetodosPago("EFECTIVO");
        req.setTarifaDomicilio(new BigDecimal("3500.00"));

        MvcResult res = mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readValue(res.getResponse().getContentAsString(), ComercioResponseDTO.class);
    }

    private ProductoResponseDTO crearProducto(String token, Integer comercioId, String nombre, BigDecimal precio) throws Exception {
        ProductoRequestDTO req = new ProductoRequestDTO();
        req.setComercioId(comercioId);
        req.setCategoriaId(categoriaProductoId);
        req.setNombre(nombre);
        req.setDescripcion("Descripción de " + nombre);
        req.setPrecio(precio);
        req.setDisponible(true);
        req.setStock(50);
        req.setTiempoPreparacion(15);

        MvcResult res = mockMvc.perform(post("/api/productos")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readValue(res.getResponse().getContentAsString(), ProductoResponseDTO.class);
    }

    @Test
    @DisplayName("01. Tienda 1 es Principal con 6 meses gratis y estado ACTIVA")
    void test01_TiendaPrincipalConPeriodoGratis() throws Exception {
        AuthResult comercio = registrarYLogin("COMERCIO", "Don Pedro");
        ComercioResponseDTO c1 = crearComercio(comercio.token, "Pizzería Pedro Principal", "Calle 10 # 5-20");

        assertThat(c1.getId()).isNotNull();
        assertThat(c1.getEsPrincipal()).isTrue();
        assertThat(c1.getEstado()).isEqualTo("ACTIVA");
        assertThat(c1.getActivo()).isTrue();

        Suscripcion sub = suscripcionRepository.findFirstByComercioIdOrderByCreadoEnDesc(c1.getId()).orElseThrow();
        assertThat(sub.getTipoPlan()).isEqualTo("TIENDA_PRINCIPAL");
        assertThat(sub.getEstado()).isEqualTo("GRATUITO");
        assertThat(sub.getFechaFin()).isNotNull();
        assertThat(sub.getMonto()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("02. Mismo comerciante puede crear Tienda 2, nace PENDIENTE_ACTIVACION e inactiva")
    void test02_TiendaAdicionalNacePendiente() throws Exception {
        AuthResult comercio = registrarYLogin("COMERCIO", "Don Pedro");
        ComercioResponseDTO c1 = crearComercio(comercio.token, "Pizzería Pedro Sede 1", "Calle 10 # 5-20");
        ComercioResponseDTO c2 = crearComercio(comercio.token, "Pizzería Pedro Sede 2", "Carrera 15 # 80-10");

        assertThat(c2.getId()).isNotNull();
        assertThat(c2.getEsPrincipal()).isFalse();
        assertThat(c2.getEstado()).isEqualTo("PENDIENTE_ACTIVACION");
        assertThat(c2.getActivo()).isFalse();

        Suscripcion sub2 = suscripcionRepository.findFirstByComercioIdOrderByCreadoEnDesc(c2.getId()).orElseThrow();
        assertThat(sub2.getTipoPlan()).isEqualTo("TIENDA_ADICIONAL");
        assertThat(sub2.getEstado()).isEqualTo("PENDIENTE_ACTIVACION");
        assertThat(sub2.getMonto()).isEqualByComparingTo(new BigDecimal("50000.00"));
    }

    @Test
    @DisplayName("03. Comerciante puede listar todas sus tiendas vía /api/comercios/mis-tiendas")
    void test03_ListarMisTiendas() throws Exception {
        AuthResult comercio = registrarYLogin("COMERCIO", "Doña María");
        crearComercio(comercio.token, "Panadería María Sede 1", "Calle 20 # 10-05");
        crearComercio(comercio.token, "Panadería María Sede 2", "Calle 50 # 30-12");

        MvcResult res = mockMvc.perform(get("/api/comercios/mis-tiendas")
                .header("Authorization", "Bearer " + comercio.token))
                .andExpect(status().isOk())
                .andReturn();

        ComercioResponseDTO[] misTiendas = objectMapper.readValue(res.getResponse().getContentAsString(), ComercioResponseDTO[].class);
        assertThat(misTiendas).hasSize(2);
        assertThat(misTiendas[0].getEsPrincipal()).isTrue();
        assertThat(misTiendas[1].getEsPrincipal()).isFalse();
    }

    @Test
    @DisplayName("04. Catálogo público /api/comercios solo muestra tiendas activas y operativas")
    void test04_CatalogoPublicoFiltraInactivas() throws Exception {
        AuthResult comercio = registrarYLogin("COMERCIO", "Carlos Hamburguesas");
        ComercioResponseDTO c1 = crearComercio(comercio.token, "Burger King Carlos 1", "Av 1 # 1-1");
        ComercioResponseDTO c2 = crearComercio(comercio.token, "Burger King Carlos 2", "Av 2 # 2-2");

        MvcResult res = mockMvc.perform(get("/api/comercios"))
                .andExpect(status().isOk())
                .andReturn();

        ComercioResponseDTO[] publicos = objectMapper.readValue(res.getResponse().getContentAsString(), ComercioResponseDTO[].class);
        boolean tieneC1 = false;
        boolean tieneC2 = false;
        for (ComercioResponseDTO c : publicos) {
            if (c.getId().equals(c1.getId())) tieneC1 = true;
            if (c.getId().equals(c2.getId())) tieneC2 = true;
        }

        assertThat(tieneC1).isTrue();
        assertThat(tieneC2).isFalse();
    }

    @Test
    @DisplayName("05. No se pueden crear pedidos en tienda pendiente de activación")
    void test05_BloquearPedidosEnTiendaPendiente() throws Exception {
        AuthResult comercio = registrarYLogin("COMERCIO", "Sushi Master");
        crearComercio(comercio.token, "Sushi Master 1", "Calle 100 # 15-20");
        ComercioResponseDTO c2 = crearComercio(comercio.token, "Sushi Master 2", "Calle 140 # 9-10");

        ProductoResponseDTO p2 = crearProducto(comercio.token, c2.getId(), "Roll California", new BigDecimal("25000.00"));

        AuthResult cliente = registrarYLogin("CLIENTE", "Juan Cliente");

        // Crear dirección
        Direccion dir = new Direccion();
        dir.setUsuarioId(cliente.usuario.getId());
        dir.setAlias("Casa");
        dir.setDireccion("Carrera 7 # 72-10");
        dir.setCiudad("Bogotá");
        dir.setLatitud(new BigDecimal("4.6500"));
        dir.setLongitud(new BigDecimal("-74.0500"));
        dir = direccionRepository.save(dir);

        // Crear carrito con producto de tienda 2
        Sucursal suc2 = sucursalRepository.findByComercioId(c2.getId()).get(0);
        Carrito carrito = new Carrito();
        carrito.setUsuarioId(cliente.usuario.getId());
        carrito.setSucursalId(suc2.getId());
        carrito = carritoRepository.save(carrito);

        CarritoDetalle cd = new CarritoDetalle();
        cd.setCarritoId(carrito.getId());
        cd.setProductoId(p2.getId());
        cd.setCantidad(2);
        cd.setPrecio(p2.getPrecio());
        cd.setSubtotal(p2.getPrecio().multiply(BigDecimal.valueOf(2)));
        carritoDetalleRepository.save(cd);

        // Intentar crear pedido en tienda 2 (PENDIENTE_ACTIVACION) -> debe fallar
        mockMvc.perform(post("/api/pedidos")
                .header("Authorization", "Bearer " + cliente.token)
                .param("carritoId", carrito.getId().toString())
                .param("direccionId", dir.getId().toString())
                .param("metodoPago", "EFECTIVO"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("06. Admin lista todas las tiendas con propietario y suscripción")
    void test06_AdminListaTiendas() throws Exception {
        AuthResult admin = crearAdmin("Super Admin");
        AuthResult comercio = registrarYLogin("COMERCIO", "Empresario Bogotano");
        crearComercio(comercio.token, "Empresa 1", "Calle 1");
        crearComercio(comercio.token, "Empresa 2", "Calle 2");

        MvcResult res = mockMvc.perform(get("/api/admin/tiendas")
                .header("Authorization", "Bearer " + admin.token))
                .andExpect(status().isOk())
                .andReturn();

        AdminTiendaResponseDTO[] tiendas = objectMapper.readValue(res.getResponse().getContentAsString(), AdminTiendaResponseDTO[].class);
        assertThat(tiendas.length).isGreaterThanOrEqualTo(2);
    }

    @Test
    @DisplayName("07. Admin activa tienda adicional: cambia estado a ACTIVA y registra auditoría")
    void test07_AdminActivaTiendaYAudita() throws Exception {
        AuthResult admin = crearAdmin("Super Admin");
        AuthResult comercio = registrarYLogin("COMERCIO", "Comerciante Dos");
        crearComercio(comercio.token, "Tienda Uno", "Dir 1");
        ComercioResponseDTO c2 = crearComercio(comercio.token, "Tienda Dos", "Dir 2");

        MvcResult res = mockMvc.perform(put("/api/admin/tiendas/" + c2.getId() + "/activar")
                .header("Authorization", "Bearer " + admin.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("razon", "Pago PSE verificado"))))
                .andExpect(status().isOk())
                .andReturn();

        AdminTiendaResponseDTO activada = objectMapper.readValue(res.getResponse().getContentAsString(), AdminTiendaResponseDTO.class);
        assertThat(activada.getEstado()).isEqualTo("ACTIVA");
        assertThat(activada.getActivo()).isTrue();

        // Verificar auditoría
        assertThat(auditoriaAdminRepository.findAllByOrderByFechaDesc()).anyMatch(a ->
                "ACTIVAR_TIENDA".equals(a.getAccion()) &&
                        String.valueOf(c2.getId()).equals(a.getEntidadId()) &&
                        "Pago PSE verificado".equals(a.getDetalles())
        );
    }

    @Test
    @DisplayName("08. Admin suspende y reactiva tienda con auditoría")
    void test08_AdminSuspendeYReactiva() throws Exception {
        AuthResult admin = crearAdmin("Super Admin");
        AuthResult comercio = registrarYLogin("COMERCIO", "Comerciante Tres");
        ComercioResponseDTO c1 = crearComercio(comercio.token, "Tienda Tres", "Dir 3");

        // Suspender
        mockMvc.perform(put("/api/admin/tiendas/" + c1.getId() + "/suspender")
                .header("Authorization", "Bearer " + admin.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("razon", "Mora en pago de mensualidad"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("SUSPENDIDA"))
                .andExpect(jsonPath("$.activo").value(false));

        // Reactivar
        mockMvc.perform(put("/api/admin/tiendas/" + c1.getId() + "/reactivar")
                .header("Authorization", "Bearer " + admin.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("razon", "Pago de mensualidad acreditado"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ACTIVA"))
                .andExpect(jsonPath("$.activo").value(true));
    }

    @Test
    @DisplayName("09. Aislamiento IDOR: comerciante no puede modificar tienda de otro")
    void test09_AislamientoIdorTiendas() throws Exception {
        AuthResult comercioA = registrarYLogin("COMERCIO", "Comercio A");
        AuthResult comercioB = registrarYLogin("COMERCIO", "Comercio B");

        ComercioResponseDTO tiendaA = crearComercio(comercioA.token, "Tienda A", "Dir A");

        ComercioRequestDTO updateReq = new ComercioRequestDTO();
        updateReq.setNombre("Tienda Hackeada por B");
        updateReq.setCategoriaId(categoriaComercioId);
        updateReq.setTelefono("3000000000");

        mockMvc.perform(put("/api/comercios/" + tiendaA.getId())
                .header("Authorization", "Bearer " + comercioB.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().is4xxClientError()); // No pertenece al usuario
    }

    @Test
    @DisplayName("10. Aislamiento IDOR: comerciante no puede crear producto en tienda de otro ni filtrar sus productos")
    void test10_AislamientoIdorProductos() throws Exception {
        AuthResult comercioA = registrarYLogin("COMERCIO", "Comercio A");
        AuthResult comercioB = registrarYLogin("COMERCIO", "Comercio B");

        ComercioResponseDTO tiendaA = crearComercio(comercioA.token, "Tienda Alpha", "Dir Alpha");

        ProductoRequestDTO hackProduct = new ProductoRequestDTO();
        hackProduct.setComercioId(tiendaA.getId());
        hackProduct.setCategoriaId(categoriaProductoId);
        hackProduct.setNombre("Producto Infiltrado");
        hackProduct.setPrecio(new BigDecimal("10000.00"));

        // Comercio B intenta crear producto en tienda A -> falla
        mockMvc.perform(post("/api/productos")
                .header("Authorization", "Bearer " + comercioB.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(hackProduct)))
                .andExpect(status().is4xxClientError());

        // Comercio B intenta listar productos de tienda A -> falla
        mockMvc.perform(get("/api/productos/comercio/mis-productos")
                .header("Authorization", "Bearer " + comercioB.token)
                .param("comercioId", tiendaA.getId().toString()))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("11. Comerciante puede filtrar sus productos por cada una de sus tiendas")
    void test11_FiltrarProductosPorTiendaPropia() throws Exception {
        AuthResult comercio = registrarYLogin("COMERCIO", "Multitienda Dueño");
        ComercioResponseDTO t1 = crearComercio(comercio.token, "Tienda Frutas", "Calle Frutas");
        ComercioResponseDTO t2 = crearComercio(comercio.token, "Tienda Carnes", "Calle Carnes");

        ProductoResponseDTO p1 = crearProducto(comercio.token, t1.getId(), "Manzanas Rojas", new BigDecimal("5000.00"));
        ProductoResponseDTO p2 = crearProducto(comercio.token, t2.getId(), "Carne Angus", new BigDecimal("35000.00"));

        // Filtrar por Tienda 1
        MvcResult res1 = mockMvc.perform(get("/api/productos/comercio/mis-productos")
                .header("Authorization", "Bearer " + comercio.token)
                .param("comercioId", t1.getId().toString()))
                .andExpect(status().isOk())
                .andReturn();

        ProductoResponseDTO[] prodsT1 = objectMapper.readValue(res1.getResponse().getContentAsString(), ProductoResponseDTO[].class);
        assertThat(prodsT1).hasSize(1);
        assertThat(prodsT1[0].getNombre()).isEqualTo("Manzanas Rojas");

        // Filtrar por Tienda 2
        MvcResult res2 = mockMvc.perform(get("/api/productos/comercio/mis-productos")
                .header("Authorization", "Bearer " + comercio.token)
                .param("comercioId", t2.getId().toString()))
                .andExpect(status().isOk())
                .andReturn();

        ProductoResponseDTO[] prodsT2 = objectMapper.readValue(res2.getResponse().getContentAsString(), ProductoResponseDTO[].class);
        assertThat(prodsT2).hasSize(1);
        assertThat(prodsT2[0].getNombre()).isEqualTo("Carne Angus");
    }

    @Test
    @DisplayName("12. Admin consulta y actualiza parámetros de suscripción con registro de auditoría")
    void test12_AdminConfiguraSuscripciones() throws Exception {
        AuthResult admin = crearAdmin("Admin Finanzas");

        ConfiguracionSuscripcionDTO update = new ConfiguracionSuscripcionDTO();
        update.setFreePrimaryStores(1);
        update.setPrimaryFreePeriodMonths(6);
        update.setPrimaryMonthlyPrice(new BigDecimal("22000.00"));
        update.setAdditionalStoreActivationPrice(new BigDecimal("55000.00"));
        update.setAdditionalStoreMonthlyPrice(new BigDecimal("33000.00"));
        update.setAllowNewStores(true);

        mockMvc.perform(put("/api/admin/suscripciones/configuracion")
                .header("Authorization", "Bearer " + admin.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.primaryMonthlyPrice").value(22000.00))
                .andExpect(jsonPath("$.additionalStoreActivationPrice").value(55000.00));

        // Comercio consulta tarifas públicas
        mockMvc.perform(get("/api/comercios/suscripciones/configuracion"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.additionalStoreActivationPrice").value(55000.00));
    }

    @Test
    @DisplayName("13. Cuando allowNewStores es falso, la creación de nuevas tiendas queda bloqueada")
    void test13_BloqueoRegistroNuevasTiendas() throws Exception {
        AuthResult admin = crearAdmin("Admin Bloqueador");
        AuthResult comercio = registrarYLogin("COMERCIO", "Comercio Bloqueado");

        // Deshabilitar nuevas tiendas
        ConfiguracionSuscripcionDTO cfg = new ConfiguracionSuscripcionDTO();
        cfg.setAllowNewStores(false);
        mockMvc.perform(put("/api/admin/suscripciones/configuracion")
                .header("Authorization", "Bearer " + admin.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cfg)))
                .andExpect(status().isOk());

        // Intentar registrar comercio
        ComercioRequestDTO req = new ComercioRequestDTO();
        req.setNombre("Tienda Rechazada");
        req.setCategoriaId(categoriaComercioId);
        req.setTelefono("3100000000");

        mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + comercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().is4xxClientError());

        // Re-habilitar
        cfg.setAllowNewStores(true);
        mockMvc.perform(put("/api/admin/suscripciones/configuracion")
                .header("Authorization", "Bearer " + admin.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cfg)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("14. Usuarios sin rol ADMIN tienen acceso denegado a /api/admin/**")
    void test14_SeguridadRbacAdmin() throws Exception {
        AuthResult cliente = registrarYLogin("CLIENTE", "Cliente Intruso");
        AuthResult comercio = registrarYLogin("COMERCIO", "Comercio Intruso");

        mockMvc.perform(get("/api/admin/tiendas")
                .header("Authorization", "Bearer " + cliente.token))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/tiendas")
                .header("Authorization", "Bearer " + comercio.token))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/auditoria")
                .header("Authorization", "Bearer " + comercio.token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("15. Un comerciante puede crear múltiples tiendas con el mismo NIT, pero no con el mismo nombre")
    void test15_MismoNitDistintoNombreYRechazoMismoNombre() throws Exception {
        AuthResult comercio = registrarYLogin("COMERCIO", "Comerciante Multisede");
        String mismoNit = "900999888-7";

        // 1. Crear Tienda 1 con NIT
        ComercioRequestDTO req1 = new ComercioRequestDTO();
        req1.setNombre("Sabor Paisa Principal");
        req1.setCategoriaId(categoriaComercioId);
        req1.setTelefono("3112223344");
        req1.setNit(mismoNit);
        req1.setDireccion("Calle 10 # 20 - 30");

        mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + comercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isOk());

        // 2. Crear Tienda 2 con EL MISMO NIT y distinto nombre (DEBE PERMITIRSE)
        ComercioRequestDTO req2 = new ComercioRequestDTO();
        req2.setNombre("Sabor Paisa Express");
        req2.setCategoriaId(categoriaComercioId);
        req2.setTelefono("3112223344");
        req2.setNit(mismoNit);
        req2.setDireccion("Carrera 15 # 45 - 60");

        mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + comercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isOk());

        // 3. Intentar crear Tienda con EL MISMO NOMBRE para el mismo usuario (DEBE RECHAZARSE)
        ComercioRequestDTO reqRepetido = new ComercioRequestDTO();
        reqRepetido.setNombre("Sabor Paisa Principal");
        reqRepetido.setCategoriaId(categoriaComercioId);
        reqRepetido.setTelefono("3112223344");
        reqRepetido.setNit(mismoNit);

        mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + comercio.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqRepetido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", org.hamcrest.Matchers.containsString("Ya tienes una tienda con ese nombre")));
    }

    @Test
    @DisplayName("16. Flujo completo de Suscripciones: Tarifas, Banco FASTGO, Comprobante, Aprobación/Rechazo Admin y Vencimiento")
    void test16_FlujoCompletoSuscripcionesActivacionComprobanteYVencimiento() throws Exception {
        AuthResult admin = crearAdmin("Admin Finanzas");
        AuthResult comerciante = registrarYLogin("COMERCIO", "Don Tiendero");

        // 1. Comercio consulta configuración global de suscripciones y datos bancarios oficiales de FASTGO
        mockMvc.perform(get("/api/comercios/suscripciones/configuracion")
                .header("Authorization", "Bearer " + comerciante.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bancoNombre").exists())
                .andExpect(jsonPath("$.bancoNumeroCuenta").exists())
                .andExpect(jsonPath("$.primaryFreePeriodMonths").value(6));

        // 2. Admin actualiza cuenta bancaria de FASTGO
        ConfiguracionSuscripcionDTO updateCfg = suscripcionService.obtenerConfiguracionDTO();
        updateCfg.setBancoNombre("Bancolombia Corporativo");
        updateCfg.setBancoNumeroCuenta("999-888777-11");
        updateCfg.setAdditionalStoreActivationPrice(new BigDecimal("50000.00"));
        updateCfg.setActualizadoEn(null);

        mockMvc.perform(put("/api/admin/suscripciones/configuracion")
                .header("Authorization", "Bearer " + admin.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateCfg)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bancoNumeroCuenta").value("999-888777-11"));

        // 3. Crear primera tienda (gratuita por 6 meses) y segunda tienda (requiere pago de activación)
        ComercioResponseDTO c1 = crearComercio(comerciante.token, "Sede Central Don Tiendero", "Calle 10 # 5-20");
        assertThat(c1.getEsPrincipal()).isTrue();
        assertThat(c1.getEstado()).isEqualTo("ACTIVA");

        ComercioResponseDTO c2 = crearComercio(comerciante.token, "Sede Norte Don Tiendero", "Carrera 7 # 120-15");
        assertThat(c2.getEsPrincipal()).isFalse();
        assertThat(c2.getEstado()).isEqualTo("PENDIENTE_ACTIVACION");
        assertThat(c2.getActivo()).isFalse();

        // 4. Comercio consulta suscripción de tienda adicional
        mockMvc.perform(get("/api/comercios/" + c2.getId() + "/suscripcion")
                .header("Authorization", "Bearer " + comerciante.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("PENDIENTE_ACTIVACION"))
                .andExpect(jsonPath("$.bancoNumeroCuenta").value("999-888777-11"));

        Integer subId = suscripcionRepository.findFirstByComercioIdOrderByCreadoEnDesc(c2.getId()).orElseThrow().getId();

        // 5. Comercio sube comprobante de pago de activación válido (PNG con magic bytes)
        byte[] pngBytes = new byte[]{(byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52};
        MockMultipartFile comprobante = new MockMultipartFile("comprobante", "recibo_activacion.png", "image/png", pngBytes);

        mockMvc.perform(multipart("/api/comercios/" + c2.getId() + "/suscripcion/comprobante")
                .file(comprobante)
                .param("referencia", "TRANSF-98765")
                .header("Authorization", "Bearer " + comerciante.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("PENDIENTE_VERIFICACION"))
                .andExpect(jsonPath("$.comprobanteUrl").exists());

        // Comprobar que la tienda pasó a PENDIENTE_VERIFICACION
        Comercio c2Db = comercioRepository.findById(c2.getId()).orElseThrow();
        assertThat(c2Db.getEstado()).isEqualTo("PENDIENTE_VERIFICACION");

        // 6. Comercio visualiza su comprobante subido
        mockMvc.perform(get("/api/comercios/" + c2.getId() + "/suscripcion/comprobante")
                .header("Authorization", "Bearer " + comerciante.token))
                .andExpect(status().isOk());

        // 7. Admin consulta lista de suscripciones pendientes de verificación
        mockMvc.perform(get("/api/admin/suscripciones/pendientes")
                .header("Authorization", "Bearer " + admin.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + subId + ")].estado").value("PENDIENTE_VERIFICACION"));

        // 8. Admin rechaza el comprobante con motivo
        mockMvc.perform(post("/api/admin/suscripciones/" + subId + "/rechazar")
                .header("Authorization", "Bearer " + admin.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("motivo", "Valor transferido insuficiente"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("RECHAZADA"))
                .andExpect(jsonPath("$.motivoRechazo").value("Valor transferido insuficiente"));

        // La tienda permanece inactiva
        Comercio c2Rech = comercioRepository.findById(c2.getId()).orElseThrow();
        assertThat(c2Rech.getEstado()).isEqualTo("RECHAZADA");
        assertThat(c2Rech.getActivo()).isFalse();

        // 9. Comercio vuelve a subir el comprobante corregido
        mockMvc.perform(multipart("/api/comercios/" + c2.getId() + "/suscripcion/comprobante")
                .file(comprobante)
                .param("referencia", "TRANSF-COMPLETA-98765")
                .header("Authorization", "Bearer " + comerciante.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("PENDIENTE_VERIFICACION"));

        // 10. Admin visualiza el comprobante y lo aprueba
        mockMvc.perform(get("/api/admin/suscripciones/" + subId + "/comprobante")
                .header("Authorization", "Bearer " + admin.token))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/admin/suscripciones/" + subId + "/aprobar")
                .header("Authorization", "Bearer " + admin.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ACTIVA"))
                .andExpect(jsonPath("$.fechaFin").exists());

        // Tienda activada con éxito
        Comercio c2Activa = comercioRepository.findById(c2.getId()).orElseThrow();
        assertThat(c2Activa.getEstado()).isEqualTo("ACTIVA");
        assertThat(c2Activa.getActivo()).isTrue();

        // 11. Simulación de vencimiento: se forza fechaFin en el pasado
        Suscripcion subActiva = suscripcionRepository.findById(subId).orElseThrow();
        subActiva.setFechaFin(java.time.LocalDateTime.now(SuscripcionService.BOGOTA_ZONE).minusDays(1));
        suscripcionRepository.save(subActiva);

        // Ejecutar verificación programada de vencimientos
        int suspendidas = suscripcionService.verificarVencimientosSuscripciones();
        assertThat(suspendidas).isGreaterThanOrEqualTo(1);

        // La tienda y la suscripción deben estar ahora SUSPENDIDA_POR_MORA
        Suscripcion subMora = suscripcionRepository.findById(subId).orElseThrow();
        assertThat(subMora.getEstado()).isEqualTo("SUSPENDIDA_POR_MORA");

        Comercio c2Mora = comercioRepository.findById(c2.getId()).orElseThrow();
        assertThat(c2Mora.getEstado()).isEqualTo("SUSPENDIDA_POR_MORA");
        assertThat(c2Mora.getActivo()).isFalse();
    }
}
