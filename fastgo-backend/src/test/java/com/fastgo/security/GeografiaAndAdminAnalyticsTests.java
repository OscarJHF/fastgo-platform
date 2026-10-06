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
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class GeografiaAndAdminAnalyticsTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaComercioRepository categoriaComercioRepository;

    @Autowired
    private ComercioRepository comercioRepository;

    @Autowired
    private SucursalRepository sucursalRepository;

    @Autowired
    private DepartamentoRepository departamentoRepository;

    @Autowired
    private MunicipioRepository municipioRepository;

    @Autowired
    private AnalyticsEventRepository analyticsEventRepository;

    @Autowired
    private AuditoriaAdminRepository auditoriaAdminRepository;

    private String adminToken;
    private String comercioToken;
    private Usuario adminUser;
    private Usuario comercioUser;
    private CategoriaComercio categoriaComercio;

    @BeforeEach
    void setUp() throws Exception {
        Rol rolAdmin = rolRepository.findByNombreIgnoreCase("ADMIN")
                .orElseGet(() -> rolRepository.save(new Rol(null, "ADMIN")));
        Rol rolComercio = rolRepository.findByNombreIgnoreCase("COMERCIO")
                .orElseGet(() -> rolRepository.save(new Rol(null, "COMERCIO")));
        Rol rolCliente = rolRepository.findByNombreIgnoreCase("CLIENTE")
                .orElseGet(() -> rolRepository.save(new Rol(null, "CLIENTE")));

        categoriaComercio = categoriaComercioRepository.findAll().stream()
                .filter(c -> "Restaurantes".equalsIgnoreCase(c.getNombre()))
                .findFirst()
                .orElseGet(() -> {
                    CategoriaComercio c = new CategoriaComercio();
                    c.setNombre("Restaurantes");
                    c.setActivo(true);
                    return categoriaComercioRepository.save(c);
                });

        String adminEmail = "admin.geo." + UUID.randomUUID().toString().substring(0, 8) + "@fastgo.com";
        adminUser = new Usuario();
        adminUser.setNombre("Admin");
        adminUser.setApellido("Geo");
        adminUser.setCorreo(adminEmail);
        adminUser.setTelefono("3001234567");
        adminUser.setPassword(passwordEncoder.encode("Password123"));
        adminUser.setEstado(true);
        adminUser.setRol(rolAdmin);
        adminUser.setRoles(new java.util.HashSet<>(List.of(rolAdmin)));
        adminUser = usuarioRepository.save(adminUser);

        String comEmail = "comercio.geo." + UUID.randomUUID().toString().substring(0, 8) + "@fastgo.com";
        comercioUser = new Usuario();
        comercioUser.setNombre("Comercio");
        comercioUser.setApellido("Geo");
        comercioUser.setCorreo(comEmail);
        comercioUser.setTelefono("3009876543");
        comercioUser.setPassword(passwordEncoder.encode("Password123"));
        comercioUser.setEstado(true);
        comercioUser.setRol(rolComercio);
        comercioUser.setRoles(new java.util.HashSet<>(List.of(rolComercio)));
        comercioUser = usuarioRepository.save(comercioUser);

        adminToken = obtenerToken(adminEmail, "Password123");
        comercioToken = obtenerToken(comEmail, "Password123");
    }

    private String obtenerToken(String email, String password) throws Exception {
        LoginRequest req = new LoginRequest();
        req.setCorreo(email);
        req.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        LoginResponse resp = objectMapper.readValue(result.getResponse().getContentAsString(), LoginResponse.class);
        return resp.getToken();
    }

    @Test
    @DisplayName("Catálogo DANE: Debe listar departamentos oficiales y municipios correspondientes")
    void testCatalogoDaneDepartamentosYMunicipios() throws Exception {
        MvcResult depResult = mockMvc.perform(get("/api/geografia/departamentos"))
                .andExpect(status().isOk())
                .andReturn();

        DepartamentoDTO[] departamentos = objectMapper.readValue(depResult.getResponse().getContentAsString(), DepartamentoDTO[].class);
        assertThat(departamentos.length).isGreaterThanOrEqualTo(33);

        boolean tieneCaldas = false;
        for (DepartamentoDTO d : departamentos) {
            if ("CALDAS".equalsIgnoreCase(d.getNombre())) {
                tieneCaldas = true;
                break;
            }
        }
        assertThat(tieneCaldas).isTrue();

        // Consultar municipios de Caldas por código DANE ("17")
        MvcResult munResult = mockMvc.perform(get("/api/geografia/departamentos/17/municipios"))
                .andExpect(status().isOk())
                .andReturn();

        MunicipioDTO[] municipios = objectMapper.readValue(munResult.getResponse().getContentAsString(), MunicipioDTO[].class);
        assertThat(municipios.length).isGreaterThanOrEqualTo(20);

        boolean tieneAguadas = false;
        boolean tienePacora = false;
        for (MunicipioDTO m : municipios) {
            if ("AGUADAS".equalsIgnoreCase(m.getNombre())) tieneAguadas = true;
            if ("PÁCORA".equalsIgnoreCase(m.getNombre()) || "PACORA".equalsIgnoreCase(m.getNombre())) tienePacora = true;
        }
        assertThat(tieneAguadas).isTrue();
        assertThat(tienePacora).isTrue();

        // Consultar municipio específico por código DANE de Aguadas (17013)
        mockMvc.perform(get("/api/geografia/municipios/17013"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codigoDane").value("17013"))
                .andExpect(jsonPath("$.nombre").value("AGUADAS"));
    }

    @Test
    @DisplayName("Filtro de Comercios por Departamento y Municipio")
    void testFiltroComerciosPorUbicacion() throws Exception {
        // Crear comercio en Aguadas, Caldas
        ComercioRequestDTO req1 = new ComercioRequestDTO();
        req1.setCategoriaId(categoriaComercio.getId());
        req1.setNombre("Tienda Aguadas " + UUID.randomUUID().toString().substring(0, 5));
        req1.setDescripcion("Tienda en Aguadas Caldas");
        req1.setTelefono("3111111111");
        req1.setTarifaDomicilio(BigDecimal.valueOf(2500));
        req1.setDepartamentoId("17"); // Caldas
        req1.setMunicipioId("17013"); // Aguadas
        req1.setDireccion("Calle 5 # 4-20");
        req1.setCiudad("Aguadas");

        MvcResult res1 = mockMvc.perform(post("/api/comercios")
                        .header("Authorization", "Bearer " + comercioToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isOk())
                .andReturn();

        ComercioResponseDTO c1 = objectMapper.readValue(res1.getResponse().getContentAsString(), ComercioResponseDTO.class);

        // Activar el comercio para que aparezca en el listado público
        comercioRepository.findById(c1.getId()).ifPresent(c -> {
            c.setActivo(true);
            c.setEstado("ACTIVA");
            comercioRepository.save(c);
        });

        // Filtrar comercios por departamento Caldas (17)
        MvcResult listadoCaldas = mockMvc.perform(get("/api/comercios?departamentoId=17"))
                .andExpect(status().isOk())
                .andReturn();

        ComercioResponseDTO[] caldasTiendas = objectMapper.readValue(listadoCaldas.getResponse().getContentAsString(), ComercioResponseDTO[].class);
        boolean encontradoAguadas = false;
        for (ComercioResponseDTO ct : caldasTiendas) {
            if (ct.getId().equals(c1.getId())) {
                encontradoAguadas = true;
                break;
            }
        }
        assertThat(encontradoAguadas).isTrue();

        // Filtrar por municipio inexistente o diferente (Amazonas: Leticia 91001)
        MvcResult listadoOtro = mockMvc.perform(get("/api/comercios?municipioId=91001"))
                .andExpect(status().isOk())
                .andReturn();

        ComercioResponseDTO[] otrasTiendas = objectMapper.readValue(listadoOtro.getResponse().getContentAsString(), ComercioResponseDTO[].class);
        for (ComercioResponseDTO ot : otrasTiendas) {
            assertThat(ot.getId()).isNotEqualTo(c1.getId());
        }
    }

    @Test
    @DisplayName("Admin: Soft-delete de Tienda con métricas y registro en auditoría")
    void testAdminEliminarTiendaLogica() throws Exception {
        ComercioRequestDTO req = new ComercioRequestDTO();
        req.setCategoriaId(categoriaComercio.getId());
        req.setNombre("Tienda Para Eliminar " + UUID.randomUUID().toString().substring(0, 5));
        req.setDescripcion("Para soft delete");
        req.setTelefono("3112223344");
        req.setTarifaDomicilio(BigDecimal.valueOf(3000));
        req.setDireccion("Calle 10 # 2-30");
        req.setCiudad("Manizales");

        MvcResult res = mockMvc.perform(post("/api/comercios")
                        .header("Authorization", "Bearer " + comercioToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        ComercioResponseDTO c = objectMapper.readValue(res.getResponse().getContentAsString(), ComercioResponseDTO.class);

        // Soft delete como Admin
        mockMvc.perform(delete("/api/admin/tiendas/" + c.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("razon", "Cierre voluntario por solicitud del comercio"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ELIMINADA"))
                .andExpect(jsonPath("$.activo").value(false));

        // Verificar que en base de datos el registro NO fue eliminado físicamente
        Comercio enBd = comercioRepository.findById(c.getId()).orElse(null);
        assertThat(enBd).isNotNull();
        assertThat(enBd.getEstado()).isEqualTo("ELIMINADA");
        assertThat(enBd.getActivo()).isFalse();

        // Verificar auditoría
        List<AuditoriaAdmin> auditoria = auditoriaAdminRepository.findByEntidadAndEntidadIdOrderByFechaDesc("COMERCIO", String.valueOf(c.getId()));
        assertThat(auditoria).isNotEmpty();
        assertThat(auditoria.get(0).getAccion()).isEqualTo("ELIMINAR_TIENDA");
    }

    @Test
    @DisplayName("Admin: Modificación de usuario, cambio de estado y protección del último admin")
    void testAdminGestionUsuariosYProteccionUltimoAdmin() throws Exception {
        // 1. Modificar datos de usuario
        AdminUsuarioModificarRequest modReq = new AdminUsuarioModificarRequest();
        modReq.setNombre("ComercioModificado");
        modReq.setApellido("ApellidoMod");
        modReq.setCorreo(comercioUser.getCorreo());
        modReq.setTelefono("3159998877");

        mockMvc.perform(put("/api/admin/usuarios/" + comercioUser.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(modReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("ComercioModificado"))
                .andExpect(jsonPath("$.telefono").value("3159998877"));

        // 2. Desactivar usuario regular
        mockMvc.perform(put("/api/admin/usuarios/" + comercioUser.getId() + "/estado")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("estado", false, "motivo", "Inactividad temporal"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value(false));

        // 3. Reactivar usuario regular
        mockMvc.perform(put("/api/admin/usuarios/" + comercioUser.getId() + "/estado")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("estado", true, "motivo", "Reactivado por solicitud"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value(true));

        // 4. Reset password seguro
        MvcResult resetRes = mockMvc.perform(post("/api/admin/usuarios/" + comercioUser.getId() + "/reset-password")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.temporalPassword").isNotEmpty())
                .andReturn();

        // 5. Protección estricta del último admin:
        // Aseguramos que solo quede un admin activo
        List<Usuario> admins = usuarioRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getEstado()) && u.hasRole("ADMIN"))
                .toList();

        List<Usuario> deactivated = new java.util.ArrayList<>();
        try {
            // Desactivamos otros admins de prueba si existen para aislar al último
            for (Usuario a : admins) {
                if (!a.getId().equals(adminUser.getId())) {
                    a.setEstado(false);
                    deactivated.add(usuarioRepository.save(a));
                }
            }

            // Intentar desactivar al único admin activo -> Debe fallar
            mockMvc.perform(put("/api/admin/usuarios/" + adminUser.getId() + "/estado")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(Map.of("estado", false))))
                    .andExpect(status().is4xxClientError());

            // Intentar remover el rol ADMIN al único admin activo -> Debe fallar
            mockMvc.perform(put("/api/admin/usuarios/" + adminUser.getId() + "/roles")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(Map.of("roles", List.of("CLIENTE")))))
                    .andExpect(status().is4xxClientError());
        } finally {
            for (Usuario a : deactivated) {
                a.setEstado(true);
                usuarioRepository.save(a);
            }
        }
    }

    @Test
    @DisplayName("Analítica Central: Registro público de eventos, idempotencia de APP_FIRST_OPEN y métricas admin")
    void testAnaliticaCentralYMetricas() throws Exception {
        String anonId = "redmi9-" + UUID.randomUUID();

        AnalyticsEventRequestDTO trackReq = new AnalyticsEventRequestDTO();
        trackReq.setEventType("APP_FIRST_OPEN");
        trackReq.setAnonymousId(anonId);
        trackReq.setPlatform("ANDROID");
        trackReq.setAppVersion("2.2.3");
        trackReq.setPathOrScreen("HomeScreen");
        trackReq.setUtmSource("google_play");

        // 1. Primer registro -> Debe registrarse
        mockMvc.perform(post("/api/analytics/track")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(trackReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));

        // 2. Segundo registro con mismo anonymousId -> Debe retornar 200 sin duplicar fila
        mockMvc.perform(post("/api/analytics/track")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(trackReq)))
                .andExpect(status().isOk());

        long countFirstOpen = analyticsEventRepository.findAll().stream()
                .filter(e -> anonId.equals(e.getAnonymousId()) && "APP_FIRST_OPEN".equals(e.getEventType()))
                .count();
        assertThat(countFirstOpen).isEqualTo(1);

        // 3. Registrar eventos de navegación y descarga
        AnalyticsEventRequestDTO viewReq = new AnalyticsEventRequestDTO();
        viewReq.setEventType("PAGE_VIEW");
        viewReq.setPlatform("WEB");
        viewReq.setPathOrScreen("/descargar");
        mockMvc.perform(post("/api/analytics/track")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(viewReq)))
                .andExpect(status().isOk());

        AnalyticsEventRequestDTO dlReq = new AnalyticsEventRequestDTO();
        dlReq.setEventType("APK_DOWNLOAD");
        dlReq.setPlatform("WEB");
        dlReq.setPathOrScreen("/descargar/apk");
        mockMvc.perform(post("/api/analytics/track")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dlReq)))
                .andExpect(status().isOk());

        // 4. Consultar métricas como ADMIN
        mockMvc.perform(get("/api/analytics/metricas?periodo=7_DIAS")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.zonaHoraria").value("America/Bogota"))
                .andExpect(jsonPath("$.resumen").exists())
                .andExpect(jsonPath("$.resumen.totalVisitas").isNumber())
                .andExpect(jsonPath("$.embudo").isArray())
                .andExpect(jsonPath("$.embudo.length()").value(6))
                .andExpect(jsonPath("$.embudo[0].etapa").value("Visitas"))
                .andExpect(jsonPath("$.embudo[1].etapa").value("Descargas APK"))
                .andExpect(jsonPath("$.embudo[2].etapa").value("Primer Inicio App"))
                .andExpect(jsonPath("$.embudo[3].etapa").value("Registros"))
                .andExpect(jsonPath("$.embudo[4].etapa").value("Pedidos Creados"))
                .andExpect(jsonPath("$.embudo[5].etapa").value("Pedidos Entregados"))
                .andExpect(jsonPath("$.tendencias").isArray());

        // 5. Exportar CSV como ADMIN
        mockMvc.perform(get("/api/analytics/exportar?periodo=30_DIAS")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", org.hamcrest.Matchers.containsString("text/csv")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("event_type")));
    }
}
