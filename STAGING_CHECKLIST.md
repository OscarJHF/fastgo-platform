# FASTGO BETA 2 — STAGING DEPLOYMENT CHECKLIST

**Fecha:** 14 de Septiembre de 2026  
**Versión:** 2.0.0 (Beta 2)  
**Ambiente:** Staging (Pre-Producción)  
**Responsable:** DevOps Lead & Release Engineer  

Este documento describe la lista de verificación obligatoria para promover los artefactos de **FASTGO Beta 2** hacia el ambiente de **Staging** previo a la liberación en producción.

---

## 1. INFRAESTRUCTURA Y SERVICIOS BASE

- [ ] **Servidor de Base de Datos:**
  - [ ] PostgreSQL 18.4 activo y accesible.
  - [ ] Base de datos dedicada de staging creada (`fastgo_staging_db`).
  - [ ] Usuario con privilegios restringidos (sin permisos de superusuario innecesarios).
  - [ ] Pool de conexiones Hikari configurado (`maximum-pool-size: 20`, `minimum-idle: 5`).
  - [ ] Copia de seguridad inicial (backup) ejecutada antes de aplicar migraciones.
- [ ] **Servidor de Aplicación (Backend):**
  - [ ] Java JDK 21 instalado (`java -version` verificado).
  - [ ] Memoria JVM asignada adecuadamente (`-Xms512m -Xmx2048m`).
  - [ ] Servicio administrado como daemon (systemd en Linux o Windows Service).
  - [ ] Firewall permitiendo únicamente tráfico en el puerto configurado (ej. 8080 o vía proxy inverso).
- [ ] **Servidor Web / CDN (Frontend):**
  - [ ] Nginx / Cloudflare / Vercel configurado con soporte para Single Page Applications (`try_files $uri $uri/ /index.html`).
  - [ ] Certificado SSL/TLS válido (HTTPS forzado, HSTS activo).
  - [ ] Compresión Gzip / Brotli habilitada para archivos estáticos (`.js`, `.css`).

---

## 2. CONFIGURACIÓN Y SECRETOS DE ENTORNO

- [ ] **Variables del Backend (`application-staging.yml` / Variables de Entorno):**
  - [ ] `SPRING_DATASOURCE_URL`: Conexión segura a PostgreSQL con SSL mode si aplica.
  - [ ] `SPRING_DATASOURCE_USERNAME` y `PASSWORD`: Inyectados de forma segura desde gestor de secretos.
  - [ ] `FASTGO_JWT_SECRET`: Clave criptográfica aleatoria de al menos 256 bits (distinta a la de desarrollo).
  - [ ] `FASTGO_JWT_EXPIRATION`: Tiempo de vida del token definido (ej. 86400000 ms = 24h).
  - [ ] `FASTGO_WOMPI_ENABLED`: `true` (para probar en sandbox de Wompi) o `false` (modo seguro).
  - [ ] `FASTGO_WOMPI_PUBLIC_KEY` y `PRIVATE_KEY`: Credenciales de Sandbox de Wompi validadas.
  - [ ] `FASTGO_WOMPI_EVENTS_SECRET`: Clave de firma de eventos webhook de Wompi configurada.
  - [ ] `FASTGO_MAPS_ENABLED`: `true` si se cuenta con llave de Google Cloud para Staging.
  - [ ] `FASTGO_MAPS_API_KEY`: Llave restringida por dirección IP del servidor.
- [ ] **Variables del Frontend Web (`.env.production` / `.env.staging`):**
  - [ ] `VITE_API_URL`: Apuntando al dominio de Staging del backend (ej. `https://api-staging.fastgo.com`).
  - [ ] `VITE_GOOGLE_MAPS_API_KEY`: Llave restringida por referer HTTP al dominio de Staging.
- [ ] **Variables de la Aplicación Móvil (`.env` / `app.json`):**
  - [ ] `EXPO_PUBLIC_FASTGO_API_URL`: Apuntando a la URL HTTPS de Staging accesible públicamente.

---

## 3. MIGRACIONES Y PERSISTENCIA (FLYWAY)

- [ ] Ejecutar el arranque del backend y verificar que Flyway aplique las migraciones en orden estricto:
  - [ ] `V1__init_schema.sql` (Esquema base de tablas).
  - [ ] `V2__seed_initial_data.sql` (Categorías y datos semilla).
  - [ ] `V3__add_foreign_keys_and_indexes.sql` (Índices y restricciones de integridad).
  - [ ] `V4__add_order_state_machine.sql` (Historial y estados autoritativos).
  - [ ] `V5__add_wompi_payment_fields.sql` (Columnas para pasarela de pagos).
  - [ ] `V6__add_delivery_atomic_claim.sql` (Campos de bloqueo concurrente de domiciliarios).
  - [ ] `V7__add_indexes_for_performance.sql` (Optimización de consultas de catálogo).
  - [ ] `V8__add_admin_audit_logs.sql` (Trazabilidad de auditoría administrativa).
- [ ] Comprobar que `flyway_schema_history` contenga todas las versiones en estado `SUCCESS`.

---

## 4. DESPLIEGUE Y PRUEBAS DE HUMO (SMOKE TESTS)

Una vez desplegados los componentes en Staging, ejecutar la siguiente secuencia de validación:

- [ ] **Smoke Test 1: Salud de la API**
  - Solicitar `GET https://api-staging.fastgo.com/api/comercios`.
  - Debe responder `HTTP 200 OK` con un arreglo JSON de comercios.
- [ ] **Smoke Test 2: Autenticación Multi-Rol**
  - Iniciar sesión con los 4 usuarios de prueba: Cliente, Comercio, Domiciliario, Admin.
  - Verificar que cada uno reciba su JWT y que el endpoint `/api/usuarios/me` retorne su rol correspondiente.
- [ ] **Smoke Test 3: Ciclo Completo de Pedido en Staging**
  - Cliente crea un pedido con items reales.
  - Comercio recibe la notificación en panel, confirma y prepara la orden.
  - Domiciliario toma la orden y transiciona a `EN_CAMINO` y `ENTREGADO`.
  - Cliente verifica que la orden concluya con éxito.
- [ ] **Smoke Test 4: Prueba de Seguridad RBAC**
  - Cliente intenta acceder a `/api/admin/usuarios` usando su token. Debe recibir `HTTP 403 Forbidden`.
  - Comercio intenta tomar un pedido de otra franquicia. Debe recibir `HTTP 403 / 400`.
- [ ] **Smoke Test 5: Distribución de la APK Android**
  - Instalar `FASTGO-Beta2-release.apk` en un smartphone físico de prueba conectado a internet.
  - Abrir la app, verificar el renderizado del splash, header y verificar la conexión exitosa con el backend de Staging.

---

## 5. CRITERIOS DE APROBACIÓN (SIGN-OFF)

| Área | Responsable | Aprobación | Fecha |
| :--- | :--- | :---: | :---: |
| **Backend & Base de Datos** | Backend Lead | [ ] APROBADO | ____________ |
| **Frontend Web** | Frontend Lead | [ ] APROBADO | ____________ |
| **Aplicación Móvil** | Mobile Lead | [ ] APROBADO | ____________ |
| **Seguridad & RBAC** | AppSec Engineer | [ ] APROBADO | ____________ |
| **QA & Pruebas E2E** | QA Automation Lead | [ ] APROBADO | ____________ |

**Veredicto para Pase a Producción:** `[ ] AUTORIZADO` / `[ ] BLOQUEADO`
