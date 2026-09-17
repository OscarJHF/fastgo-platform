package com.fastgo.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fastgo.dto.ActualizarEstadoEncomiendaRequest;
import com.fastgo.dto.CalcularTarifaRequest;
import com.fastgo.dto.CrearEncomiendaRequest;
import com.fastgo.dto.RegistroUsuarioRequest;
import com.fastgo.entity.Rol;
import com.fastgo.entity.Usuario;
import com.fastgo.jwt.JwtService;
import com.fastgo.repository.RolRepository;
import com.fastgo.repository.UsuarioRepository;
import com.fastgo.service.TarifaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EncomiendasAndRolesV2Tests {

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
    private TarifaService tarifaService;

    private String tokenCliente;
    private String tokenDomiciliario;

    @BeforeEach
    void setUp() {
        // Asegurar roles
        Rol rolCliente = rolRepository.findByNombreIgnoreCase("CLIENTE").orElseGet(() -> {
            Rol r = new Rol();
            r.setNombre("CLIENTE");
            return rolRepository.save(r);
        });

        Rol rolDom = rolRepository.findByNombreIgnoreCase("DOMICILIARIO").orElseGet(() -> {
            Rol r = new Rol();
            r.setNombre("DOMICILIARIO");
            return rolRepository.save(r);
        });

        Rol rolCom = rolRepository.findByNombreIgnoreCase("COMERCIO").orElseGet(() -> {
            Rol r = new Rol();
            r.setNombre("COMERCIO");
            return rolRepository.save(r);
        });

        // Crear o actualizar cliente y domiciliario de pruebas
        Usuario c = usuarioRepository.findByCorreoAndRolId("cliente.v2@fastgo.com", rolCliente.getId())
                .orElseGet(() -> {
                    Usuario u = new Usuario();
                    u.setNombre("Cliente");
                    u.setApellido("V2");
                    u.setCorreo("cliente.v2@fastgo.com");
                    u.setPassword(passwordEncoder.encode("Password123"));
                    u.setRol(rolCliente);
                    u.setEstado(true);
                    return usuarioRepository.save(u);
                });

        Usuario d = usuarioRepository.findByCorreoAndRolId("domiciliario.v2@fastgo.com", rolDom.getId())
                .orElseGet(() -> {
                    Usuario u = new Usuario();
                    u.setNombre("Domiciliario");
                    u.setApellido("V2");
                    u.setCorreo("domiciliario.v2@fastgo.com");
                    u.setPassword(passwordEncoder.encode("Password123"));
                    u.setRol(rolDom);
                    u.setEstado(true);
                    return usuarioRepository.save(u);
                });

        tokenCliente = jwtService.generarToken(c.getCorreo(), "CLIENTE");
        tokenDomiciliario = jwtService.generarToken(d.getCorreo(), "DOMICILIARIO");
    }

    @Test
    @DisplayName("Cálculo oficial de tarifas: Base $2.000 + ceil(d) * $200 para d > 1 km")
    void testCalculoTarifasOficiales() throws Exception {
        // 0.8 km -> $2.000
        assertThat(tarifaService.calcularTarifaPorDistancia(BigDecimal.valueOf(0.8)))
                .isEqualByComparingTo(BigDecimal.valueOf(2000));

        // 1.0 km -> $2.000
        assertThat(tarifaService.calcularTarifaPorDistancia(BigDecimal.valueOf(1.0)))
                .isEqualByComparingTo(BigDecimal.valueOf(2000));

        // 2.0 km -> $2.400
        assertThat(tarifaService.calcularTarifaPorDistancia(BigDecimal.valueOf(2.0)))
                .isEqualByComparingTo(BigDecimal.valueOf(2400));

        // 3.0 km -> $2.600
        assertThat(tarifaService.calcularTarifaPorDistancia(BigDecimal.valueOf(3.0)))
                .isEqualByComparingTo(BigDecimal.valueOf(2600));

        // 4.0 km -> $2.800
        assertThat(tarifaService.calcularTarifaPorDistancia(BigDecimal.valueOf(4.0)))
                .isEqualByComparingTo(BigDecimal.valueOf(2800));

        // 5.4 km -> ceil(5.4)=6 -> 2000 + 6*200 = $3.200 COP (Ejemplo exacto del requerimiento)
        assertThat(tarifaService.calcularTarifaPorDistancia(BigDecimal.valueOf(5.4)))
                .isEqualByComparingTo(BigDecimal.valueOf(3200));

        // Endpoint REST público POST /api/domicilios/calcular-tarifa
        CalcularTarifaRequest req = new CalcularTarifaRequest();
        req.setDistanciaKm(BigDecimal.valueOf(5.4));

        mockMvc.perform(post("/api/domicilios/calcular-tarifa")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.costoEnvio").value(3200))
                .andExpect(jsonPath("$.tarifaBase").value(2000));
    }

    @Test
    @DisplayName("Regla de una sola cuenta por rol para el mismo usuario y rechazo de duplicado")
    void testUnicaCuentaPorRolYRechazoDuplicado() throws Exception {
        String testEmail = "multi.rol.user@fastgo.com";
        usuarioRepository.deleteAll(usuarioRepository.findAllByCorreo(testEmail));

        // 1. Registro inicial como CLIENTE -> OK
        RegistroUsuarioRequest regCliente = new RegistroUsuarioRequest();
        regCliente.setNombre("Oscar");
        regCliente.setApellido("Perez");
        regCliente.setCorreo(testEmail);
        regCliente.setPassword("Password123!");
        regCliente.setTelefono("3110001122");
        regCliente.setRol("CLIENTE");

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regCliente)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value(testEmail))
                .andExpect(jsonPath("$.rol").value("CLIENTE"));

        // 2. Segundo intento como CLIENTE -> Debe ser RECHAZADO
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regCliente)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("El usuario ya tiene una cuenta registrada con el rol CLIENTE")));

        // 3. Mismo correo registrándose como DOMICILIARIO -> Permitido (reutiliza datos)
        RegistroUsuarioRequest regDom = new RegistroUsuarioRequest();
        regDom.setNombre("Oscar");
        regDom.setApellido("Perez");
        regDom.setCorreo(testEmail);
        regDom.setPassword("Password123!");
        regDom.setTelefono("3110001122");
        regDom.setRol("DOMICILIARIO");

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regDom)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value(testEmail))
                .andExpect(jsonPath("$.rol").value("DOMICILIARIO"));

        // 4. Segundo intento como DOMICILIARIO -> Rechazado
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regDom)))
                .andExpect(status().isBadRequest());

        // 5. Mismo correo registrándose como COMERCIO -> Permitido
        RegistroUsuarioRequest regCom = new RegistroUsuarioRequest();
        regCom.setNombre("Oscar");
        regCom.setApellido("Perez");
        regCom.setCorreo(testEmail);
        regCom.setPassword("Password123!");
        regCom.setTelefono("3110001122");
        regCom.setRol("COMERCIO");

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regCom)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value(testEmail))
                .andExpect(jsonPath("$.rol").value("COMERCIO"));

        // 6. Endpoint de datos reutilizables
        mockMvc.perform(get("/api/usuarios/datos-reutilizables?correo=" + testEmail))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Oscar"))
                .andExpect(jsonPath("$.apellido").value("Perez"))
                .andExpect(jsonPath("$.telefono").value("3110001122"))
                .andExpect(jsonPath("$.rolesExistentes", org.hamcrest.Matchers.hasItems("CLIENTE", "DOMICILIARIO", "COMERCIO")));
    }

    @Test
    @DisplayName("Flujo completo del ciclo de Encomienda: PENDIENTE -> ACEPTADA -> EN_RECOGIDA -> EN_CAMINO -> ENTREGADA")
    void testFlujoCompletoEncomienda() throws Exception {
        // 1. Cliente crea encomienda
        CrearEncomiendaRequest crear = new CrearEncomiendaRequest();
        crear.setRemitenteNombre("Remitente Aguadas");
        crear.setRemitenteTelefono("3001234567");
        crear.setDireccionOrigen("Plaza Principal, Aguadas, Caldas");
        crear.setOrigenLat(BigDecimal.valueOf(5.6075));
        crear.setOrigenLng(BigDecimal.valueOf(-75.4561));

        crear.setDestinatarioNombre("Destinatario Manizales");
        crear.setDestinatarioTelefono("3109876543");
        crear.setDireccionDestino("Carrera 23 # 45-67, Manizales");
        crear.setDestinoLat(BigDecimal.valueOf(5.0689));
        crear.setDestinoLng(BigDecimal.valueOf(-75.5174));

        crear.setDescripcion("Documentos urgentes y paquete pequeño");
        crear.setTamanoPeso("Mediano / 2 kg");
        crear.setDistanciaKm(BigDecimal.valueOf(5.4));
        crear.setTarifaAceptada(true);

        MvcResult resultCrear = mockMvc.perform(post("/api/encomiendas")
                        .header("Authorization", "Bearer " + tokenCliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crear)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.estado").value("PENDIENTE"))
                .andExpect(jsonPath("$.costoEnvio").value(3200)) // Base $2000 + 6*200
                .andExpect(jsonPath("$.tarifaAceptada").value(true))
                .andReturn();

        JsonNode nodo = objectMapper.readTree(resultCrear.getResponse().getContentAsString());
        int encomiendaId = nodo.get("id").asInt();

        // 2. Domiciliario consulta encomiendas disponibles
        mockMvc.perform(get("/api/encomiendas/disponibles")
                        .header("Authorization", "Bearer " + tokenDomiciliario))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.not(org.hamcrest.Matchers.empty())));

        // 3. Domiciliario toma la encomienda -> pasa a ACEPTADA
        mockMvc.perform(put("/api/encomiendas/" + encomiendaId + "/tomar")
                        .header("Authorization", "Bearer " + tokenDomiciliario))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ACEPTADA"))
                .andExpect(jsonPath("$.domiciliarioId").exists());

        // 4. Domiciliario avanza a EN_RECOGIDA
        ActualizarEstadoEncomiendaRequest reqRecogida = new ActualizarEstadoEncomiendaRequest("EN_RECOGIDA");
        mockMvc.perform(put("/api/encomiendas/" + encomiendaId + "/estado")
                        .header("Authorization", "Bearer " + tokenDomiciliario)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqRecogida)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("EN_RECOGIDA"));

        // 5. Domiciliario avanza a EN_CAMINO
        ActualizarEstadoEncomiendaRequest reqCamino = new ActualizarEstadoEncomiendaRequest("EN_CAMINO");
        mockMvc.perform(put("/api/encomiendas/" + encomiendaId + "/estado")
                        .header("Authorization", "Bearer " + tokenDomiciliario)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqCamino)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("EN_CAMINO"));

        // 6. Domiciliario marca como ENTREGADA
        ActualizarEstadoEncomiendaRequest reqEntregada = new ActualizarEstadoEncomiendaRequest("ENTREGADA");
        mockMvc.perform(put("/api/encomiendas/" + encomiendaId + "/estado")
                        .header("Authorization", "Bearer " + tokenDomiciliario)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqEntregada)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ENTREGADA"));

        // 7. Cliente consulta el detalle final de su encomienda
        mockMvc.perform(get("/api/encomiendas/" + encomiendaId)
                        .header("Authorization", "Bearer " + tokenCliente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ENTREGADA"))
                .andExpect(jsonPath("$.domiciliarioNombre").exists());
    }
}
