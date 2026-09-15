# FASTGO BETA 2 — MANUAL DE INSTALACIÓN EN DISPOSITIVOS ANDROID

Este manual detalla cómo transferir e instalar el archivo **`FASTGO-Beta2-release.apk`** o **`FASTGO-Beta2-debug.apk`** en cualquier teléfono o tableta con sistema operativo **Android (versión 7.0 o superior)**.

---

## 1. UBICACIÓN DE LOS ARCHIVOS INSTALABLES

Los binarios están listos en tu computadora en la carpeta `release/`:

- **APK de Lanzamiento (Recomendada):**  
  `C:\Users\PC\Desktop\FastGo_beta2\release\FASTGO-Beta2-release.apk` (Tamaño: ~65 MB)
- **APK de Depuración:**  
  `C:\Users\PC\Desktop\FastGo_beta2\release\FASTGO-Beta2-debug.apk` (Tamaño: ~129 MB)

---

## 2. MÉTODO 1: INSTALACIÓN RÁPIDA MEDIANTE CABLE USB Y ADB (RECOMENDADO)

Si tienes tu teléfono conectado a la computadora con un cable USB y la **Depuración USB** activada:

1. Abre una terminal de PowerShell en tu PC.
2. Ejecuta el comando de instalación directa:
   ```powershell
   & "C:\Users\PC\AppData\Local\Android\Sdk\platform-tools\adb.exe" install -r "C:\Users\PC\Desktop\FastGo_beta2\release\FASTGO-Beta2-release.apk"
   ```
3. En la pantalla del teléfono, pulsa **"Instalar"** o **"Permitir"**.
4. Verás el mensaje `Success` en la terminal y la app **FastGo** aparecerá de inmediato en el menú de aplicaciones de tu teléfono.

---

## 3. MÉTODO 2: TRANSFERENCIA POR WHATSAPP, TELEGRAM O GOOGLE DRIVE

Si prefieres enviar la APK directamente a tu teléfono sin usar cables:

1. **Vía WhatsApp Web / Telegram:**
   - Abre WhatsApp Web o Telegram Desktop en tu PC.
   - Envía el archivo `FASTGO-Beta2-release.apk` a tu propio chat o grupo de pruebas.
   - En tu teléfono móvil, abre WhatsApp/Telegram y descarga el archivo adjunto.
   - Toca el archivo descargado para iniciar el instalador de paquetes de Android.
2. **Vía Google Drive / Correo:**
   - Sube `FASTGO-Beta2-release.apk` a tu Google Drive o OneDrive.
   - Abre la aplicación de Drive en tu teléfono y toca sobre el archivo APK.
   - Selecciona **"Instalador de paquetes"**.

---

## 4. MÉTODO 3: SERVIDOR LOCAL WI-FI (DESCARGA DIRECTA)

Puedes descargar la app directamente en tu teléfono a través del navegador móvil de tu teléfono conectado al mismo Wi-Fi:

1. En tu PC, abre PowerShell en la carpeta `release`:
   ```powershell
   cd C:\Users\PC\Desktop\FastGo_beta2\release
   python -m http.server 8000
   ```
2. Averigua la IP local de tu computadora en la red Wi-Fi (ejecuta `ipconfig` en otra terminal, por ejemplo `192.168.1.15`).
3. En el navegador Google Chrome de tu teléfono, ingresa:
   ```text
   http://192.168.1.15:8000/FASTGO-Beta2-release.apk
   ```
4. El teléfono comenzará a descargar la aplicación inmediatamente.

---

## 5. CONFIGURACIÓN DE PERMISOS EN EL TELÉFONO MÓVIL

Debido a que la aplicación no proviene de Google Play Store sino de un paquete independiente firmado para pruebas de desarrollo, Android solicitará confirmación de seguridad:

1. **Permitir la instalación de fuentes desconocidas:**
   - Si aparece el mensaje *"Por seguridad, tu teléfono no tiene permitido instalar apps desconocidas de esta fuente"*:
   - Pulsa en **"Configuración / Ajustes"**.
   - Activa la casilla **"Permitir desde esta fuente"** (o *"Permitir instalación de apps"*).
   - Regresa a la pantalla anterior y pulsa **"Instalar"**.
2. **Aviso de Google Play Protect:**
   - Si Play Protect muestra el aviso *"Aplicación bloqueada por Play Protect"* o *"Desarrollador no reconocido"*:
   - Pulsa en **"Más detalles"** (flecha hacia abajo).
   - Selecciona la opción **"Instalar de todas formas"** (o *"Instalar de todas formas, no seguro"*).
3. **Confirmación Final:**
   - Pulsa **"Abrir"** al terminar la instalación.

---

## 6. CONECTAR LA APP MÓVIL CON EL BACKEND LOCAL

Cuando abras la aplicación **FastGo** en tu teléfono:

1. Verás el encabezado corporativo **FASTGO — BETA 2 ANDROID**.
2. En la tarjeta **"Conectividad Backend"**, verás un campo para ingresar la URL de la API:
   - Si estás en un **Emulador Android**: usa `http://10.0.2.2:8080`.
   - Si estás en un **Teléfono Físico**: ingresa la dirección IP local de tu computadora (ejemplo: `http://192.168.1.15:8080`).
3. Pulsa el botón **"Probar Conexión"**.
4. La aplicación se comunicará con el backend Spring Boot y listará los comercios aliados en tiempo real.
