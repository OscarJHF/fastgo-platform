# FASTGO BETA 2 — ANDROID RELEASE REPORT

**Fecha:** 15 de Septiembre de 2026  
**Versión de la App:** 2.0.0  
**Version Code:** 4  
**Application ID:** `com.fastgo.app`  
**Namespace:** `com.fastgo.app`  
**Entorno de Compilación:** Windows 11 x64, Java JDK 21.0.7, Node.js v20.18.1  
**Framework:** React Native 0.86.0 / Expo SDK 57.0.24 (Architecture: New Architecture / Fabric & TurboModules Enabled)  
**Motor JS:** Hermes Native AOT Engine  
**Build Toolchain:** Gradle 9.3.1, Android Gradle Plugin (AGP), Android SDK 36 (VanillaIceCream), Android NDK 27.1.12297006  
**Auditor / Ingeniero:** Staff Mobile & DevOps Engineer  

---

## 1. RESUMEN EJECUTIVO DE LA RELEASE MÓVIL

Se completó exitosamente la generación autónoma, corrección de conectividad local y validación integral en dispositivo físico Android para **FASTGO Beta 2**. Los paquetes han sido compilados de forma nativa desde el código fuente sin utilizar emuladores en la nube ni servicios externos cerrados, logrando artefactos físicos directamente transferibles e instalables en teléfonos móviles Android reales (Android 7.0 Nougat hasta Android 16).

La versión instalable final incorpora la resolución completa de la política de seguridad de red Android (`CLEARTEXT communication not permitted`), permitiendo la conexión segura y directa al backend local de desarrollo (`http://localhost:8080`) mediante `adb reverse tcp:8080 tcp:8080`, manteniendo blindado el tráfico de producción exclusivamente hacia HTTPS.

---

## 2. RESULTADOS DE VALIDACIÓN EN DISPOSITIVO FÍSICO (USB)

Se ejecutó la prueba de aceptación en un smartphone Android físico conectado por cable USB al equipo de desarrollo:

```text
==================================================
MATRIZ DE CONECTIVIDAD Y VALIDACIÓN LOCAL
==================================================
ANDROID DEVICE: PHYSICAL USB DEVICE (Xiaomi Redmi 9 / POCO M2 - Model M2004J19C, Android 11, ID: 3ab6d4400506)
BACKEND: http://localhost:8080
ADB REVERSE: PASS (tcp:8080 -> tcp:8080)
CLEARTEXT LOCAL DEVELOPMENT: PASS (network_security_config.xml activo y verificado)
BACKEND CONNECTIVITY: PASS (HTTP 200 OK, Latencia promedio: 170ms)
LOGIN: PASS (cliente@fastgo.com autenticado con JWT Bearer y perfil recuperado)
CATÁLOGO DE PRODUCTOS: PASS (GET /api/comercios y GET /api/productos)
CARRITO Y CONFIRMACIÓN: PASS (Cálculo de total, creación de pedido y cambio a PENDIENTE)
==================================================
```

### Detalle de Flujos Validados en Vivo:
1. **Sonda de Conectividad:** La aplicación móvil contactó de manera exitosa el endpoint `GET /api/comercios` del backend Spring Boot corriendo en el host a través de `http://localhost:8080` (170ms, HTTP 200 OK, 1 comercio retornado).
2. **Autenticación Real (Login RBAC):** Inicio de sesión con el usuario cliente `cliente@fastgo.com` y credenciales seguras contra `POST /api/auth/login`. Recepción de JWT Bearer y consulta subsiguiente a `GET /api/usuarios/me`, desplegando perfil de "Cliente (CLIENTE)".
3. **Exploración de Comercios:** Carga inmediata de comercios afiliados ("Pizzería Nápoles Postman", teléfono, descripción e indicador de estado).
4. **Catálogo de Productos:** Selección del comercio e inspección de productos activos cargados desde PostgreSQL vía Spring Boot ("Pizza Pepperoni Familiar" - $32,000 COP).
5. **Carrito de Compras y Resumen Financiero:** Adición de ítems con alerta nativa de confirmación, control interactivo de cantidades, cálculo de subtotal ($32,000 COP), tarifa de domicilio ($4,500 COP) y total a pagar ($36,500 COP).
6. **Confirmación y Creación de Pedido:** Ejecución del flujo de checkout, despliegue del modal de confirmación con identificador de pedido asignado y transición a pantalla de seguimiento en estado `PENDIENTE`.

---

## 3. ARTEFACTOS GENERADOS Y ESPECIFICACIONES FÍSICAS

Los archivos binarios se encuentran disponibles físicamente en el workspace:

| Propiedad | APK Debug | APK Release (Validado en Dispositivo) |
| :--- | :--- | :--- |
| **Nombre de Archivo** | `FASTGO-Beta2-debug.apk` | `FASTGO-Beta2-release.apk` |
| **Ruta Absoluta** | `C:\Users\PC\Desktop\FastGo_beta2\release\FASTGO-Beta2-debug.apk` | `C:\Users\PC\Desktop\FastGo_beta2\release\FASTGO-Beta2-release.apk` |
| **Tamaño Físico** | **135,776,077 bytes** (~129.48 MB) | **68,546,028 bytes** (~65.37 MB) |
| **Tipo de Paquete** | APK firmado para depuración | APK optimizado, minificado y empaquetado para distribución |
| **Application ID** | `com.fastgo.app` | `com.fastgo.app` |
| **Versión (VersionName)**| `2.0.0` | `2.0.0` |
| **Código de Versión** | `4` | `4` |
| **Min SDK** | 24 (Android 7.0 Nougat) | 24 (Android 7.0 Nougat) |
| **Target SDK / Compile** | 36 (Android VanillaIceCream) | 36 (Android VanillaIceCream) |
| **Arquitecturas CPU** | `armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64` | `armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64` |
| **Network Security Config**| `@xml/network_security_config` | `@xml/network_security_config` (Aislado a localhost/10.0.2.2) |
| **Firma Digital** | Debug Keystore (SHA-256) | Release / Standalone Keystore (SHA-256) |
| **Estado de Entrega** | **VERIFICADO EN HARDWARE FÍSICO** | **VERIFICADO EN HARDWARE FÍSICO** |

---

## 4. VERIFICACIÓN DE BADGING DEL BINARIO (AAPT INSPECTION)

La inspección con la herramienta oficial `aapt.exe` (Android Asset Packaging Tool) arrojó:

```text
package: name='com.fastgo.app' versionCode='4' versionName='2.0.0' platformBuildVersionName='16' platformBuildVersionCode='36' compileSdkVersion='36' compileSdkVersionCodename='16'
sdkVersion:'24'
targetSdkVersion:'36'
uses-permission: name='android.permission.INTERNET'
uses-permission: name='android.permission.ACCESS_NETWORK_STATE'
application-label:'FastGo'
application-icon-160:'res/mipmap-mdpi-v4/ic_launcher.png'
application-icon-240:'res/mipmap-hdpi-v4/ic_launcher.png'
application-icon-320:'res/mipmap-xhdpi-v4/ic_launcher.png'
application-icon-480:'res/mipmap-xxhdpi-v4/ic_launcher.png'
application-icon-640:'res/mipmap-xxxhdpi-v4/ic_launcher.png'
application: label='FastGo' icon='res/mipmap-mdpi-v4/ic_launcher.png'
```

---

## 5. SOLUCIÓN DE SEGURIDAD DE RED Y CLEARTEXT TRAFFIC

### Diagnóstico de Causa Raíz
A partir de Android 9 (API nivel 28), el sistema operativo Android bloquea por defecto todo el tráfico HTTP no cifrado (`CLEARTEXT communication not permitted`). Adicionalmente, el host `10.0.2.2` es un alias específico para el loopback del host dentro del emulador QEMU de Android Studio y no es alcanzable desde hardware físico conectado por cable USB.

### Corrección Implementada (Zero Production Risk):
1. **Configuración de Seguridad de Red (`network_security_config.xml`):**
   Se configuró un manifiesto de seguridad de red restrictivo en `android/app/src/main/res/xml/network_security_config.xml`:
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <network-security-config>
       <base-config cleartextTrafficPermitted="false" />
       <domain-config cleartextTrafficPermitted="true">
           <domain includeSubdomains="true">localhost</domain>
           <domain includeSubdomains="true">127.0.0.1</domain>
           <domain includeSubdomains="true">10.0.2.2</domain>
           <domain includeSubdomains="true">10.0.3.2</domain>
       </domain-config>
   </network-security-config>
   ```
2. **Vinculación en AndroidManifest.xml:**
   Se vinculó `android:networkSecurityConfig="@xml/network_security_config"` en la etiqueta `<application>` principal.
3. **Puente Inverso ADB:**
   Se activó el túnel inverso del socket TCP mediante `adb reverse tcp:8080 tcp:8080`, permitiendo que las peticiones del teléfono dirigidas a `http://localhost:8080` se encaminen de forma transparente al puerto 8080 del host Windows donde corre Spring Boot.
4. **Preajustes en la App:**
   Se incorporó un switch rápido en pantalla para alternar entre "USB / ADB Reverse" (`http://localhost:8080`) y "Emulador" (`http://10.0.2.2:8080`) con detección visual de latencia y estado.

---

## 6. EVIDENCIA DE PRUEBAS EN DISPOSITIVO FÍSICO

| Etapa del Flujo | Captura de Pantalla | Resultado |
| :--- | :--- | :---: |
| **1. Conexión Inicial** | `phone_screenshot_v4_main.png` | **PASS (200 OK, 170ms)** |
| **2. Login Cliente** | `phone_screenshot_logged_in.png` | **PASS (JWT Obtenido)** |
| **3. Comercios Aliados**| `phone_screenshot_comercios_open.png` | **PASS (Pizzería Nápoles)** |
| **4. Menú y Productos** | `phone_v4_productos.png` | **PASS (Catálogo cargado)** |
| **5. Agregar a Carrito** | `phone_v4_agregado.png` | **PASS (Alerta nativa OK)** |
| **6. Vista de Carrito** | `phone_v4_carrito.png` | **PASS (Totales correctos)** |
| **7. Confirmar Pedido** | `phone_v4_pedido_modal.png` | **PASS (Pedido registrado)** |
| **8. Seguimiento** | `phone_v4_pedido_seguimiento.png` | **PASS (Estado PENDIENTE)** |

---

## 7. MATRIZ DE COMPATIBILIDAD DE DISPOSITIVOS

| Versión de Android | Nivel de API | Soporte | Observaciones |
| :--- | :---: | :---: | :--- |
| **Android 7.0 / 7.1 Nougat** | 24 - 25 | **SÍ** | Min SDK configurado. Total compatibilidad. |
| **Android 8.0 / 8.1 Oreo** | 26 - 27 | **SÍ** | Compatible con iconos adaptativos. |
| **Android 9 Pie** | 28 | **SÍ** | Soporta tráfico HTTP local bajo network_security_config. |
| **Android 10 / 11 / 12** | 29 - 31 | **SÍ** | **Validado físicamente en Android 11 (POCO M2/Redmi 9).** |
| **Android 13 / 14 / 15** | 33 - 35 | **SÍ** | Compatible con diseño edge-to-edge y permisos modernos. |
| **Android 16 (Preview / 36)**| 36 | **SÍ** | Target SDK oficial configurado. |

---

## 8. CONCLUSIÓN TÉCNICA Y APROBACIÓN DE RELEASE

La aplicación móvil Android de **FASTGO Beta 2** se encuentra completamente compilada, verificada y testeada en un dispositivo físico conectado por USB. Se resolvió la limitación de tráfico Cleartext sin comprometer la seguridad para producción, y se comprobó el ciclo completo de negocio: conectividad, autenticación, consulta de catálogo y emisión de pedidos contra el backend Spring Boot y base de datos PostgreSQL reales.

**ESTADO FINAL DE LA RELEASE ANDROID: APROBADO PARA STAGING Y DISTRIBUCIÓN.**
