package com.fastgo.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fastgo.dto.*;
import com.fastgo.entity.*;
import com.fastgo.jwt.JwtService;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class NotificationAndDeviceRegistrationTests {

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
    private SucursalRepository sucursalRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private DispositivoUsuarioRepository dispositivoUsuarioRepository;

    @Autowired
    private JwtService jwtService;

    private Integer categoriaComercioId;

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
    }

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

    private Pedido crearPedidoEnEstadoListo(AuthResult merchant, AuthResult client) throws Exception {
        Comercio comercio = crearComercio(merchant.token, "Restaurante " + UUID.randomUUID().toString().substring(0, 5));
        Sucursal sucursal = sucursalRepository.findByComercioId(comercio.getId()).get(0);

        Pedido p = new Pedido();
        p.setUsuarioId(client.usuario.getId());
        p.setSucursalId(sucursal.getId());
        p.setDireccionId(1);
        p.setSubtotal(new BigDecimal("25000.00"));
        p.setCostoEnvio(new BigDecimal("3500.00"));
        p.setTotal(new BigDecimal("28500.00"));
        p.setEstado("LISTO");
        p.setMetodoPago("EFECTIVO");
        p.setEstadoPago("APROBADO");
        p.setCreadoEn(LocalDateTime.now());
        return pedidoRepository.save(p);
    }

    @Test
    @DisplayName("1. Registro de dispositivo y consulta de mis dispositivos activos")
    void testRegistrarDispositivoYListar() throws Exception {
        AuthResult client = registrarYLogin("CLIENTE", "Carlos Cliente");

        DispositivoRequestDTO req = new DispositivoRequestDTO(
                "device-uuid-12345",
                "ANDROID",
                "fcm-token-" + UUID.randomUUID()
        );

        MvcResult regRes = mockMvc.perform(post("/api/dispositivos/registrar")
                .header("Authorization", "Bearer " + client.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode dto = objectMapper.readTree(regRes.getResponse().getContentAsString());
        assertThat(dto.get("id")).isNotNull();
        assertThat(dto.get("usuarioId").asInt()).isEqualTo(client.usuario.getId());
        assertThat(dto.get("pushToken").asText()).isEqualTo(req.getPushToken());
        assertThat(dto.get("activo").asBoolean()).isTrue();

        // Consultar lista
        MvcResult listRes = mockMvc.perform(get("/api/dispositivos/mis-dispositivos")
                .header("Authorization", "Bearer " + client.token))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode lista = objectMapper.readTree(listRes.getResponse().getContentAsString());
        assertThat(lista.isArray()).isTrue();
        assertThat(lista.size()).isEqualTo(1);
        assertThat(lista.get(0).get("pushToken").asText()).isEqualTo(req.getPushToken());
    }

    @Test
    @DisplayName("2. Registro de múltiples dispositivos para un mismo usuario")
    void testRegistrarMultiplesDispositivos() throws Exception {
        AuthResult domi = registrarYLogin("DOMICILIARIO", "David Domiciliario");

        DispositivoRequestDTO d1 = new DispositivoRequestDTO("phone-01", "ANDROID", "token-phone-" + UUID.randomUUID());
        DispositivoRequestDTO d2 = new DispositivoRequestDTO("web-browser-01", "WEB", "token-web-" + UUID.randomUUID());

        mockMvc.perform(post("/api/dispositivos/registrar")
                .header("Authorization", "Bearer " + domi.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(d1)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/dispositivos/registrar")
                .header("Authorization", "Bearer " + domi.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(d2)))
                .andExpect(status().isOk());

        MvcResult listRes = mockMvc.perform(get("/api/dispositivos/mis-dispositivos")
                .header("Authorization", "Bearer " + domi.token))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode lista = objectMapper.readTree(listRes.getResponse().getContentAsString());
        assertThat(lista.isArray()).isTrue();
        assertThat(lista.size()).isEqualTo(2);
    }

    @Test
    @DisplayName("3. Idempotencia: re-registro del mismo token actualiza sin duplicar filas")
    void testIdempotenciaActualizarToken() throws Exception {
        AuthResult merchant = registrarYLogin("COMERCIO", "Marta Comerciante");
        String pushToken = "same-token-" + UUID.randomUUID();

        DispositivoRequestDTO req1 = new DispositivoRequestDTO("dev-A", "WEB", pushToken);
        mockMvc.perform(post("/api/dispositivos/registrar")
                .header("Authorization", "Bearer " + merchant.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isOk());

        // Segunda llamada con el mismo pushToken pero diferente dispositivoId
        DispositivoRequestDTO req2 = new DispositivoRequestDTO("dev-A-updated", "WEB", pushToken);
        mockMvc.perform(post("/api/dispositivos/registrar")
                .header("Authorization", "Bearer " + merchant.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isOk());

        List<DispositivoUsuario> enDb = dispositivoUsuarioRepository.findByUsuarioId(merchant.usuario.getId());
        assertThat(enDb).hasSize(1);
        assertThat(enDb.get(0).getDispositivoId()).isEqualTo("dev-A-updated");
    }

    @Test
    @DisplayName("4. Desactivación de dispositivo (logout)")
    void testDesactivarDispositivo() throws Exception {
        AuthResult client = registrarYLogin("CLIENTE", "Pedro Logout");
        String pushToken = "token-to-deactivate-" + UUID.randomUUID();

        DispositivoRequestDTO req = new DispositivoRequestDTO("dev-01", "ANDROID", pushToken);
        mockMvc.perform(post("/api/dispositivos/registrar")
                .header("Authorization", "Bearer " + client.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        // Desactivar
        mockMvc.perform(post("/api/dispositivos/desactivar")
                .header("Authorization", "Bearer " + client.token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("pushToken", pushToken))))
                .andExpect(status().isOk());

        // Ya no aparece en lista de activos
        MvcResult listRes = mockMvc.perform(get("/api/dispositivos/mis-dispositivos")
                .header("Authorization", "Bearer " + client.token))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode lista = objectMapper.readTree(listRes.getResponse().getContentAsString());
        assertThat(lista.size()).isEqualTo(0);
    }

    @Test
    @DisplayName("5. Carrera concurrente: dos domiciliarios intentan tomar el mismo pedido -> segundo recibe HTTP 409")
    void testCarreraConcurrenteDosDomiciliariosMismoPedido() throws Exception {
        AuthResult merchant = registrarYLogin("COMERCIO", "Dueño Restaurante");
        AuthResult client = registrarYLogin("CLIENTE", "Comprador Hambriento");
        AuthResult domi1 = registrarYLogin("DOMICILIARIO", "Domiciliario Uno");
        AuthResult domi2 = registrarYLogin("DOMICILIARIO", "Domiciliario Dos");

        Pedido pedido = crearPedidoEnEstadoListo(merchant, client);
        assertThat(pedido.getEstado()).isEqualTo("LISTO");

        // Domiciliario 1 toma el pedido
        MvcResult res1 = mockMvc.perform(put("/api/pedidos/" + pedido.getId() + "/tomar")
                .header("Authorization", "Bearer " + domi1.token))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode tomado = objectMapper.readTree(res1.getResponse().getContentAsString());
        assertThat(tomado.get("domiciliarioId").asInt()).isEqualTo(domi1.usuario.getId());

        // Domiciliario 2 intenta tomar el MISMO pedido -> debe fallar con HTTP 409 Conflict
        MvcResult res2 = mockMvc.perform(put("/api/pedidos/" + pedido.getId() + "/tomar")
                .header("Authorization", "Bearer " + domi2.token))
                .andExpect(status().isConflict())
                .andReturn();

        String bodyError = res2.getResponse().getContentAsString();
        assertThat(bodyError).contains("Este domicilio ya fue tomado por otro domiciliario.");
    }

    @Test
    @DisplayName("6. Aislamiento de pedidos por comercio propietario")
    void testAislamientoPedidosPorComercio() throws Exception {
        AuthResult merchantA = registrarYLogin("COMERCIO", "Dueño Tienda A");
        AuthResult merchantB = registrarYLogin("COMERCIO", "Dueño Tienda B");
        AuthResult client = registrarYLogin("CLIENTE", "Cliente Común");

        Pedido pedidoA = crearPedidoEnEstadoListo(merchantA, client);

        // Comercio B intenta consultar o modificar pedido de Comercio A -> 403 Forbidden
        mockMvc.perform(put("/api/pedidos/" + pedidoA.getId() + "/confirmar")
                .header("Authorization", "Bearer " + merchantB.token))
                .andExpect(status().isForbidden());

        // Comercio B consulta pedidos de su propia sucursal y NO ve el pedido de A
        Comercio comercioB = crearComercio(merchantB.token, "Tienda B " + UUID.randomUUID().toString().substring(0, 5));
        Sucursal sucursalB = sucursalRepository.findByComercioId(comercioB.getId()).get(0);

        MvcResult resB = mockMvc.perform(get("/api/pedidos/sucursal/" + sucursalB.getId())
                .header("Authorization", "Bearer " + merchantB.token))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode pedidosB = objectMapper.readTree(resB.getResponse().getContentAsString());
        boolean contienePedidoA = false;
        for (JsonNode item : pedidosB) {
            if (item.get("id").asInt() == pedidoA.getId()) {
                contienePedidoA = true;
                break;
            }
        }
        assertThat(contienePedidoA).isFalse();
    }
}
