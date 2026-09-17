# FASTGO â€” GuÃ­a de DistribuciÃ³n y Descarga de la AplicaciÃ³n Android

**Paquete:** `com.fastgo.app`  
**VersiÃ³n de ProducciÃ³n:** FastGo Beta 2 Release  
**Archivo FÃ­sico Local:** `release/FASTGO-Beta2-release.apk` (68.5 MB)  
**Dispositivo FÃ­sico de Referencia:** Xiaomi Redmi 9 (Android 11 / MIUI)  

---

## 1. Mecanismos de Descarga y Distribución

### Opción A: Distribución Vía URL Pública y QR (Producción)
- **URL Real de Descarga:** `https://github.com/OscarJHF/fastgo-platform/releases/download/v2.0-beta/FASTGO-Beta2-release.apk`
- **Página de Release:** `https://github.com/OscarJHF/fastgo-platform/releases/tag/v2.0-beta`
- **SHA-256:** `7A79DF7A511D10A1456480EB67DF2A48AF454690DCB371B79CE9C8572327C2BD`
- **Tamaño:** `68,578,664 bytes` (68.5 MB)
- **Código QR:** `FASTGO_ANDROID_QR.png` (apunta a la URL real)
- **Instrucción:** El usuario puede escanear el código QR con la cámara de cualquier teléfono Android o abrir la URL en el navegador móvil para descargar el APK directamente.

### Opción B: Instalación Local Vía ADB (Desarrollo y Pruebas Físicas)
Con el teléfono conectado por cable USB con *Depuración USB* habilitada:
```bash
adb reverse tcp:8080 tcp:8080
adb install -r release/FASTGO-Beta2-release.apk
```

---

## 2. Instrucciones para InstalaciÃ³n en TelÃ©fonos Android

Dado que se trata de una distribuciÃ³n directa (fuera de Google Play Store):

1. **Descarga del archivo APK:**
   - Abre el navegador mÃ³vil (ej. Google Chrome) y descarga el archivo `FASTGO-Beta2-release.apk`.

2. **Permisos de Fuentes Desconocidas:**
   - Al intentar abrir el archivo descargado, Android mostrarÃ¡ una alerta de seguridad:
     *Por motivos de seguridad, tu telÃ©fono no tiene permitido instalar apps desconocidas de esta fuente.*
   - Toca en **ConfiguraciÃ³n / Ajustes**.
   - Activa el interruptor **Permitir desde esta fuente**.
   - En dispositivos Xiaomi / MIUI: Espera la cuenta regresiva de 5 segundos, marca *Soy consciente de los posibles riesgos* y toca **Aceptar**.

3. **ConfirmaciÃ³n de InstalaciÃ³n:**
   - Toca **Instalar**.
   - Una vez finalizado el anÃ¡lisis de seguridad de Google Play Protect / MIUI, toca **Abrir**.

4. **Acceso a la Plataforma:**
   - Ingresa con tus credenciales de Cliente, Comercio, Domiciliario o Administrador.