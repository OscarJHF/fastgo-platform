# ðŸš€ FASTGO â€” Plataforma Integral de Domicilios Hiperlocales

<div align="center">
  <img src="fastgo-frontend/public/assets/images/solcita-un-domiciliario.png" width="320" alt="FastGo Delivery" />
  <p><strong>RÃ¡pido, Confiable y Cerca de Ti en Cada Pedido</strong></p>
  <p>Arquitectura Enterprise Full-Stack â€¢ Java 21 â€¢ Spring Boot 4 â€¢ React 19 â€¢ PostgreSQL 18 â€¢ Android 11+ â€¢ Despliegue 100% Gratuito en la Nube</p>
</div>

---

## ðŸŒŸ VisiÃ³n General

**FASTGO** es un ecosistema completo para entregas y comercio hiperlocal tipo Rappi / DoorDash, diseÃ±ado bajo estÃ¡ndares de alta disponibilidad, seguridad de aplicaciones OWASP y costos operativos optimizados a **$0 USD Always Free**.

El ecosistema integra cuatro roles fundamentales con permisos y vistas segregadas (RBAC):
1. **Cliente:** Descubrimiento de restaurantes y supermercados, carrito reactivo, pedidos en tiempo real y mÃºltiples mÃ©todos de pago.
2. **Comercio Aliado:** GestiÃ³n de sucursales, control de stock/productos y panel de comandas para cocina (`PENDIENTE` -> `CONFIRMADO` -> `EN_PREPARACION` -> `LISTO_PARA_ENTREGA`).
3. **Domiciliario / Repartidor:** App mÃ³vil Android para toma de pedidos listos, navegaciÃ³n GPS y entrega confirmada (`EN_CAMINO` -> `ENTREGADO`).
4. **Administrador:** Panel de auditorÃ­a de usuarios, comercios, categorÃ­as y mÃ©tricas de plataforma.

---

## ðŸŽ¨ Identidad Visual Oficial

La plataforma utiliza la paleta oficial **Blanco + Verde Esmeralda**:
- **Primario Esmeralda:** `#059669` (Hover: `#047857`, Fondo sutil: `#ECFDF5`)
- **Secundario Neutro:** Slate `#0F172A` / `#334155`
- **Fondo de Interfaz:** `#F8FAFC` (Limpio, moderno y accesible)
- **Logotipo:** Vectorial oficial FastGo con ala veloz y tipografÃ­a ergonÃ³mica.

---

## ðŸ—ï¸ Stack TecnolÃ³gico

| Capa | TecnologÃ­as |
|---|---|
| **Backend Core** | Java 21 LTS, Spring Boot 4.0.7, Spring Security 7, Spring Data JPA / Hibernate, Flyway 10, Maven 3.9 |
| **Base de Datos** | PostgreSQL 18.4 (Migraciones versionadas V1 y V2) |
| **Frontend Web** | React 19, TypeScript, Vite, Tailwind CSS 3.4, Lucide Icons, Vitest |
| **App MÃ³vil** | Android 11+ (Capacitor Android Native Bridge, probado fÃ­sicamente en Xiaomi Redmi 9) |
| **Seguridad** | JWT HMAC-SHA256 (256-bit), BCrypt, RBAC estricto, mitigaciÃ³n IDOR/BOLA |
| **Infraestructura Cloud** | Oracle Cloud Always Free (Backend + DB + Caddy SSL), Cloudflare Pages (Frontend SPA) |

---

## ðŸ“Š Estado de Pruebas y ValidaciÃ³n

```
[+] Backend Unit & Security Tests:    29 / 29 PASS (0 fallos, 0 errores)
[+] Frontend Vitest & UI Tests:       14 / 14 PASS (0 fallos)
[+] Frontend TypeScript Build:        EXIT CODE 0 (0 errores de compilaciÃ³n)
[+] Mobile Physical Device Tests:     100% PASS (Xiaomi Redmi 9 - Ciclo Pedido #8946)
[+] Cloudflare Pages SPA Routing:     _redirects configurado
[+] Docker Containerization:          Multi-stage Java 21 Alpine + Caddy Proxy
```

---

## ðŸš€ Inicio RÃ¡pido Local

### 1. Requisitos Previos
- JDK 21 instalado (`java --version`).
- PostgreSQL 16+ corriendo localmente en el puerto 5432.
- Node.js 18+ y npm (`node --version`).

### 2. Levantar Backend (Spring Boot)
```bash
cd fastgo-backend
cp .env.example .env # Ajusta tu clave de postgres
./mvnw clean spring-boot:run
```
El backend iniciarÃ¡ en `http://localhost:8080`.

### 3. Levantar Frontend (Vite React)
```bash
cd fastgo-frontend
npm install
npm run dev
```
El frontend abrirÃ¡ en `http://localhost:5173`.

### 4. Probar en Dispositivo Android FÃ­sico
Conecta tu telÃ©fono por USB con depuraciÃ³n habilitada:
```bash
adb reverse tcp:8080 tcp:8080
adb install -r release/FASTGO-Beta2-release.apk
```

---

## â˜ï¸ Despliegue en la Nube a Costo Cero ($0 USD)

Consulte la guÃ­a completa en [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

- **Oracle Cloud Always Free:** Ejecute `./deploy.sh` en su mÃ¡quina virtual para levantar PostgreSQL, Spring Boot y Caddy con HTTPS automÃ¡tico.
- **Cloudflare Pages:** Conecte este repositorio a Cloudflare Pages apuntando al subdirectorio `fastgo-frontend` con comando `npm run build`.

---

## ðŸ” Seguridad y AuditorÃ­a

Para el desglose de mitigaciones OWASP Top 10 API Security y pruebas de prevenciÃ³n IDOR, consulte [SECURITY_AUDIT.md](SECURITY_AUDIT.md).

---

## ðŸ“ DocumentaciÃ³n de Soporte

- [GuÃ­a de Despliegue Cloud ($0 USD)](DEPLOYMENT_GUIDE.md)
- [Informe de AuditorÃ­a de Seguridad](SECURITY_AUDIT.md)
- [Informe de PreparaciÃ³n para ProducciÃ³n](PRODUCTION_READINESS_REPORT.md)
- [Reporte de Pruebas en Dispositivo Android FÃ­sico](release/ANDROID_PHYSICAL_DEVICE_TEST_REPORT.md)