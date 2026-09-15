# FASTGO â€” GuÃ­a de DistribuciÃ³n y Descarga de la AplicaciÃ³n Android

**Paquete:** `com.fastgo.app`  
**VersiÃ³n de ProducciÃ³n:** FastGo Beta 2 Release  
**Archivo FÃ­sico Local:** `release/FASTGO-Beta2-release.apk` (68.5 MB)  
**Dispositivo FÃ­sico de Referencia:** Xiaomi Redmi 9 (Android 11 / MIUI)  

---

## 1. Mecanismos de Descarga y DistribuciÃ³n

### OpciÃ³n A: DistribuciÃ³n VÃ­a URL PÃºblica y QR (ProducciÃ³n)
Cuando la plataforma cuente con un dominio pÃºblico o almacenamiento perimetral (ej. GitHub Releases privado o Cloudflare Pages/R2):
1. La URL de descarga directa se configurarÃ¡ en: `FASTGO_ANDROID_DOWNLOAD_URL.txt`.
2. El cÃ³digo QR correspondiente se generarÃ¡ como: `FASTGO_ANDROID_QR.png`.
3. El usuario podrÃ¡ escanear el cÃ³digo QR con la cÃ¡mara de cualquier telÃ©fono Android para descargar el instalador directamente.

### OpciÃ³n B: InstalaciÃ³n Local VÃ­a ADB (Desarrollo y Pruebas FÃ­sicas)
Con el telÃ©fono conectado por cable USB con *DepuraciÃ³n USB* habilitada:
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