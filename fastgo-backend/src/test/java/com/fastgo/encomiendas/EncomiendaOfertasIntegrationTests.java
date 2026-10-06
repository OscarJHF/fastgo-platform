package com.fastgo.encomiendas;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fastgo.dto.ActualizarEstadoEncomiendaRequest;
import com.fastgo.dto.CrearEncomiendaRequest;
import com.fastgo.dto.CrearOfertaRequest;
import com.fastgo.dto.RegistroUsuarioRequest;
import com.fastgo.dto.LoginRequest;
import com.fastgo.dto.LoginResponse;
import com.fastgo.entity.Encomienda;
import com.fastgo.entity.Rol;
import com.fastgo.entity.Usuario;
import com.fastgo.jwt.JwtService;
import com.fastgo.repository.EncomiendaRepository;
import com.fastgo.repository.OfertaEncomiendaRepository;
import com.fastgo.repository.RolRepository;
import com.fastgo.repository.UsuarioRepository;
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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EncomiendaOfertasIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EncomiendaRepository encomiendaRepository;

    @Autowired
    private OfertaEncomiendaRepository ofertaEncomiendaRepository;

    @Autowired
    private JwtService jwtService;

    private static class AuthResult {
        String token;
        Usuario usuario;
    }

    private AuthResult clienteAuth;
    private AuthResult domi1Auth;
    private AuthResult domi2Auth;

    private AuthResult registrarYLogin(String rol, String nombre) throws Exception {
        String correo = "user." + rol.toLowerCase() + "." + UUID.randomUUID().toString().substring(0, 8) + "@fastgo.com";
        RegistroUsuarioRequest reg = new RegistroUsuarioRequest();
        reg.setNombre(nombre);
        reg.setApellido("Test");
        reg.setCorreo(correo);
        reg.setTelefono("310" + (int)(Math.random() * 9000000 + 1000000));
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

    @BeforeEach
    void setUp() throws Exception {
        objectMapper.findAndRegisterModules();

        for (String roleName : new String[]{"CLIENTE", "DOMICILIARIO"}) {
            if (rolRepository.findByNombreIgnoreCase(roleName).isEmpty()) {
                Rol r = new Rol();
                r.setNombre(roleName);
                rolRepository.save(r);
            }
        }

        clienteAuth = registrarYLogin("CLIENTE", "Cliente Ofertas");
        domi1Auth = registrarYLogin("DOMICILIARIO", "Carlos Domi1");
        domi2Auth = registrarYLogin("DOMICILIARIO", "Andres Domi2");
    }

    @Test
    @DisplayName("Ciclo completo de negociación: Creación con valor inicial, contraofertas, rechazo y aceptación transaccional")
    void testNegociacionOfertasCompleta() throws Exception {
        // 1. Cliente crea encomienda con valor inicial de 8.000 COP
        CrearEncomiendaRequest reqEnc = new CrearEncomiendaRequest();
        reqEnc.setRemitenteNombre("Juan Remitente");
        reqEnc.setRemitenteTelefono("3001112233");
        reqEnc.setDireccionOrigen("Carrera 23 # 45-67");
        reqEnc.setDestinatarioNombre("Maria Destino");
        reqEnc.setDestinatarioTelefono("3004445566");
        reqEnc.setDireccionDestino("Calle 65 # 12-34");
        reqEnc.setDescripcion("Documentos urgentes");
        reqEnc.setTamanoPeso("Sobre mediano");
        reqEnc.setDistanciaKm(BigDecimal.valueOf(3.5));
        reqEnc.setCostoEnvio(BigDecimal.valueOf(8000.00));
        reqEnc.setTarifaAceptada(true);

        MvcResult resCrear = mockMvc.perform(post("/api/encomiendas")
                        .header("Authorization", "Bearer " + clienteAuth.token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqEnc)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode jsonEnc = objectMapper.readTree(resCrear.getResponse().getContentAsString());
        int encomiendaId = jsonEnc.get("id").asInt();
        assertThat(jsonEnc.get("estado").asText()).isEqualTo("PENDIENTE");
        assertThat(jsonEnc.get("costoEnvio").asDouble()).isEqualTo(8000.0);
        assertThat(jsonEnc.get("valorInicial").asDouble()).isEqualTo(8000.0);

        // 2. Domiciliario 1 realiza contraoferta de 10.000 COP
        CrearOfertaRequest oferta1 = new CrearOfertaRequest(BigDecimal.valueOf(10000.00), "Voy en moto con maleta termica");
        MvcResult resOf1 = mockMvc.perform(post("/api/encomiendas/" + encomiendaId + "/ofertas")
                        .header("Authorization", "Bearer " + domi1Auth.token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oferta1)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode jsonOf1 = objectMapper.readTree(resOf1.getResponse().getContentAsString());
        int oferta1Id = jsonOf1.get("id").asInt();
        assertThat(jsonOf1.get("estado").asText()).isEqualTo("PENDIENTE");
        assertThat(jsonOf1.get("valor").asDouble()).isEqualTo(10000.0);

        // La encomienda debe pasar a estado OFERTA
        Encomienda encActualizada = encomiendaRepository.findById(encomiendaId).orElseThrow();
        assertThat(encActualizada.getEstado()).isEqualTo("OFERTA");

        // 3. Domiciliario 2 realiza contraoferta de 9.000 COP
        CrearOfertaRequest oferta2 = new CrearOfertaRequest(BigDecimal.valueOf(9000.00), "Estoy a 3 minutos del origen");
        MvcResult resOf2 = mockMvc.perform(post("/api/encomiendas/" + encomiendaId + "/ofertas")
                        .header("Authorization", "Bearer " + domi2Auth.token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oferta2)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode jsonOf2 = objectMapper.readTree(resOf2.getResponse().getContentAsString());
        int oferta2Id = jsonOf2.get("id").asInt();
        assertThat(jsonOf2.get("valor").asDouble()).isEqualTo(9000.0);

        // 4. Cliente lista las ofertas de su encomienda (debe ver 2 ofertas)
        MvcResult resList = mockMvc.perform(get("/api/encomiendas/" + encomiendaId + "/ofertas")
                        .header("Authorization", "Bearer " + clienteAuth.token))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode jsonList = objectMapper.readTree(resList.getResponse().getContentAsString());
        assertThat(jsonList.isArray()).isTrue();
        assertThat(jsonList.size()).isEqualTo(2);

        // 5. Cliente rechaza la oferta de Domiciliario 1 (10.000 COP)
        mockMvc.perform(put("/api/encomiendas/" + encomiendaId + "/ofertas/" + oferta1Id + "/rechazar")
                        .header("Authorization", "Bearer " + clienteAuth.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("RECHAZADA"));

        // 6. Cliente acepta la oferta de Domiciliario 2 (9.000 COP)
        MvcResult resAceptada = mockMvc.perform(put("/api/encomiendas/" + encomiendaId + "/ofertas/" + oferta2Id + "/aceptar")
                        .header("Authorization", "Bearer " + clienteAuth.token))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode jsonAceptada = objectMapper.readTree(resAceptada.getResponse().getContentAsString());
        assertThat(jsonAceptada.get("estado").asText()).isEqualTo("ACEPTADA");
        assertThat(jsonAceptada.get("costoEnvio").asDouble()).isEqualTo(9000.0);
        assertThat(jsonAceptada.get("domiciliarioId").asInt()).isEqualTo(domi2Auth.usuario.getId());

        // 7. Verificar en base de datos que la oferta ganadora está ACEPTADA
        var of2Db = ofertaEncomiendaRepository.findById(oferta2Id).orElseThrow();
        assertThat(of2Db.getEstado()).isEqualTo("ACEPTADA");

        // 8. Intentar tomar o aceptar una encomienda ya asignada debe fallar
        mockMvc.perform(put("/api/encomiendas/" + encomiendaId + "/tomar")
                        .header("Authorization", "Bearer " + domi1Auth.token))
                .andExpect(status().is4xxClientError());

        // 9. Domiciliario 2 avanza el ciclo de entrega: EN_RECOGIDA -> EN_CAMINO -> ENTREGADA
        ActualizarEstadoEncomiendaRequest reqRecogida = new ActualizarEstadoEncomiendaRequest();
        reqRecogida.setEstado("EN_RECOGIDA");
        mockMvc.perform(put("/api/encomiendas/" + encomiendaId + "/estado")
                        .header("Authorization", "Bearer " + domi2Auth.token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqRecogida)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("EN_RECOGIDA"));

        ActualizarEstadoEncomiendaRequest reqCamino = new ActualizarEstadoEncomiendaRequest();
        reqCamino.setEstado("EN_CAMINO");
        mockMvc.perform(put("/api/encomiendas/" + encomiendaId + "/estado")
                        .header("Authorization", "Bearer " + domi2Auth.token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqCamino)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("EN_CAMINO"));

        ActualizarEstadoEncomiendaRequest reqEntregada = new ActualizarEstadoEncomiendaRequest();
        reqEntregada.setEstado("ENTREGADA");
        mockMvc.perform(put("/api/encomiendas/" + encomiendaId + "/estado")
                        .header("Authorization", "Bearer " + domi2Auth.token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqEntregada)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ENTREGADA"));
    }
}
