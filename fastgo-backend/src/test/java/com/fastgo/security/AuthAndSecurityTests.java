package com.fastgo.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fastgo.dto.LoginRequest;
import com.fastgo.dto.RegistroUsuarioRequest;
import com.fastgo.entity.Rol;
import com.fastgo.entity.Usuario;
import com.fastgo.jwt.JwtService;
import com.fastgo.repository.RolRepository;
import com.fastgo.repository.UsuarioRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
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

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthAndSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Value("${fastgo.jwt.secret}")
    private String jwtSecret;

    private Usuario clienteTest;
    private Usuario adminTest;
    private Usuario inactivoTest;

    @BeforeEach
    void setUp() {
        Rol rolCliente = rolRepository.findByNombreIgnoreCase("CLIENTE")
                .orElseGet(() -> {
                    Rol r = new Rol();
                    r.setNombre("CLIENTE");
                    return rolRepository.save(r);
                });

        Rol rolAdmin = rolRepository.findByNombreIgnoreCase("ADMIN")
                .orElseGet(() -> {
                    Rol r = new Rol();
                    r.setNombre("ADMIN");
                    return rolRepository.save(r);
                });

        clienteTest = usuarioRepository.findByCorreo("test.auth.cliente@fastgo.com")
                .orElseGet(() -> {
                    Usuario u = new Usuario();
                    u.setNombre("Cliente");
                    u.setApellido("Auth");
                    u.setCorreo("test.auth.cliente@fastgo.com");
                    u.setPassword(passwordEncoder.encode("Password123"));
                    u.setRol(rolCliente);
                    u.setEstado(true);
                    return usuarioRepository.save(u);
                });

        adminTest = usuarioRepository.findByCorreo("test.auth.admin@fastgo.com")
                .orElseGet(() -> {
                    Usuario u = new Usuario();
                    u.setNombre("Admin");
                    u.setApellido("Auth");
                    u.setCorreo("test.auth.admin@fastgo.com");
                    u.setPassword(passwordEncoder.encode("Password123"));
                    u.setRol(rolAdmin);
                    u.setEstado(true);
                    return usuarioRepository.save(u);
                });

        inactivoTest = usuarioRepository.findByCorreo("test.auth.inactivo@fastgo.com")
                .orElseGet(() -> {
                    Usuario u = new Usuario();
                    u.setNombre("Inactivo");
                    u.setApellido("Auth");
                    u.setCorreo("test.auth.inactivo@fastgo.com");
                    u.setPassword(passwordEncoder.encode("Password123"));
                    u.setRol(rolCliente);
                    u.setEstado(false);
                    return usuarioRepository.save(u);
                });
    }

    @Test
    @DisplayName("Login exitoso devuelve token JWT y mensaje de bienvenida")
    void testLoginExitoso() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setCorreo("test.auth.cliente@fastgo.com");
        req.setPassword("Password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", not(emptyOrNullString())))
                .andExpect(jsonPath("$.mensaje", containsString("Bienvenido")));
    }

    @Test
    @DisplayName("Login con contraseña errónea devuelve 401")
    void testLoginPasswordIncorrecto() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setCorreo("test.auth.cliente@fastgo.com");
        req.setPassword("PasswordIncorrecto99");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Login con usuario inexistente devuelve 401")
    void testLoginUsuarioInexistente() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setCorreo("inexistente999@fastgo.com");
        req.setPassword("Password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Login con usuario inactivo/deshabilitado devuelve 401")
    void testLoginUsuarioInactivo() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setCorreo("test.auth.inactivo@fastgo.com");
        req.setPassword("Password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Registro público asigna únicamente rol CLIENTE e impide role tampering")
    void testRegistroClienteNoPermiteRoleTampering() throws Exception {
        String correoUnico = "nuevo.usuario." + System.currentTimeMillis() + "@fastgo.com";
        RegistroUsuarioRequest req = new RegistroUsuarioRequest();
        req.setNombre("Nuevo");
        req.setApellido("Usuario");
        req.setCorreo(correoUnico);
        req.setPassword("Password123");

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo", is(correoUnico)))
                .andExpect(jsonPath("$.rol", is("CLIENTE")));

        Usuario u = usuarioRepository.findByCorreo(correoUnico).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals("CLIENTE", u.getRol().getNombre());
    }

    @Test
    @DisplayName("Endpoint protegido sin token devuelve 401")
    void testEndpointProtegidoSinToken() throws Exception {
        mockMvc.perform(get("/api/usuarios/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Endpoint protegido con token inválido devuelve 401")
    void testEndpointProtegidoTokenInvalido() throws Exception {
        mockMvc.perform(get("/api/usuarios/me")
                        .header("Authorization", "Bearer token_completamente_invalido_xyz"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Endpoint protegido con token manipulado/firma falsa devuelve 401")
    void testEndpointProtegidoTokenFirmaFalsa() throws Exception {
        String secretFalso = "SecretoFalsoParaIntentarFalsificarToken32CharsMin";
        var keyFalsa = Keys.hmacShaKeyFor(secretFalso.getBytes(StandardCharsets.UTF_8));
        String tokenFalso = Jwts.builder()
                .subject("test.auth.admin@fastgo.com")
                .claim("rol", "ADMIN")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(keyFalsa)
                .compact();

        mockMvc.perform(get("/api/usuarios/me")
                        .header("Authorization", "Bearer " + tokenFalso))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Endpoint protegido con token expirado devuelve 401")
    void testEndpointProtegidoTokenExpirado() throws Exception {
        var key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        String tokenExpirado = Jwts.builder()
                .subject("test.auth.cliente@fastgo.com")
                .claim("rol", "CLIENTE")
                .issuedAt(new Date(System.currentTimeMillis() - 7200000))
                .expiration(new Date(System.currentTimeMillis() - 3600000))
                .signWith(key)
                .compact();

        mockMvc.perform(get("/api/usuarios/me")
                        .header("Authorization", "Bearer " + tokenExpirado))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Cliente autenticado intentando acceder a ruta de ADMIN devuelve 403")
    void testClienteAccediendoRutaAdminDebeRetornar403() throws Exception {
        String tokenCliente = jwtService.generarToken(clienteTest.getCorreo(), "CLIENTE");

        mockMvc.perform(get("/api/usuarios")
                        .header("Authorization", "Bearer " + tokenCliente))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin autenticado puede acceder a GET /api/usuarios")
    void testAdminAccediendoRutaAdminRetorna200() throws Exception {
        String tokenAdmin = jwtService.generarToken(adminTest.getCorreo(), "ADMIN");

        mockMvc.perform(get("/api/usuarios")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)));
    }

    @Test
    @DisplayName("Ruta pública /api/test/publico accesible sin token")
    void testRutaPublicaSinToken() throws Exception {
        mockMvc.perform(get("/api/test/publico"))
                .andExpect(status().isOk());
    }
}
