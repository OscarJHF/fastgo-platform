# FASTGO — CERTIFICACIÓN FINAL DE PRODUCCIÓN Y DISTRIBUCIÓN REAL

**Fecha de Emisión:** 1 de Octubre de 2026  
**Estado:** CERTIFICADO PARA PRODUCCIÓN Y DISTRIBUCIÓN REAL  
**Versión de Plataforma:** FastGo Beta2 (v1.0.0-beta2 / v2.1.0 Build 6)

---

## 1. RESUMEN EJECUTIVO Y ESTADO DE ENTORNOS

| Componente | Entorno / Proveedor | Identificador / URL | Estado |
| :--- | :--- | :--- | :--- |
| **Backend API** | Render (Docker Java 21) | `https://fastgo-backend-lp2j.onrender.com` | **UP (Saludable)** |
| **Frontend Web** | Cloudflare Workers | `https://fastgo-app.fastgo-frontend.workers.dev` | **UP (HTTP 200)** |
| **Base de Datos** | Neon Tech Serverless Postgres | `ep-shiny-thunder-b4zxd29n-pooler` (AWS Ohio) | **ONLINE (11 tablas)** |
| **Almacenamiento** | Cloudflare R2 / Fallback Seguro | S3-Compatible / StorageService Abstraction | **PREPARADO / OPERATIVO** |
| **Aplicación Móvil**| Android Release APK | `release/FASTGO-Beta2-release.apk` | **CERTIFICADO (PASS)** |
| **Dispositivo Físico**| Xiaomi Redmi 9 (MIUI / Android 11)| ADB Serial: `3ab6d4400506` | **CONECTADO Y VALIDADO** |

---

## 2. AUDITORÍA DE SEGURIDAD Y ARCHIVOS (FASE 3)

Todas las salvaguardas de seguridad fueron validadas mediante pruebas automatizadas e integradas:

1. **Aislamiento de Archivos Públicos:**  
   Las fotos de productos y logos de comercios se sirven públicamente bajo `/api/uploads/{filename}` con validación estricta de Magic Bytes (rechaza extensiones falsas, executables y scripts).
2. **Privacidad Absoluta de Comprobantes Bancarios:**  
   Los comprobantes de pago NO se exponen en `/api/uploads/`. Se gestionan exclusivamente mediante el endpoint privado `/api/pedidos/{id}/comprobante`.
3. **Control de Acceso Basado en Roles (RBAC) y Anti-IDOR:**
   - Acceso sin token: `401 Unauthorized`.
   - Intento de acceso de un cliente al comprobante de otro cliente: `403 Forbidden`.
   - Intento de un comercio no propietario al comprobante: `403 Forbidden`.
   - Intento de un domiciliario a consultar comprobantes bancarios: `403 Forbidden`.
   - Consulta autorizada (Cliente dueño, Comercio propietario, ADMIN): `200 OK` con `Cache-Control: private, no-store`.

---

## 3. RESULTADOS DE LA SUITE DE PRUEBAS AUTOMATIZADAS (FASE 4)

| Suite | Comando | Total Tests | Pasaron | Fallaron | Estado |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Backend Spring Boot** | `mvnw.cmd test` | 55 | 55 | 0 | **PASS (100%)** |
| **Frontend Web (Vitest)**| `npm test -- --run` | 14 | 14 | 0 | **PASS (100%)** |
| **Frontend Web Build** | `npm run build` (tsc -b && vite) | Compilación | OK | 0 | **PASS (100%)** |
| **Android TypeScript** | `npx tsc --noEmit` | Verificación de tipos | OK | 0 | **PASS (100%)** |

---

## 4. MATRIZ DE PARIDAD DE FUNCIONALIDADES: WEB VS ANDROID (FASE 5)

| Funcionalidad / Módulo | Web (`workers.dev`) | Android (`FASTGO-Beta2-release.apk`) | Estado de Paridad |
| :--- | :---: | :---: | :---: |
| **Registro con selector de Rol** (Cliente, Comercio, Domiciliario) | Soportado | Soportado | **MATCH** |
| **Login con JWT y redirección por Rol** | Soportado | Soportado | **MATCH** |
| **Recuperación de Contraseña** | Soportado | Soportado | **MATCH** |
| **Catálogo de Comercios y Productos** | Soportado con imágenes reales | Soportado con imágenes reales | **MATCH** |
| **Carrito de Compras y Checkout** | Soportado | Soportado | **MATCH** |
| **Gestión de Direcciones de Entrega** | Soportado | Soportado | **MATCH** |
| **Tarifa de Domicilio Dinámica por Comercio** (mínimo $2.000 COP) | Soportado | Soportado | **MATCH** |
| **Pago en Efectivo** | Soportado | Soportado | **MATCH** |
| **Pago Bancolombia Transferencia** (con datos de cuenta y titular) | Soportado | Soportado | **MATCH** |
| **Subida de Comprobante Bancario** (cámara/galería) | Soportado (Input file seguro) | Soportado (Galería nativa Android) | **MATCH** |
| **Tracking de Pedido en Tiempo Real** | Soportado | Soportado | **MATCH** |
| **Panel de Comercio (Configuración)** (Tarifa y Bancolombia) | Soportado | Soportado | **MATCH** |
| **Panel de Comercio (Catálogo)** (Subida de fotos de productos) | Soportado | Soportado | **MATCH** |
| **Cocina: Flujo PENDIENTE -> CONFIRMAR -> PREPARAR -> LISTO** | Soportado | Soportado | **MATCH** |
| **Cocina: Verificación y Aprobación/Rechazo de Comprobante** | Soportado | Soportado | **MATCH** |
| **Cocina: Bloqueo de avance a LISTO sin aprobación de pago** | Soportado | Soportado | **MATCH** |
| **Domiciliario: Pedidos disponibles con tarifa ganada** | Soportado | Soportado | **MATCH** |
| **Domiciliario: Asignación atómica (Anti-colisión 409)** | Soportado | Soportado | **MATCH** |
| **Domiciliario: Flujo ASIGNADO -> EN_CAMINO -> ENTREGADO** | Soportado | Soportado | **MATCH** |
| **Panel de Administración General** (Usuarios, Comercios, Métricas) | Soportado (`/admin/dashboard`) | No aplica a app móvil operativa | **DIFERENTE POR DISEÑO** |

---

## 5. REPORTE DE USUARIO ADMINISTRADOR REAL (FASE 8)

- **Usuario Generado:** `admin@fastgo.com` (Rol ADMIN, ID: 4).
- **Almacenamiento Seguro de Credenciales:** `C:\Users\PC\Desktop\FastGo_Admin_Credentials.txt`  
  *(Contraseña generada con entropía criptográfica de 22 caracteres, protegida mediante BCrypt con factor de costo 12).*
- **Validación en Vivo:** Login autenticado exitosamente contra la API de producción (`HTTP 200`, JWT emitido).
- **Ruta Web del Panel Admin:** `https://fastgo-app.fastgo-frontend.workers.dev/admin/dashboard`
- **Ruta Android del Panel Admin:** **ADMIN PANEL NO IMPLEMENTADO EN ANDROID** (La app Android está diseñada y optimizada exclusivamente para Cliente, Comercio y Domiciliario).

---

## 6. DISTRIBUCIÓN Y DESCARGA OFICIAL DEL APK (FASE 9)

- **Nombre de archivo:** `FASTGO-Beta2-release.apk`
- **SHA-256 Verificado:** `CE2C416EFFFE0A80C35CF711E282B10319ABF79A2EB8738D782199C6EF53EF1E`
- **Tamaño:** `68,986,918 bytes` (65.7 MB)
- **Tag en Repositorio GitHub:** `v1.0.0-beta2`
- **URL Pública de Descarga:**  
  `https://github.com/OscarJHF/fastgo-platform/releases/download/v2.0-beta/FASTGO-Beta2-release.apk`
- **Página Oficial del Release:**  
  `https://github.com/OscarJHF/fastgo-platform/releases/tag/v2.0-beta`
