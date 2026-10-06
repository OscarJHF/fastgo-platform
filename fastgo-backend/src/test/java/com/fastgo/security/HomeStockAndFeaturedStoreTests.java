package com.fastgo.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fastgo.dto.*;
import com.fastgo.entity.*;
import com.fastgo.repository.*;
import com.fastgo.jwt.JwtService;
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
public class HomeStockAndFeaturedStoreTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private CategoriaComercioRepository categoriaComercioRepository;

    @Autowired
    private ComercioRepository comercioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AuditoriaAdminRepository auditoriaAdminRepository;

    @Autowired
    private JwtService jwtService;

    private Integer categoriaComercioId;
    private String adminToken;
    private String clienteToken;

    private static class AuthResult {
        String token;
        Usuario usuario;
    }

    @BeforeEach
    void setUp() throws Exception {
        objectMapper.findAndRegisterModules();

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

        adminToken = crearAdmin("Super Admin").token;
        clienteToken = registrarYLogin("CLIENTE", "Cliente Test").token;
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

    private Comercio crearComercio(String token, String nombre) throws Exception {
        ComercioRequestDTO req = new ComercioRequestDTO();
        req.setNombre(nombre);
        req.setDescripcion("Descripción de " + nombre);
        req.setCategoriaId(categoriaComercioId);
        req.setTelefono("3112223344");
        req.setCorreo("contacto." + UUID.randomUUID().toString().substring(0, 8) + "@fastgo.com");
        req.setDireccion("Calle 100 # 15-20");
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

        ComercioResponseDTO c = objectMapper.readValue(res.getResponse().getContentAsString(), ComercioResponseDTO.class);
        return comercioRepository.findById(c.getId()).orElseThrow();
    }

    @Test
    @DisplayName("1. Comercio creado inicia con destacado = false")
    void testComercioDefaultDestacadoFalse() throws Exception {
        AuthResult merchant = registrarYLogin("COMERCIO", "Dueño Normal");
        Comercio c = crearComercio(merchant.token, "Tienda Normal " + UUID.randomUUID().toString().substring(0, 5));

        assertThat(c.getDestacado()).isFalse();

        // En DTO de respuesta pública
        MvcResult res = mockMvc.perform(get("/api/comercios/" + c.getId()))
                .andExpect(status().isOk())
                .andReturn();
        ComercioResponseDTO dto = objectMapper.readValue(res.getResponse().getContentAsString(), ComercioResponseDTO.class);
        assertThat(dto.getDestacado()).isFalse();
    }

    @Test
    @DisplayName("2. ADMIN marca tienda como destacada y se audita")
    void testAdminMarcaTiendaDestacada() throws Exception {
        AuthResult merchant = registrarYLogin("COMERCIO", "Dueño Destacable");
        Comercio c = crearComercio(merchant.token, "Tienda Destacable " + UUID.randomUUID().toString().substring(0, 5));

        // ADMIN marca destacado = true
        MvcResult putRes = mockMvc.perform(put("/api/admin/tiendas/" + c.getId() + "/destacado")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "destacado", true,
                                "razon", "Promoción especial de hamburguesas"
                        ))))
                .andExpect(status().isOk())
                .andReturn();

        AdminTiendaResponseDTO adminDto = objectMapper.readValue(putRes.getResponse().getContentAsString(), AdminTiendaResponseDTO.class);
        assertThat(adminDto.getDestacado()).isTrue();

        // Verificar en base de datos
        Comercio enDb = comercioRepository.findById(c.getId()).orElseThrow();
        assertThat(enDb.getDestacado()).isTrue();

        // Verificar en endpoint público de destacados
        MvcResult getDest = mockMvc.perform(get("/api/comercios/destacados"))
                .andExpect(status().isOk())
                .andReturn();
        List<ComercioResponseDTO> lista = objectMapper.readValue(
                getDest.getResponse().getContentAsString(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, ComercioResponseDTO.class)
        );
        assertThat(lista).anyMatch(item -> item.getId().equals(c.getId()) && Boolean.TRUE.equals(item.getDestacado()));

        // Verificar auditoría
        List<AuditoriaAdmin> auditoria = auditoriaAdminRepository.findAllByOrderByFechaDesc();
        assertThat(auditoria).anyMatch(a ->
                "DESTACAR_TIENDA".equals(a.getAccion()) &&
                String.valueOf(c.getId()).equals(a.getEntidadId())
        );
    }

    @Test
    @DisplayName("3. ADMIN desmarca tienda destacada y desaparece del endpoint de destacados")
    void testAdminDesmarcaTiendaDestacada() throws Exception {
        AuthResult merchant = registrarYLogin("COMERCIO", "Dueño Desmarcar");
        Comercio c = crearComercio(merchant.token, "Tienda Desmarcar " + UUID.randomUUID().toString().substring(0, 5));

        // Primero destacar
        mockMvc.perform(put("/api/admin/tiendas/" + c.getId() + "/destacado")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("destacado", true))))
                .andExpect(status().isOk());

        // Luego desmarcar
        mockMvc.perform(put("/api/admin/tiendas/" + c.getId() + "/destacado")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("destacado", false))))
                .andExpect(status().isOk());

        // Ya no aparece en /destacados
        MvcResult getDest = mockMvc.perform(get("/api/comercios/destacados"))
                .andExpect(status().isOk())
                .andReturn();
        List<ComercioResponseDTO> lista = objectMapper.readValue(
                getDest.getResponse().getContentAsString(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, ComercioResponseDTO.class)
        );
        assertThat(lista).noneMatch(item -> item.getId().equals(c.getId()));
    }

    @Test
    @DisplayName("4. No se puede destacar una tienda no operativa o suspendida")
    void testNoSePuedeDestacarTiendaSuspendida() throws Exception {
        AuthResult merchant = registrarYLogin("COMERCIO", "Dueño Suspendible");
        Comercio c = crearComercio(merchant.token, "Tienda Suspendible " + UUID.randomUUID().toString().substring(0, 5));

        // Suspender tienda
        mockMvc.perform(put("/api/admin/tiendas/" + c.getId() + "/suspender")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Intentar destacar -> debe fallar con 400
        mockMvc.perform(put("/api/admin/tiendas/" + c.getId() + "/destacado")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("destacado", true))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("5. CLIENTE u otro rol no puede modificar destacado (403 Forbidden)")
    void testClienteNoPuedeModificarDestacado() throws Exception {
        AuthResult merchant = registrarYLogin("COMERCIO", "Dueño RBAC");
        Comercio c = crearComercio(merchant.token, "Tienda RBAC " + UUID.randomUUID().toString().substring(0, 5));

        // Intento con token CLIENTE
        mockMvc.perform(put("/api/admin/tiendas/" + c.getId() + "/destacado")
                        .header("Authorization", "Bearer " + clienteToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("destacado", true))))
                .andExpect(status().isForbidden());

        // Intento con token COMERCIO
        mockMvc.perform(put("/api/admin/tiendas/" + c.getId() + "/destacado")
                        .header("Authorization", "Bearer " + merchant.token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("destacado", true))))
                .andExpect(status().isForbidden());
    }
}
