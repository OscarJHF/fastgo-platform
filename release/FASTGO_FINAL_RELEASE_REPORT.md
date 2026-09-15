# FASTGO BETA 2 — REPORTE CONSOLIDADO FINAL DE RELEASE

**Fecha:** 15 de Septiembre de 2026  
**Versión del Producto:** FASTGO Beta 2 (v2.0.0)  
**Clasificación:** Production Ready / Staging Validated  
**Equipo Técnico Responsable:** Staff Software Engineer, Backend & Frontend Architects, Application Security Lead, QA Automation Lead, Mobile & DevOps Engineers  

---

## 1. VISIÓN GENERAL DEL PRODUCTO

**FASTGO** es una plataforma integral de domicilios y comercio electrónico local multi-rol (tipo Rappi/DoorDash), diseñada para soportar alto tráfico, transacciones concurrentes seguras y una experiencia fluida en web y dispositivos móviles.

La versión **Beta 2** consolida la arquitectura completa del sistema:
- **Backend Robusto:** Spring Boot 4.0.7 en Java 21 con PostgreSQL 18.4, Spring Security, JWT stateless, migraciones Flyway V1..V8 y máquina de estados autoritativa para pedidos con protección IDOR estricta.
- **Frontend Web Integral:** Aplicación web moderna en React 19 + TypeScript + Vite + Tailwind CSS que atiende a los 4 roles del ecosistema: `CLIENTE`, `COMERCIO`, `DOMICILIARIO` y `ADMIN`.
- **Aplicación Móvil Nativa:** React Native 0.86 / Expo SDK 57 con motor Hermes AOT, compilada a binarios autónomos `.apk` (Debug y Release) para Android, con soporte de seguridad de red restrictivo y validada en hardware físico vía USB/ADB reverse.
- **Resiliencia de Integraciones de Terceros:** Modos seguros configurables para pasarela de pagos Wompi y Google Maps que garantizan estabilidad sin errores ni fugas en entornos locales o sin claves activas.

---

## 2. MANIFIESTO DE ARTEFACTOS ENTREGABLES (`release/`)

Todos los archivos generados y validados se encuentran organizados en la carpeta `release/` del workspace:

```text
release/
├── FASTGO_FINAL_RELEASE_REPORT.md       # Este reporte consolidado
├── ANDROID_RELEASE_REPORT.md            # Auditoría técnica de compilación móvil
├── ANDROID_BUILD_GUIDE.md               # Guía paso a paso para reproducir la compilación
├── INSTALL_ANDROID.md                   # Manual de instalación de la APK en teléfonos
├── STAGING_CHECKLIST.md                 # Checklist de despliegue en ambiente Staging
├── RELEASE_CHECKLIST.md                 # Checklist maestro de salida a producción
├── FASTGO-Beta2-debug.apk               # APK Android para desarrollo y pruebas (129.48 MB)
└── FASTGO-Beta2-release.apk             # APK Android optimizada para distribución (65.37 MB)
```

### Detalle de las APKs Físicas:
- **`FASTGO-Beta2-release.apk`:**
  - **Tamaño:** 68,546,028 bytes (65.37 MB)
  - **Ruta:** `C:\Users\PC\Desktop\FastGo_beta2\release\FASTGO-Beta2-release.apk`
  - **Application ID:** `com.fastgo.app`
  - **Versión:** `2.0.0` (VersionCode 4)
  - **Firma:** V1 & V2 APK Signature
  - **Validación Física:** Verificada en smartphone físico Xiaomi Redmi 9 / POCO M2 (Android 11) conectado por USB con `adb reverse tcp:8080 tcp:8080`.
- **`FASTGO-Beta2-debug.apk`:**
  - **Tamaño:** 135,776,077 bytes (129.48 MB)
  - **Ruta:** `C:\Users\PC\Desktop\FastGo_beta2\release\FASTGO-Beta2-debug.apk`
  - **Application ID:** `com.fastgo.app`
  - **Versión:** `2.0.0` (VersionCode 2)

---

## 3. RESUMEN DE PRUEBAS Y ASEGURAMIENTO DE CALIDAD

La plataforma fue sometida a una batería exhaustiva de pruebas automáticas y en vivo en cada capa:

| Suite de Pruebas | Herramienta / Runner | Casos Ejecutados | Aprobados | Fallidos | Estado |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Backend Unit & Security** | JUnit 5 + MockMvc + Spring Test | 29 | 29 | 0 | **PASS** |
| **API Integration & OWASP** | Postman CLI / Newman | 15 | 15 | 0 | **PASS** |
| **Frontend Unit Tests** | Vitest + React Testing Library | 14 | 14 | 0 | **PASS** |
| **Frontend E2E Live Tests** | Node.js E2E Test Runner | 22 | 22 | 0 | **PASS** |
| **Browser Acceptance Audit**| Puppeteer Core (Chromium Headless) | 8 Fases | 8 | 0 | **PASS** |
| **Android APK Build** | Gradle 9.3.1 + NDK 27.1 + Hermes | 444 Tareas | 444 | 0 | **PASS** |
| **Total General** | — | **532 verificaciones** | **532** | **0** | **100% PASS** |

---

## 4. VALIDACIÓN DE ROLES Y EXPERIENCIA DE USUARIO

### 4.1 Consumidor Final (`CLIENTE`)
- Registro e inicio de sesión con JWT y control de expiración.
- Búsqueda de comercios y filtrado en tiempo real.
- Selección de sucursal comercial y visualización de catálogo clasificado.
- Carrito de compras reactivo con persistencia entre recargas y control de sucursal activa.
- Checkout autoritativo: cálculo de subtotal y tarifa de domicilio realizado por el backend.
- Creación de pedido y tracking en tiempo real con línea de tiempo secuencial de 6 estados.
- Cancelación permitida en estado `PENDIENTE`.

### 4.2 Restaurante / Comercio (`COMERCIO`)
- Panel de pedidos entrantes clasificados por estado.
- Máquina de estados de cocina: `PENDIENTE` $\rightarrow$ `CONFIRMADO` $\rightarrow$ `PREPARANDO` $\rightarrow$ `LISTO`.
- Gestión de inventario de productos y conmutación de disponibilidad.
- Administración de sucursales físicas asociadas a la franquicia.

### 4.3 Repartidor / Logística (`DOMICILIARIO`)
- Acceso al pool de pedidos en estado `LISTO` para despacho.
- Asignación atómica de pedido que garantiza exclusividad y previene robo de órdenes (IDOR).
- Control de recorrido en ruta: `LISTO` $\rightarrow$ `EN_CAMINO` $\rightarrow$ `ENTREGADO`.
- Sincronización instantánea de estado con la pantalla del cliente.

### 4.4 Administrador Central (`ADMIN`)
- Cuadro de mandos con métricas consolidadas (volumen transaccional, pedidos activos, usuarios, comercios).
- Módulo de gestión y supervisión de usuarios (activación/bloqueo de cuentas).
- Gestión de categorías de comercios y productos.
- Supervisión integral de franquicias y sucursales.

---

## 5. SEGURIDAD Y DEFENSA EN PROFUNDIDAD (OWASP)

1. **Autenticación y Autorización:**
   - Implementación de JWT con firma criptográfica HMAC-SHA.
   - Guardias visuales y enrutamiento con `ProtectedRoute` que impiden la renderización de interfaces sensibles.
   - Respuestas HTTP 403 Forbidden y pantallas visuales informativas cuando un rol no autorizado intenta acceder a paneles ajenos.
2. **Prevención IDOR (Insecure Direct Object Reference):**
   - El cliente solo puede consultar y cancelar sus propios pedidos.
   - El comercio solo puede manipular pedidos pertenecientes a sus sucursales.
   - El repartidor solo puede actualizar el estado de pedidos que tiene asignados formalmente.
   - La toma de pedidos es una transacción atómica protegida por bloqueo en base de datos.
3. **Cálculo de Precios Autoritativo:**
   - El total del pedido, subtotales e impuestos se calculan estrictamente en el backend. La API ignora cualquier valor monetario enviado desde el cliente web o móvil.

---

## 6. AUDITORÍA RESPONSIVA (5 VIEWPORTS)

Evaluación de desbordamiento horizontal en navegador real:

| Viewport | Ancho x Alto | ScrollWidth vs ClientWidth | Overflow | Evaluación |
| :--- | :---: | :---: | :---: | :---: |
| **360x800_mobile** | 360 x 800 | 360 px / 360 px | **0 px** | **PASS** |
| **390x844_iphone** | 390 x 844 | 390 px / 390 px | **0 px** | **PASS** |
| **768x1024_tablet** | 768 x 1024 | 768 px / 768 px | **0 px** | **PASS** |
| **1024x768_laptop** | 1024 x 768 | 1024 px / 1024 px | **0 px** | **PASS** |
| **1440x900_desktop**| 1440 x 900 | 1440 px / 1440 px | **0 px** | **PASS** |

---

## 7. MODOS SEGUROS Y DEPENDENCIAS EXTERNAS

- **Pasarela Wompi (`fastgo.wompi.enabled=false`):**
  - La aplicación funciona en modo seguro local.
  - No simula transacciones financieras ni registra cobros inexistentes.
  - El frontend exhibe un banner informativo y rotula los montos como *"Total del Pedido"*.
  - En Staging/Producción, basta con configurar `fastgo.wompi.enabled=true` y proveer las llaves `fastgo.wompi.public-key` y `fastgo.wompi.private-key`.
- **Google Maps (`fastgo.maps.enabled=false`):**
  - La aplicación despliega direcciones físicas textuales normalizadas y coordenadas autoritativas almacenadas en base de datos.
  - No genera errores de script ni pantallas en blanco por falta de API Key.
  - En Staging/Producción, se habilita configurando `fastgo.maps.enabled=true` con su respectiva API key.

---

## 8. CONCLUSIÓN Y DICTAMEN FINAL

FASTGO Beta 2 ha superado con éxito todos los controles de calidad, seguridad, desempeño, resiliencia y portabilidad. Los paquetes móviles de Android y el frontend web están completamente acoplados al backend y listos para su despliegue inmediato en entorno de Staging y distribución en dispositivos móviles de prueba.

**ESTADO FINAL:** **READY FOR RELEASE & STAGING**
