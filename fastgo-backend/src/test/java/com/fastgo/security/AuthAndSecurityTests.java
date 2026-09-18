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

    @Autowired
    private com.fastgo.repository.PasswordResetTokenRepository passwordResetTokenRepository;

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

        rolRepository.findByNombreIgnoreCase("COMERCIO")
                .orElseGet(() -> {
                    Rol r = new Rol();
                    r.setNombre("COMERCIO");
                    return rolRepository.save(r);
                });

        rolRepository.findByNombreIgnoreCase("DOMICILIARIO")
                .orElseGet(() -> {
                    Rol r = new Rol();
                    r.setNombre("DOMICILIARIO");
                    return rolRepository.save(r);
                });

        clienteTest = usuarioRepository.findByCorreo("test.auth.cliente@fastgo.com")
                .orElseGet(() -> {
                    Usuario u = new Usuario();
                    u.setNombre("Cliente");
                    u.setApellido("Auth");
                    u.setCorreo("test.auth.cliente@fastgo.com");
                    u.setRol(rolCliente);
                    u.setEstado(true);
                    return u;
                });
        clienteTest.setPassword(passwordEncoder.encode("Password123"));
        clienteTest = usuarioRepository.save(clienteTest);

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
    @DisplayName("Registro público asigna únicamente rol CLIENTE cuando no se especifica rol")
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
    @DisplayName("Registro público permite registrarse como COMERCIO")
    void testRegistroConRolComercioExitoso() throws Exception {
        String correoUnico = "comercio." + System.currentTimeMillis() + "@fastgo.com";
        RegistroUsuarioRequest req = new RegistroUsuarioRequest();
        req.setNombre("Nuevo");
        req.setApellido("Comercio");
        req.setCorreo(correoUnico);
        req.setPassword("Password123");
        req.setRol("COMERCIO");

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo", is(correoUnico)))
                .andExpect(jsonPath("$.rol", is("COMERCIO")));

        Usuario u = usuarioRepository.findByCorreo(correoUnico).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals("COMERCIO", u.getRol().getNombre());
    }

    @Test
    @DisplayName("Registro público permite registrarse como DOMICILIARIO")
    void testRegistroConRolDomiciliarioExitoso() throws Exception {
        String correoUnico = "domiciliario." + System.currentTimeMillis() + "@fastgo.com";
        RegistroUsuarioRequest req = new RegistroUsuarioRequest();
        req.setNombre("Nuevo");
        req.setApellido("Domiciliario");
        req.setCorreo(correoUnico);
        req.setPassword("Password123");
        req.setRol("DOMICILIARIO");

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo", is(correoUnico)))
                .andExpect(jsonPath("$.rol", is("DOMICILIARIO")));

        Usuario u = usuarioRepository.findByCorreo(correoUnico).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals("DOMICILIARIO", u.getRol().getNombre());
    }

    @Test
    @DisplayName("Registro público rechaza intento de registro con rol ADMIN")
    void testRegistroConRolAdminEsRechazado() throws Exception {
        String correoUnico = "intento.admin." + System.currentTimeMillis() + "@fastgo.com";
        RegistroUsuarioRequest req = new RegistroUsuarioRequest();
        req.setNombre("Hacker");
        req.setApellido("Admin");
        req.setCorreo(correoUnico);
        req.setPassword("Password123");
        req.setRol("ADMIN");

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Registro público permite múltiples usuarios con el mismo número telefónico")
    void testRegistroPermiteTelefonosDuplicados() throws Exception {
        String telefonoCompartido = "3007654321";
        String correo1 = "tel.user1." + System.currentTimeMillis() + "@fastgo.com";
        String correo2 = "tel.user2." + (System.currentTimeMillis() + 1) + "@fastgo.com";

        RegistroUsuarioRequest req1 = new RegistroUsuarioRequest();
        req1.setNombre("Usuario");
        req1.setApellido("Uno");
        req1.setCorreo(correo1);
        req1.setPassword("Password123");
        req1.setTelefono(telefonoCompartido);

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.telefono", is(telefonoCompartido)));

        RegistroUsuarioRequest req2 = new RegistroUsuarioRequest();
        req2.setNombre("Usuario");
        req2.setApellido("Dos");
        req2.setCorreo(correo2);
        req2.setPassword("Password123");
        req2.setTelefono(telefonoCompartido);

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.telefono", is(telefonoCompartido)));

        Usuario u1 = usuarioRepository.findByCorreo(correo1).orElseThrow();
        Usuario u2 = usuarioRepository.findByCorreo(correo2).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(telefonoCompartido, u1.getTelefono());
        org.junit.jupiter.api.Assertions.assertEquals(telefonoCompartido, u2.getTelefono());
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

    @Test
    @DisplayName("Recuperación de contraseña responde mensaje idéntico para usuario existente o inexistente (evita enumeración)")
    void testRecuperacionPasswordNoEnumeracion() throws Exception {
        com.fastgo.dto.ForgotPasswordRequest reqExistente = new com.fastgo.dto.ForgotPasswordRequest(clienteTest.getCorreo());
        com.fastgo.dto.ForgotPasswordRequest reqInexistente = new com.fastgo.dto.ForgotPasswordRequest("inexistente." + System.currentTimeMillis() + "@fastgo.com");

        final String esperado = "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.";

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqExistente)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is(esperado)));

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqInexistente)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is(esperado)));
    }

    @Test
    @DisplayName("Reset de contraseña con token válido actualiza las credenciales")
    void testResetPasswordFlujoExitoso() throws Exception {
        String correoReset = "reset.user." + System.currentTimeMillis() + "@fastgo.com";
        Usuario resetUser = new Usuario();
        resetUser.setNombre("User");
        resetUser.setApellido("Reset");
        resetUser.setCorreo(correoReset);
        resetUser.setPassword(passwordEncoder.encode("PasswordOriginal123"));
        resetUser.setRol(rolRepository.findByNombreIgnoreCase("CLIENTE").orElseThrow());
        resetUser.setEstado(true);
        resetUser = usuarioRepository.save(resetUser);

        com.fastgo.dto.ForgotPasswordRequest req = new com.fastgo.dto.ForgotPasswordRequest(correoReset);
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        java.util.List<com.fastgo.entity.PasswordResetToken> tokens =
                passwordResetTokenRepository.findByUsuarioAndUtilizadoFalse(resetUser);
        org.junit.jupiter.api.Assertions.assertFalse(tokens.isEmpty(), "Debe existir al menos un token generado");
        String token = tokens.get(0).getToken();

        com.fastgo.dto.ResetPasswordRequest resetReq = new com.fastgo.dto.ResetPasswordRequest(token, "NuevaPasswordSegura123");
        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("actualizada")));

        // Intentar autenticar con la nueva contraseña
        com.fastgo.dto.LoginRequest loginReq = new com.fastgo.dto.LoginRequest(correoReset, "NuevaPasswordSegura123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    @DisplayName("Reset de contraseña falla con token expirado")
    void testResetPasswordTokenExpirado() throws Exception {
        String tokenExpirado = java.util.UUID.randomUUID().toString();
        com.fastgo.entity.PasswordResetToken expired = new com.fastgo.entity.PasswordResetToken(
                clienteTest,
                tokenExpirado,
                java.time.LocalDateTime.now().minusMinutes(5)
        );
        passwordResetTokenRepository.save(expired);

        com.fastgo.dto.ResetPasswordRequest resetReq = new com.fastgo.dto.ResetPasswordRequest(tokenExpirado, "PasswordTest123");
        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("Token de recuperación es de un solo uso y no puede reutilizarse")
    void testResetPasswordTokenUnicoUso() throws Exception {
        String token = java.util.UUID.randomUUID().toString();
        com.fastgo.entity.PasswordResetToken resetToken = new com.fastgo.entity.PasswordResetToken(
                clienteTest,
                token,
                java.time.LocalDateTime.now().plusMinutes(30)
        );
        passwordResetTokenRepository.save(resetToken);

        com.fastgo.dto.ResetPasswordRequest resetReq = new com.fastgo.dto.ResetPasswordRequest(token, "PasswordValida1");
        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isOk());

        // Segundo intento con el mismo token debe ser rechazado
        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().is4xxClientError());
    }
}
