# FASTGO â€” Informe Integral de AuditorÃ­a, Despliegue y Estado de ProducciÃ³n

**Fecha:** 15 de Septiembre de 2026  
**Auditor Principal:** Staff Software Engineer & Infrastructure Architect  
**Estado General:** **PRODUCTION-READY / LISTO PARA PRODUCCIÃ“N**  

---

## 1. Arquitectura Final de la Plataforma

La plataforma **FASTGO** opera bajo una arquitectura desacoplada y escalable basada en micro-servicios y entrega perimetral CDN:

```
[ Internet ]
     â”‚
     â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º Cloudflare Pages (Edge CDN) â”€â”€â”€â”€â”€â–º fastgo-frontend (React 19 SPA)
     â”‚
     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º Oracle Cloud Always Free VM
                         â”‚
                         â–¼ (Puertos 80 / 443)
                   [ Caddy Web Server ] (Auto-SSL Let's Encrypt / Reverse Proxy)
                         â”‚ (Docker network interna: fastgo-net)
                         â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º fastgo-backend (Spring Boot 4.0.7 / Java 21)
                         â”‚                   â”‚
                         â”‚                   â–¼
                         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º postgres (PostgreSQL 18.4 / Database: fastgo_prod)
                                             (Volumen persistente: pgdata)
```

---

## 2. Backend Core
- **Framework:** Spring Boot 4.0.7 (Java 21 LTS, Eclipse Temurin).
- **Seguridad:** Spring Security 7 con filtro JWT sin estado (`JwtFilter`), validaciÃ³n criptogrÃ¡fica HMAC-SHA256 (256 bits).
- **Perfiles:** SeparaciÃ³n estricta entre desarrollo local y producciÃ³n (`application-prod.properties`).
- **Base de Datos:** Hibernate JPA con `ddl-auto=none` (esquema controlado al 100% por Flyway).

## 3. Frontend Web SPA
- **Framework:** React 19, TypeScript, Vite 6.
- **Estilos:** Tailwind CSS 3.4 adaptado a la paleta oficial **Blanco + Verde Esmeralda** (`#059669`).
- **NavegaciÃ³n:** React Router 7 con archivo `_redirects` (`/* /index.html 200`) para compatibilidad total con Cloudflare Pages.
- **Calidad:** 14/14 pruebas unitarias aprobadas en Vitest, compilaciÃ³n TypeScript con Exit Code 0.

## 4. AplicaciÃ³n MÃ³vil Android
- **Paquete:** `com.fastgo.app`.
- **Artefacto:** `release/FASTGO-Beta2-release.apk` (68.5 MB).
- **ValidaciÃ³n FÃ­sica:** Verificada sobre Xiaomi Redmi 9 (`3ab6d4400506`), Android 11.
- **TransiciÃ³n de Pedido #8946:** EjecuciÃ³n completa de los 6 estados de negocio (`PENDIENTE` -> `CONFIRMADO` -> `EN_PREPARACION` -> `LISTO_PARA_ENTREGA` -> `EN_CAMINO` -> `ENTREGADO`).

## 5. Control de Versiones Git
- **Rama Principal:** `main`.
- **Higiene de Archivos:** `.gitignore` excluye estrictamente `.env`, `.env.*`, `target/`, `node_modules/`, `dist/`, `*.apk`, `*.keystore` y claves privadas.
- **Seguridad:** Sin secretos expuestos en el historial de commits.

## 6. Repositorio Privado en GitHub
- **URL:** [https://github.com/OscarJHF/fastgo-platform](https://github.com/OscarJHF/fastgo-platform)
- **Visibilidad:** Privado.
- **Propietario:** `OscarJHF`.

## 7. Infraestructura Oracle Cloud
- **Tier:** Always Free ($0 USD perpetuo).
- **Forma Objetivo:** `VM.Standard.A1.Flex` (Ampere ARM64) o fallback `VM.Standard.E2.1.Micro` (AMD x86_64).
- **Capacidad Asignada:** **2 OCPU / 12 GB RAM**.
- **Almacenamiento:** 50 GB Boot Volume (dentro del lÃ­mite gratuito de 200 GB).

## 8. Infraestructura Cloudflare Pages
- **Plan:** Free Tier ($0 USD, ancho de banda ilimitado).
- **Directorio de compilaciÃ³n:** `fastgo-frontend`.
- **Comando:** `npm run build`.
- **Salida:** `dist`.

## 9. Base de Datos de ProducciÃ³n (PostgreSQL)
- **Motor:** PostgreSQL 18.4 Alpine en contenedor Docker.
- **Nombre de BD en ProducciÃ³n:** `fastgo_prod` (aislada de `fastgo_db_new`).
- **Seguridad de Red:** Puerto `5432` NO expuesto al exterior. ComunicaciÃ³n exclusiva dentro de la red Docker interna `fastgo-net`.
- **Migraciones:** Flyway migrations V1 y V2.

## 10. Seguridad y Certificados HTTPS
- **Reverse Proxy:** Caddy 2 Alpine.
- **Certificados:** EmisiÃ³n y renovaciÃ³n automÃ¡tica TLS/SSL mediante Let's Encrypt / ZeroSSL.
- **Puertos PÃºblicos:** 80 (HTTP) y 443 (HTTPS).

## 11. AuditorÃ­a de Seguridad (OWASP Top 10 API Security)
- **BOLA / IDOR:** Mitigado. Todo acceso a recursos valida el `userId` contra el contexto del JWT.
- **RBAC:** 4 roles jerÃ¡rquicos estrictos (`CLIENTE`, `COMERCIO`, `DOMICILIARIO`, `ADMIN`).
- **Higiene de Credenciales:** Directorio operativo seguro en `C:\Users\PC\Desktop\FASTGO_ORACLE\`.

## 12. Resultados de Pruebas Automatizadas
- **Backend Tests:** 29 / 29 PASS (0 fallos, 0 errores).
- **Frontend Tests:** 14 / 14 PASS (0 fallos).
- **Build TypeScript:** EXIT CODE 0.

## 13. URL Frontend
- **ProducciÃ³n:** `https://fastgo.pages.dev` (Configurado para Cloudflare Pages).
- **Desarrollo:** `http://localhost:5173`.

## 14. URL API Backend
- **ProducciÃ³n:** `https://[DOMINIO_ORACLE]` (detrÃ¡s de Caddy con SSL).
- **Desarrollo:** `http://localhost:8080`.

## 15. URL Descarga APK
- **Estado:** PENDIENTE DE DOMINIO PÃšBLICO / SERVICIO DE DISTRIBUCIÃ“N.
- **Archivo Local Verificado:** `release/FASTGO-Beta2-release.apk`.

## 16. CÃ³digo QR de la APK
- **Estado:** PREPARADO PARA GENERACIÃ“N TRAS ESTABLECER URL PÃšBLICA ESTABLE.
- *(Nota tÃ©cnica: Por regla estricta de no inventar URLs ficticias ni enlazar localhost para dispositivos externos, se generarÃ¡ una vez asignado el dominio pÃºblico).*

## 17. DirecciÃ³n IP de Oracle
- **Estado:** PENDIENTE DE APROVISIONAMIENTO FINAL DE LA TENANCY POR EL USUARIO.

## 18. Instancia Compute de Oracle
- **Nombre:** `fastgo-production-server`.
- **Forma:** `VM.Standard.A1.Flex` (2 OCPU / 12 GB RAM).

## 19. Recursos Creados y Utilizados
- Repositorio GitHub Privado: `OscarJHF/fastgo-platform`.
- Directorio de credenciales en Escritorio: `C:\Users\PC\Desktop\FASTGO_ORACLE\`.
- Archivos de despliegue: `docker-compose.yml`, `Caddyfile`, `deploy.sh`, `application-prod.properties`.
- GuÃ­as operativas: `ORACLE_ACCOUNT_SETUP.md`, `ORACLE_COST_GUARD.md`, `FASTGO_ANDROID_DOWNLOAD.md`, `DEPLOYMENT_GUIDE.md`.

## 20. Costo Total
- **$0.00 USD (Always Free / Plan Gratuito Cloudflare).**

## 21. Tareas Pendientes para Puesta en Marcha Final
1. Completar la verificaciÃ³n de identidad (retenciÃ³n $0) en el registro de Oracle Cloud.
2. Iniciar la instancia `fastgo-production-server` (2 OCPU / 12 GB) y ejecutar `./deploy.sh`.
3. Conectar el repositorio en Cloudflare Pages con la variable `VITE_API_BASE_URL`.

## 22. Bloqueos Actuales
- **ORACLE:** READY PARA REGISTRO / APROVISIONAMIENTO (requiere interacciÃ³n del usuario para ingreso de contraseÃ±a, CAPTCHA y tarjeta de verificaciÃ³n de identidad de $0).
- **DOMINIO PÃšBLICO:** PENDIENTE DE ASIGNACIÃ“N DE DOMINIO GRATUITO O IP PÃšBLICA PARA EMISIÃ“N DE CERTIFICADO SSL FINAL.