# Guía de Configuración y Despliegue Local — FastGo Backend

Esta guía detalla el paso a paso exacto para configurar, iniciar y verificar el entorno local de FastGo Backend con PostgreSQL 18, Spring Boot 4.0.7 y las integraciones de Wompi y Google Maps.

---

## 1. Prerrequisitos de Software

1. **Java JDK 21:**
   - Descarga e instala OpenJDK o Temurin JDK 21.
   - Verifica en terminal: `java -version` (debe indicar Java 21).
2. **PostgreSQL 18.x:**
   - Asegúrate de que el servicio esté activo en el puerto local por defecto `5432`.
   - Verifica con `psql -U postgres -h localhost`.
3. **Maven:**
   - No necesitas instalar Maven globalmente; el proyecto incluye el ejecutable `mvnw.cmd` (Windows) y `mvnw` (Linux/macOS).

---

## 2. Creación de Bases de Datos en PostgreSQL

Conéctate a tu servidor local de PostgreSQL mediante `psql` o pgAdmin y crea las dos bases de datos:

```sql
-- Base de datos principal de desarrollo
CREATE DATABASE fastgo_db_new;

-- Base de datos aislada para pruebas automatizadas
CREATE DATABASE fastgo_db_test;
```

> **Nota:** No es necesario ejecutar ningún script SQL manual para crear tablas. Flyway aplicará automáticamente las migraciones versionadas (`V1__initial_schema.sql` y `V2__fastgo_security_delivery.sql`) al arrancar la aplicación o la suite de pruebas.

---

## 3. Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto o exporta las variables en tu entorno de terminal:

### En Windows PowerShell:
```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/fastgo_db_new"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="TuContraseñaDePostgres"
$env:FASTGO_JWT_SECRET="FastGoSuperSecretKeyForDevelopmentTesting32CharsMin!"
$env:FASTGO_JWT_EXPIRATION_MS="3600000"
$env:SERVER_PORT="8080"

# Credenciales para pruebas automatizadas
$env:DB_PASSWORD_TEST="TuContraseñaDePostgres"
```

### Configuración Opcional para Integraciones Sandbox:
```powershell
# Wompi Sandbox
$env:FASTGO_WOMPI_ENABLED="true"
$env:FASTGO_WOMPI_BASE_URL="https://sandbox.wompi.co/v1"
$env:FASTGO_WOMPI_PUBLIC_KEY="pub_test_XXXXXXXX"
$env:FASTGO_WOMPI_PRIVATE_KEY="prv_test_XXXXXXXX"
$env:FASTGO_WOMPI_INTEGRITY_SECRET="prod_integrity_secret_sandbox"
$env:FASTGO_WOMPI_EVENTS_SECRET="events_secret_sandbox"

# Google Maps Platform
$env:FASTGO_MAPS_ENABLED="true"
$env:FASTGO_MAPS_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX"
$env:FASTGO_MAPS_CLIENT_KEY="AIzaSyYYYYYYYYYYYYYYYYYYYYYYYYY"
```

---

## 4. Verificación y Ejecución de Pruebas

Antes de iniciar el servidor, ejecuta la suite completa de pruebas unitarias y de seguridad para validar que la configuración sea 100% correcta:

```powershell
cd C:\Users\PC\Desktop\FastGo_beta2\fastgo-backend
.\mvnw.cmd test
```

Deberás observar en la salida:
```
[INFO] Results:
[INFO] Tests run: 29, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 5. Inicio del Servidor Backend

Para iniciar la aplicación Spring Boot en modo desarrollo:

```powershell
.\mvnw.cmd spring-boot:run
```

El servidor iniciará en:
`http://localhost:8080`

Puedes verificar la salud del backend realizando una petición GET:
```bash
curl http://localhost:8080/api/comercios
```

---

## 6. Pruebas de Integración con Postman / Newman

1. Abre **Postman**.
2. Haz clic en **Import** e importa:
   - Colección: `postman/FastGo_Beta2_Security_Integrations.postman_collection.json`
   - Ambiente: `postman/FastGo_Beta2_Local.postman_environment.json`
3. Selecciona el ambiente activo **FastGo Beta2 - Local Environment**.
4. Ejecuta primero la carpeta `01-auth` para que se capturen y almacenen automáticamente los tokens JWT (`jwtAdmin`, `jwtCliente`, `jwtComercio`, `jwtDomiciliario`).
5. Puedes correr toda la suite con Newman ejecutando:
   ```bash
   npx newman run ..\postman\FastGo_Beta2_Security_Integrations.postman_collection.json -e ..\postman\FastGo_Beta2_Local.postman_environment.json
   ```
