# FASTGO BETA 2 — GUÍA DE COMPILACIÓN NATIVA DE ANDROID (BUILD GUIDE)

**Versión de la App:** 2.0.0  
**Application ID:** `com.fastgo.app`  
**Objetivo:** Instrucciones reproducibles paso a paso para compilar y generar los binarios `.apk` de FASTGO en un entorno local o servidor CI/CD.

---

## 1. REQUISITOS PREVIOS DEL SISTEMA

Para compilar la aplicación móvil nativa de FASTGO se requiere contar con las siguientes herramientas en el sistema operativo (Windows, Linux o macOS):

| Herramienta | Versión Recomendada | Comprobación en Terminal |
| :--- | :--- | :--- |
| **Java Development Kit (JDK)** | JDK 21 (Eclipse Adoptium / OpenJDK) | `javac -version` / `java -version` |
| **Node.js & npm** | Node.js v20.x o superior | `node -v` / `npm -v` |
| **Android SDK** | API Level 36 (VanillaIceCream) | `adb --version` |
| **Android NDK** | NDK 27.1.12297006 (Side-by-side) | Verificado en `$ANDROID_HOME/ndk/` |
| **Android Build Tools** | 36.0.0 | `aapt2 version` |
| **Gradle** | 9.3.1 (Integrado vía Gradle Wrapper) | `.\gradlew.bat --version` |

---

## 2. CONFIGURACIÓN DE VARIABLES DE ENTORNO

Asegúrate de que las siguientes variables de entorno estén configuradas en tu sistema (en Windows PowerShell):

```powershell
# Definir ruta del Android SDK
$env:ANDROID_HOME = "C:\Users\PC\AppData\Local\Android\Sdk"

# Definir ruta del JDK 21
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.7.6-hotspot"

# Agregar herramientas al PATH
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\build-tools\36.0.0;$env:JAVA_HOME\bin;$env:PATH"
```

---

## 3. PREPARACIÓN DEL PROYECTO (`fastgo-cliente`)

1. Navega al directorio de la aplicación móvil:
   ```powershell
   cd C:\Users\PC\Desktop\FastGo_beta2\fastgo-cliente
   ```

2. Instala las dependencias de Node.js:
   ```powershell
   npm install
   ```

3. Verifica que `app.json` contenga la configuración de paquete oficial:
   ```json
   {
     "expo": {
       "name": "FastGo",
       "slug": "fastgo-cliente",
       "version": "2.0.0",
       "android": {
         "package": "com.fastgo.app",
         "versionCode": 2,
         "adaptiveIcon": {
           "backgroundColor": "#E6F4FE",
           "foregroundImage": "./assets/android-icon-foreground.png"
         }
       }
     }
   }
   ```

4. Genera el proyecto nativo de Android:
   ```powershell
   npx expo prebuild --platform android --clean
   ```

5. Configura la ruta del SDK en `fastgo-cliente/android/local.properties`:
   ```properties
   sdk.dir=C\:\\Users\\PC\\AppData\\Local\\Android\\Sdk
   ```

---

## 4. COMPILACIÓN Y GENERACIÓN DE LOS ARCHIVOS APK

Navega a la carpeta nativa `android`:
```powershell
cd C:\Users\PC\Desktop\FastGo_beta2\fastgo-cliente\android
```

### 4.1 Generar APK de Depuración (Debug):
Este binario es ideal para desarrollo rápido, pruebas con emulador y depuración mediante logcat:
```powershell
.\gradlew.bat assembleDebug
```
- **Ubicación de Salida:**  
  `fastgo-cliente\android\app\build\outputs\apk\debug\app-debug.apk`

### 4.2 Generar APK de Lanzamiento (Release):
Este binario incluye minificación, optimización de recursos gráficos, eliminación de símbolos de depuración y compresión de código con el motor Hermes AOT:
```powershell
.\gradlew.bat assembleRelease
```
- **Ubicación de Salida:**  
  `fastgo-cliente\android\app\build\outputs\apk\release\app-release.apk`

### 4.3 Generar Ambos Binarios en una Sola Operación:
```powershell
.\gradlew.bat assembleDebug assembleRelease
```

---

## 5. INSPECCIÓN Y VERIFICACIÓN DEL BINARIO GENERADO

Para verificar la integridad del APK, permisos y Application ID con las herramientas del Android SDK:

```powershell
& "C:\Users\PC\AppData\Local\Android\Sdk\build-tools\36.0.0\aapt.exe" dump badging "..\app\build\outputs\apk\release\app-release.apk"
```

El resultado debe confirmar:
- `package: name='com.fastgo.app'`
- `versionCode='2'`
- `versionName='2.0.0'`
- `targetSdkVersion='36'`

---

## 6. RESOLUCIÓN DE PROBLEMAS FRECUENTES (TROUBLESHOOTING)

1. **Error: `SDK location not found`:**  
   *Causa:* Falta el archivo `local.properties` o la variable `ANDROID_HOME`.  
   *Solución:* Crear `fastgo-cliente/android/local.properties` con `sdk.dir=C\:\\Users\\PC\\AppData\\Local\\Android\\Sdk`.
2. **Error: `NDK not installed`:**  
   *Causa:* Gradle solicita una versión específica del NDK (ej. 27.1.12297006).  
   *Solución:* Gradle descarga automáticamente el NDK compatible si la licencia de Android SDK está aceptada en `$ANDROID_HOME/licenses/android-sdk-license`.
3. **Error: `Out of memory / Java heap space`:**  
   *Solución:* Ajustar `org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m` en `fastgo-cliente/android/gradle.properties`.
4. **Error: `Cleartext HTTP traffic not permitted`:**  
   *Solución:* En Android 9+ el tráfico HTTP a direcciones locales (como `http://10.0.2.2:8080`) requiere configuración de seguridad de red en `AndroidManifest.xml` con `android:usesCleartextTraffic="true"`, la cual ya viene preconfigurada por Expo en el build debug y release local.
