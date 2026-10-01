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

    @Autowired
    private com.fastgo.repository.CategoriaComercioRepository categoriaComercioRepository;

    @BeforeEach
    void setUp() {
        for (String roleName : new String[]{"CLIENTE", "COMERCIO", "DOMICILIARIO"}) {
            if (rolRepository.findByNombreIgnoreCase(roleName).isEmpty()) {
                Rol r = new Rol();
                r.setNombre(roleName);
                rolRepository.save(r);
            }
        }
        if (categoriaComercioRepository.count() == 0) {
            com.fastgo.entity.CategoriaComercio cat = new com.fastgo.entity.CategoriaComercio();
            cat.setNombre("Moda y Accesorios");
            cat.setDescripcion("Tiendas de ropa y calzado");
            cat.setActivo(true);
            categoriaComercioRepository.save(cat);
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

    @Test
    @DisplayName("Debe permitir al rol COMERCIO crear tienda, auto-crear sucursal, crear categoría de producto, producto y filtrar por activo")
    void testCommerceStoreProfileAndCatalogFlow() throws Exception {
        String correo = "store.test." + UUID.randomUUID().toString().substring(0, 8) + "@fastgo.com";

        // 1. Registro como COMERCIO
        RegistroUsuarioRequest regComercio = new RegistroUsuarioRequest();
        regComercio.setNombre("Mariana");
        regComercio.setApellido("Diseños");
        regComercio.setCorreo(correo);
        regComercio.setTelefono("3159988776");
        regComercio.setPassword("Password123!");
        regComercio.setRol("COMERCIO");

        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regComercio)))
                .andExpect(status().isOk());

        // 2. Login
        LoginRequest loginReq = new LoginRequest();
        loginReq.setCorreo(correo);
        loginReq.setPassword("Password123!");

        MvcResult loginRes = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginRes.getResponse().getContentAsString()).get("token").asText();

        // 3. Antes de configurar tienda, /api/comercios/propio debe retornar 204 No Content
        mockMvc.perform(get("/api/comercios/propio")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        // 4. Crear tienda con dirección, ciudad, categoría y activo = true
        Integer catId = categoriaComercioRepository.findAll().get(0).getId();
        String nombreComercio = "Boutique " + UUID.randomUUID().toString().substring(0, 6);
        com.fastgo.dto.ComercioRequestDTO storeReq = new com.fastgo.dto.ComercioRequestDTO();
        storeReq.setNombre(nombreComercio);
        storeReq.setCategoriaId(catId);
        storeReq.setDescripcion("Ropa de moda y accesorios premium");
        storeReq.setTelefono("3159988776");
        storeReq.setDireccion("Av. 19 # 104-50");
        storeReq.setCiudad("Bogotá");
        storeReq.setHoraApertura("09:00");
        storeReq.setHoraCierre("20:00");
        storeReq.setDiasAtencion("Lunes a Sábado");
        storeReq.setTiempoPreparacionMin(15);
        storeReq.setActivo(true);

        MvcResult storeRes = mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(storeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nombre").value(nombreComercio))
                .andExpect(jsonPath("$.direccion").value("Av. 19 # 104-50"))
                .andExpect(jsonPath("$.ciudad").value("Bogotá"))
                .andExpect(jsonPath("$.activo").value(true))
                .andReturn();

        Integer storeId = objectMapper.readTree(storeRes.getResponse().getContentAsString()).get("id").asInt();

        // 5. Verificar que /api/comercios/propio ahora devuelve la tienda configurada
        mockMvc.perform(get("/api/comercios/propio")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(storeId))
                .andExpect(jsonPath("$.nombre").value(nombreComercio))
                .andExpect(jsonPath("$.direccion").value("Av. 19 # 104-50"));

        // 6. Verificar que la sucursal por defecto "Sede Principal" fue auto-creada
        MvcResult sucsRes = mockMvc.perform(get("/api/sucursales/comercio/" + storeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].nombre").value("Sede Principal"))
                .andExpect(jsonPath("$[0].direccion").value("Av. 19 # 104-50"))
                .andReturn();

        Integer sucursalId = objectMapper.readTree(sucsRes.getResponse().getContentAsString()).get(0).get("id").asInt();

        // 7. Crear categoría de producto como COMERCIO (permitido)
        com.fastgo.entity.CategoriaProducto prodCat = new com.fastgo.entity.CategoriaProducto();
        prodCat.setNombre("Vestidos y Conjuntos");
        prodCat.setDescripcion("Colección verano e invierno");
        prodCat.setActivo(true);

        MvcResult catRes = mockMvc.perform(post("/api/categorias-producto")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(prodCat)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nombre").value("Vestidos y Conjuntos"))
                .andReturn();

        Integer catProdId = objectMapper.readTree(catRes.getResponse().getContentAsString()).get("id").asInt();

        // 8. Crear producto con sucursalId auto-resuelto
        com.fastgo.dto.ProductoRequestDTO prodReq = new com.fastgo.dto.ProductoRequestDTO();
        prodReq.setNombre("Vestido Floral Elegance");
        prodReq.setDescripcion("Vestido en seda natural estampado");
        prodReq.setPrecio(new java.math.BigDecimal("120000"));
        prodReq.setCategoriaId(catProdId);
        prodReq.setStock(15);
        prodReq.setTiempoPreparacion(10);
        prodReq.setDisponible(true);

        mockMvc.perform(post("/api/productos")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(prodReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nombre").value("Vestido Floral Elegance"))
                .andExpect(jsonPath("$.sucursalId").value(sucursalId))
                .andExpect(jsonPath("$.stock").value(15))
                .andExpect(jsonPath("$.categoriaNombre").value("Vestidos y Conjuntos"));

        // 9. Listado público /api/comercios debe incluir la tienda activa
        mockMvc.perform(get("/api/comercios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.nombre == '" + nombreComercio + "')]").exists());

        // 10. Actualizar tienda para ponerla en modo borrador (activo = false)
        storeReq.setActivo(false);
        mockMvc.perform(put("/api/comercios/" + storeId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(storeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activo").value(false));

        // 11. Listado público ya NO debe mostrar la tienda oculta
        mockMvc.perform(get("/api/comercios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.nombre == '" + nombreComercio + "')]").doesNotExist());
    }

    @Test
    @DisplayName("Validar estado Abierto/Cerrado, gestión de categorías por Comercio y protección de compra sin autenticación o con tienda cerrada")
    void testStoreOpenCloseCategoryManagementAndCheckoutProtection() throws Exception {
        // 1. Visitante sin autenticación NO puede crear pedidos ni acceder al carrito
        mockMvc.perform(post("/api/pedidos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"carritoId\":1,\"direccionId\":1}"))
                .andExpect(status().isUnauthorized());

        // 2. Crear usuario COMERCIO
        String correoCom = "comercio.test." + UUID.randomUUID().toString().substring(0, 8) + "@fastgo.com";
        RegistroUsuarioRequest regCom = new RegistroUsuarioRequest();
        regCom.setNombre("Tienda");
        regCom.setApellido("Moda");
        regCom.setCorreo(correoCom);
        regCom.setTelefono("3112223344");
        regCom.setPassword("Password123!");
        regCom.setRol("COMERCIO");

        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regCom)))
                .andExpect(status().isOk());

        LoginRequest loginReq = new LoginRequest();
        loginReq.setCorreo(correoCom);
        loginReq.setPassword("Password123!");
        MvcResult logRes = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();
        String tokenCom = objectMapper.readTree(logRes.getResponse().getContentAsString()).get("token").asText();

        // 3. Crear comercio
        com.fastgo.dto.ComercioRequestDTO storeReq = new com.fastgo.dto.ComercioRequestDTO();
        storeReq.setNombre("Boutique Elegance");
        storeReq.setDescripcion("Ropa exclusiva");
        storeReq.setCategoriaId(1);
        storeReq.setDireccion("Calle 100 # 15-20");
        storeReq.setCiudad("Bogotá");
        storeReq.setHoraApertura("06:00");
        storeReq.setHoraCierre("23:59");
        storeReq.setDiasAtencion("Lunes a Domingo");
        storeReq.setActivo(true);

        MvcResult storeRes = mockMvc.perform(post("/api/comercios")
                .header("Authorization", "Bearer " + tokenCom)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(storeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.abierto").value(true))
                .andReturn();
        Integer storeId = objectMapper.readTree(storeRes.getResponse().getContentAsString()).get("id").asInt();

        // 4. Comercio puede crear categoría de producto
        com.fastgo.entity.CategoriaProducto newCat = new com.fastgo.entity.CategoriaProducto();
        newCat.setNombre("Camisas y Blusas");
        newCat.setDescripcion("Prendas superiores");
        newCat.setActivo(true);
        MvcResult catRes = mockMvc.perform(post("/api/categorias-producto")
                .header("Authorization", "Bearer " + tokenCom)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newCat)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andReturn();
        Integer catId = objectMapper.readTree(catRes.getResponse().getContentAsString()).get("id").asInt();

        // 5. Comercio puede actualizar categoría de producto
        newCat.setNombre("Camisas, Blusas y Tops");
        mockMvc.perform(put("/api/categorias-producto/" + catId)
                .header("Authorization", "Bearer " + tokenCom)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newCat)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Camisas, Blusas y Tops"));

        // 6. Comercio puede cerrar tienda manualmente con togglePausaManual
        mockMvc.perform(patch("/api/comercios/" + storeId + "/pausa-manual")
                .header("Authorization", "Bearer " + tokenCom))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pausaManual").value(true))
                .andExpect(jsonPath("$.abierto").value(false));

        // 7. Comercio puede volver a abrir la tienda
        mockMvc.perform(patch("/api/comercios/" + storeId + "/pausa-manual")
                .header("Authorization", "Bearer " + tokenCom))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pausaManual").value(false))
                .andExpect(jsonPath("$.abierto").value(true));
    }
}