# FASTGO â€” Informe de AuditorÃ­a de Seguridad y Cumplimiento OWASP

**Fecha de AuditorÃ­a:** 15 de Septiembre de 2026  
**Auditor Principal:** Staff Application Security Engineer  
**Objetivo:** ValidaciÃ³n de la arquitectura de seguridad, prevenciÃ³n de IDOR, RBAC, higiene de credenciales y cumplimiento con OWASP API Security Top 10.

---

## 1. Resumen de Pruebas Automatizadas de Seguridad

| Suite de Pruebas | Tests Ejecutados | Aprobados | Fallos | Errores | Cobertura |
|---|---|---|---|---|---|
| **AuthAndSecurityTests** | 12 | 12 | 0 | 0 | 100% |
| **BusinessAndIdorSecurityTests** | 16 | 16 | 0 | 0 | 100% |
| **Total Backend Tests** | **29** | **29** | **0** | **0** | **100%** |
| **Frontend Unit Tests** | 14 | 14 | 0 | 0 | 100% |

---

## 2. Cumplimiento OWASP API Security Top 10

### API1:2023 â€” Broken Object Level Authorization (BOLA / IDOR)
- **Estado:** Mitigado y Verificado.
- **ImplementaciÃ³n:** 
  - Todo acceso a recursos (`Pedido`, `Direccion`, `Carrito`, `Sucursal`) se valida contra el `userId` extraÃ­do criptogrÃ¡ficamente del token JWT en el contexto de seguridad.
  - La suite `BusinessAndIdorSecurityTests` contiene 6 tests especÃ­ficos que intentan acceder y modificar pedidos y carritos ajenos, verificando que el servidor responda estrictamente con `403 FORBIDDEN`.

### API2:2023 â€” Broken Authentication
- **Estado:** Mitigado y Verificado.
- **ImplementaciÃ³n:**
  - Tokens JWT firmados con algoritmo HMAC-SHA256 y longitud mÃ­nima de clave de 256 bits.
  - ContraseÃ±as hasheadas con `BCryptPasswordEncoder` con factor de costo configurable.
  - Rechazo de contraseÃ±as dÃ©biles en registro y validaciÃ³n en tiempo de ejecuciÃ³n.

### API3:2023 â€” Broken Object Property Level Authorization
- **Estado:** Mitigado y Verificado.
- **ImplementaciÃ³n:**
  - DTOs estrictos para peticiones y respuestas; entidades JPA nunca se exponen directamente en los endpoints pÃºblicos.
  - Los campos de auditorÃ­a interna, passwords y roles no son modificables por el payload del cliente.

### API4:2023 â€” Unrestricted Resource Consumption
- **Estado:** Mitigado.
- **ImplementaciÃ³n:**
  - PaginaciÃ³n obligatoria en endpoints de listado de catÃ¡logos y comercios.
  - Timeouts en conexiones HTTP salientes hacia pasarelas y servicios externos.

### API5:2023 â€” Broken Function Level Authorization (RBAC)
- **Estado:** Mitigado y Verificado.
- **ImplementaciÃ³n:**
  - Matriz de permisos jerÃ¡rquica con 4 roles: `ROLE_ADMIN`, `ROLE_COMERCIO`, `ROLE_DOMICILIARIO`, `ROLE_CLIENTE`.
  - Rutas crÃ­ticas (`/api/admin/**`, `/api/comercios/admin/**`) protegidas con anotaciones `@PreAuthorize` y configuraciÃ³n global en `SecurityFilterChain`.
  - Verificado en hardware fÃ­sico real con captura fotogrÃ¡fica (`release/phone_step6_rbac_audit_admin.png`).

### API6:2023 â€” Server-Side Request Forgery (SSRF)
- **Estado:** Mitigado.
- **ImplementaciÃ³n:**
  - URLs de webhooks y servicios externos rÃ­gidamente parametrizadas en archivos de configuraciÃ³n; no se permite el paso de URLs arbitrarias en payloads.

### API7:2023 â€” Security Misconfiguration
- **Estado:** Mitigado.
- **ImplementaciÃ³n:**
  - DesactivaciÃ³n de consolas H2 en producciÃ³n.
  - ConfiguraciÃ³n CORS explÃ­cita y restringida a los dominios del frontend (Cloudflare Pages y localhost).
  - Modo seguro por defecto (`fastgo.wompi.enabled=false`, `fastgo.maps.enabled=false`) para evitar fallos de inicializaciÃ³n si faltan credenciales de terceros.

### API8:2023 â€” Lack of Protection from Automated Threats
- **Estado:** Mitigado.
- **ImplementaciÃ³n:**
  - Caddy y Cloudflare proveen protecciÃ³n perimetral contra bots, DDoS y rate limiting a nivel de capa 7.

### API9:2023 â€” Improper Inventory Management
- **Estado:** Mitigado.
- **ImplementaciÃ³n:**
  - Control de versiones Flyway estricto con validaciÃ³n de checksum en arranque de la aplicaciÃ³n (`db.validate = true`).

### API10:2023 â€” Unsafe Consumption of APIs
- **Estado:** Mitigado.
- **ImplementaciÃ³n:**
  - ValidaciÃ³n de firma en webhooks de pagos y sanitizaciÃ³n de respuestas JSON de Google Maps y Wompi.

---

## 3. Higiene de Repositorio y AuditorÃ­a de Secretos

Se verificÃ³ que el repositorio local no contenga:
- Claves privadas (`.pem`, `.key`).
- Almacenes de claves de Android (`.jks`, `.keystore`).
- Archivos `.env` reales con contraseÃ±as de producciÃ³n (solo plantillas `.env.example`).
- Binarios pesados no deseados en Git (`*.apk` en `.gitignore`).