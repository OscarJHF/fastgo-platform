# FASTGO â€” GuÃ­a de Despliegue en la Nube ($0 USD Always Free)

Esta guÃ­a detalla los pasos para desplegar la plataforma completa FASTGO (Backend Spring Boot, PostgreSQL, Caddy HTTPS y Frontend React SPA) en infraestructura **100% gratuita y perpetua**:

- **Backend + Base de Datos + SSL:** Oracle Cloud Always Free (Instancia VM `VM.Standard.A1.Flex` con **2 OCPU / 12 GB RAM** o `VM.Standard.E2.1.Micro`).
- **Frontend SPA:** Cloudflare Pages (Ancho de banda ilimitado, SSL global automÃ¡tico, CDN perimetral).
- **Costo total mensual:** **$0.00 USD**.

---

## Arquitectura de Despliegue

```
                                    +-----------------------+
                                    |   Cloudflare Pages    |
                                    | (fastgo.pages.dev)    |
                                    |     Frontend SPA      |
                                    +-----------+-----------+
                                                |
                                    HTTPS API   |
                                    Requests    v
                        +---------------------------------------+
                        |   Oracle Cloud Always Free VM         |
                        |   +---------------------------------+ |
                        |   | Caddy Web Server (Auto-SSL/TLS) | |
                        |   +----------------+----------------+ |
                        |                    | :8080 (interno)|
                        |   +----------------v----------------+ |
                        |   | Spring Boot 4.0.7 Backend       | |
                        |   | (Java 21 Temurin Container)     | |
                        |   +----------------+----------------+ |
                        |                    | :5432 (interno)|
                        |   +----------------v----------------+ |
                        |   | PostgreSQL 18 Container         | |
                        |   | Database: fastgo_prod (Volumen) | |
                        |   +---------------------------------+ |
                        +---------------------------------------+
```

---

## Parte 1: Despliegue del Backend en Oracle Cloud Always Free

### 1.1 Crear la MÃ¡quina Virtual Always Free en OCI
1. Inicia sesiÃ³n en la consola de [Oracle Cloud Infrastructure](https://cloud.oracle.com/).
2. Ve a **Compute > Instances > Create Instance**.
3. ConfiguraciÃ³n estricta de Compute:
   - **Image:** Ubuntu 24.04 LTS o Oracle Linux 9.
   - **Shape:** `VM.Standard.A1.Flex` (Ampere ARM).
   - **OCPUs:** **2 OCPU** (LÃ­mite estricto de tenancy Always Free).
   - **Memoria RAM:** **12 GB RAM** (LÃ­mite estricto de tenancy Always Free).
   - **Boot Volume:** 50 GB (dentro de los 200 GB gratuitos de Oracle).
   - *(Fallback si no hay cupo ARM en el AD):* `VM.Standard.E2.1.Micro` (1 OCPU, 1 GB RAM, Always Free).
4. **Networking y Firewall (VCN Security List):**
   - Permitir entrada Ãºnicamente en los puertos:
     - Puerto `22` (SSH)
     - Puerto `80` (HTTP Caddy para validaciÃ³n Let's Encrypt)
     - Puerto `443` (HTTPS Caddy seguro)
   - **IMPORTANTE:** El puerto `5432` (PostgreSQL) **NUNCA** debe abrirse en la VCN ni exponerse a Internet. Solo se comunica de forma interna por Docker network.
5. **Claves SSH:**
   - Descarga o sube la clave pÃºblica SSH y custodia la clave privada en `C:\Users\PC\Desktop\FASTGO_ORACLE\ssh\`.

### 1.2 Clonar el Repositorio y Configurar Variables
ConÃ©ctate a la VM por SSH:
```bash
ssh -i ~/.ssh/fastgo_oracle_rsa ubuntu@<TU_IP_PUBLICA_ORACLE>
```

Clona el repositorio privado:
```bash
git clone https://github.com/OscarJHF/fastgo-platform.git
cd fastgo-platform
```

Copia y configura las variables de entorno de producciÃ³n:
```bash
cp .env.example .env
nano .env
```
Edita los siguientes valores con contraseÃ±as seguras:
```ini
DB_NAME=fastgo_prod
DB_USERNAME=fastgo_admin
DB_PASSWORD=Genera_Una_Contrasena_Muy_Segura_Aqui
JWT_SECRET=Genera_Una_Clave_JWT_De_Al_Menos_64_Caracteres_Aleatorios
CORS_ALLOWED_ORIGINS=https://fastgo.pages.dev,http://localhost:5173
DOMAIN_NAME=api.tudominio.com # O tu IP pÃºblica/localhost si estÃ¡s configurando
```

### 1.3 Ejecutar el Despliegue Automatizado
Ejecuta el script de aprovisionamiento:
```bash
chmod +x deploy.sh
./deploy.sh
```
El script instalarÃ¡ Docker, construirÃ¡ los contenedores de Spring Boot (con perfil `prod` y base de datos `fastgo_prod`) y PostgreSQL, aplicarÃ¡ las migraciones Flyway automÃ¡ticamente y levantarÃ¡ Caddy con certificado SSL gratuito (Let's Encrypt).

Para verificar el estado:
```bash
docker compose ps
docker compose logs -f backend
```

---

## Parte 2: Despliegue del Frontend en Cloudflare Pages

### 2.1 Conectar con Cloudflare Pages
1. Inicia sesiÃ³n en el panel de [Cloudflare](https://dash.cloudflare.com/).
2. Ve a **Workers & Pages > Create application > Pages > Connect to Git**.
3. Selecciona el repositorio **OscarJHF/fastgo-platform**.
4. Configura los parÃ¡metros de compilaciÃ³n:
   - **Project Name:** `fastgo`
   - **Framework Preset:** `Vite`
   - **Root directory:** `fastgo-frontend`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`

### 2.2 Variables de Entorno en Cloudflare Pages
En la pestaÃ±a **Settings > Environment variables**, aÃ±ade:
- `VITE_API_BASE_URL`: `https://api.tudominio.com` (La URL HTTPS de tu backend en Oracle Cloud).

### 2.3 Enrutamiento SPA
El archivo `fastgo-frontend/public/_redirects` contiene la regla:
```
/*    /index.html   200
```
Esto garantiza que la navegaciÃ³n del cliente (React Router) funcione perfectamente en recargas y rutas directas sin arrojar 404.

---

## Parte 3: Mantenimiento y Backups a Costo Cero

### Copia de Seguridad de Base de Datos (PostgreSQL)
Para generar un dump manual o mediante cron job:
```bash
docker compose exec postgres pg_dump -U fastgo_admin -d fastgo_prod > backup_$(date +%F).sql
```

### Actualizaciones de CÃ³digo (Zero Downtime)
Para desplegar nuevas versiones:
```bash
git pull origin main
docker compose build backend
docker compose up -d --no-deps backend
```