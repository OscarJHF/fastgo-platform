package com.fastgo.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fastgo.dto.CambiarRolRequest;
import com.fastgo.dto.LoginRequest;
import com.fastgo.dto.RegistroUsuarioRequest;
import com.fastgo.entity.Rol;
import com.fastgo.repository.RolRepository;
import com.fastgo.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class MultiRoleAndStoreSettingsTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @BeforeEach
    void setUp() {
        for (String roleName : new String[]{"CLIENTE", "COMERCIO", "DOMICILIARIO"}) {
            if (rolRepository.findByNombreIgnoreCase(roleName).isEmpty()) {
                Rol r = new Rol();
                r.setNombre(roleName);
                rolRepository.save(r);
            }
        }
    }

    @Test
    @DisplayName("Debe registrar un usuario con CLIENTE y luego agregar COMERCIO con el mismo correo")
    void testMultiRoleRegistrationAndSwitch() throws Exception {
        String correo = "multirole." + UUID.randomUUID().toString().substring(0, 8) + "@fastgo.com";

        // 1. Registro como CLIENTE
        RegistroUsuarioRequest regCliente = new RegistroUsuarioRequest();
        regCliente.setNombre("Carlos");
        regCliente.setApellido("Multi");
        regCliente.setCorreo(correo);
        regCliente.setTelefono("3001112233");
        regCliente.setPassword("Password123!");
        regCliente.setRol("CLIENTE");

        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regCliente)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value(correo))
                .andExpect(jsonPath("$.rol").value("CLIENTE"))
                .andExpect(jsonPath("$.availableRoles[0]").value("CLIENTE"));

        // 2. Registro con mismo correo como COMERCIO (debe reutilizar y agregar rol)
        RegistroUsuarioRequest regComercio = new RegistroUsuarioRequest();
        regComercio.setNombre("Carlos");
        regComercio.setApellido("Multi");
        regComercio.setCorreo(correo);
        regComercio.setTelefono("3001112233");
        regComercio.setPassword("Password123!");
        regComercio.setRol("COMERCIO");

        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regComercio)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value(correo))
                .andExpect(jsonPath("$.rol").value("COMERCIO"));

        // 3. Login debe retornar activeRole y availableRoles con CLIENTE y COMERCIO
        LoginRequest loginReq = new LoginRequest();
        loginReq.setCorreo(correo);
        loginReq.setPassword("Password123!");

        MvcResult loginRes = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.activeRole").exists())
                .andExpect(jsonPath("$.availableRoles").isArray())
                .andReturn();

        JsonNode jsonNode = objectMapper.readTree(loginRes.getResponse().getContentAsString());
        String token = jsonNode.get("token").asText();
        assertThat(token).isNotBlank();

        // 4. Cambiar rol a CLIENTE usando /api/auth/cambiar-rol
        CambiarRolRequest switchReq = new CambiarRolRequest("CLIENTE");
        MvcResult switchRes = mockMvc.perform(post("/api/auth/cambiar-rol")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(switchReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.activeRole").value("CLIENTE"))
                .andReturn();

        JsonNode switchNode = objectMapper.readTree(switchRes.getResponse().getContentAsString());
        String newToken = switchNode.get("token").asText();
        assertThat(newToken).isNotBlank();

        // 5. Intentar registrar el mismo rol duplicado (COMERCIO) debe ser rechazado
        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regComercio)))
                .andExpect(status().isBadRequest());
    }
}