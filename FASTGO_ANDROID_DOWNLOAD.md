# FASTGO â€” GuÃ­a de DistribuciÃ³n y Descarga de la AplicaciÃ³n Android

**Paquete:** `com.fastgo.app`  
**Versión de Producción:** FastGo v2.1.0 Release (Build 6)  
**Archivo Físico Local:** `release/FASTGO-Beta2-release.apk` (68.3 MB)  
**Dispositivo Físico de Referencia:** Xiaomi Redmi 9 (Android 11 / MIUI)  

---

## 1. Mecanismos de Descarga y Distribución

### Opción A: Distribución Vía URL Pública y QR (Producción)
- **URL Real de Descarga:** `https://github.com/OscarJHF/fastgo-platform/releases/download/v2.0-beta/FASTGO-Beta2-release.apk`
- **Página de Release:** `https://github.com/OscarJHF/fastgo-platform/releases/tag/v2.0-beta`
- **SHA-256:** `C52F0F69EF6BDE44A4C48A5A05CA401D308B7DA1F8A3C1ED0AC499264A667659`
- **Tamaño:** `68,309,720 bytes` (68.3 MB)
- **Código QR:** `FASTGO_ANDROID_QR.png` (apunta a la URL real de descarga directa)
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