# FastGo — Frontend Web & PWA

Aplicación frontend completa, moderna y reactiva para la plataforma de domicilios **FastGo**, construida con **React 18**, **TypeScript**, **Vite 6** y **Tailwind CSS**, conectada e integrada directamente al backend en Spring Boot 4.

---

## 1. Requisitos del Sistema

- **Node.js:** Versión 18+ (probado y certificado en Node.js `v24.15.0`).
- **NPM:** Versión 9+.
- **Backend FastGo:** Spring Boot 4.0.7 ejecutándose en `http://localhost:8080`.
- **Base de Datos:** PostgreSQL 18.4 (`fastgo_db_new`).

---

## 2. Instalación y Puesta en Marcha

Clonar o ubicarse en el directorio del frontend:

```bash
cd C:\Users\PC\Desktop\FastGo_beta2\fastgo-frontend
npm install
```

### Modo de Desarrollo
Inicia el servidor local de desarrollo con Hot Module Replacement (HMR):

```bash
npm run dev
```
La aplicación estará disponible de inmediato en: `http://localhost:5173`.

### Compilación para Producción (Build)
Genera el bundle estático optimizado, minificado y comprimido con verificación de tipos TypeScript:

```bash
npm run build
```
Los artefactos compilados se generan en `fastgo-frontend/dist/`.

### Verificación de Tipos y Linter
```bash
npm run lint
```

### Ejecución de Pruebas Unitarias
Ejecuta la suite de pruebas unitarias y de componentes mediante Vitest y Testing Library:

```bash
npm test
```

### Ejecución de Pruebas de Integración E2E
Ejecuta la suite de integración automatizada de 10 flujos contra el backend en vivo (`http://localhost:8080`):

```bash
npm run test:e2e
```

---

## 3. Variables de Entorno

El archivo `.env` en la raíz de `fastgo-frontend` gestiona las configuraciones públicas del cliente:

```env
# URL base del backend REST
VITE_API_URL=http://localhost:8080

# Clave pública de Google Maps para SDK cliente (opcional / restringida)
VITE_GOOGLE_MAPS_KEY=
```

> **Aviso de Seguridad:** Nunca declares secretos privados en variables `VITE_*` (claves de integridad Wompi, claves privadas de Google Maps o secretos JWT). Toda variable prefijada con `VITE_` se compila en el código cliente accesible públicamente en el navegador.

---

## 4. Arquitectura del Proyecto

```text
fastgo-frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── src/
    ├── api/
    │   └── apiClient.ts             # Cliente Axios centralizado con interceptor JWT y 401
    ├── components/
    │   ├── common/                  # Button, Input, Select, Modal, Card, Badge, Spinner...
    │   ├── guards/                  # ProtectedRoute (Auth) y RoleRoute (RBAC)
    │   └── layout/                  # Navbar responsivo, Footer y AppLayout
    ├── config/
    │   └── env.ts                   # Acceso tipado a variables de entorno
    ├── constants/
    │   ├── colors.ts                # Paleta de identidad corporativa FastGo
    │   ├── orderStatus.ts           # Máquina de estados de pedidos y badges
    │   └── routes.ts                # Mapeo unificado de rutas de la app
    ├── context/
    │   ├── AuthContext.tsx          # Sesión, JWT, perfil de usuario y auto-logout
    │   ├── CartContext.tsx          # Carrito de compras, items y sucursal activa
    │   └── ToastContext.tsx         # Sistema de notificaciones toast flotantes
    ├── pages/
    │   ├── auth/                    # Login y Registro con auto-fill demo
    │   ├── client/                  # Home, ComercioDetail, Carrito, Checkout, Direcciones, Pedidos, Perfil
    │   ├── commerce/                # Dashboard de comercio, Pedidos, Productos y Sedes
    │   ├── delivery/                # Panel de pedidos disponibles y entregas activas
    │   └── admin/                   # Panel de administración, Usuarios, Categorías y Comercios
    ├── routes/
    │   └── index.tsx                # Definición de rutas y asignación de guards
    ├── services/                    # Clientes API tipados por módulo del backend
    ├── types/                       # Interfaces TypeScript alineadas al DTO del backend
    └── utils/
        ├── errorHandler.ts          # Normalizador seguro de errores HTTP y de red
        └── formatters.ts            # Moneda (COP) y fechas colombianas
```

---

## 5. Autenticación, JWT y Control de Acceso (RBAC)

1. **Almacenamiento de Token:** Al autenticarse mediante `POST /api/auth/login`, el token JWT se resguarda en `localStorage` bajo la clave `fastgo_auth_token`.
2. **Inyección Automática:** Cada solicitud HTTP saliente adjunta automáticamente la cabecera:
   ```http
   Authorization: Bearer <token>
   ```
3. **Manejo de Sesión Expirada (401):** El interceptor global detecta respuestas HTTP 401 (token expirado o inválido), purga el almacenamiento local y despacha el evento `fastgo:auth:unauthorized`, redirigiendo al usuario a `/login` sin inconsistencias de estado.
4. **Protección de Rutas:**
   - `<ProtectedRoute>`: Requiere sesión activa.
   - `<RoleRoute allowedRoles={['...']}>`: Valida si el usuario autenticado tiene el rol permitido (`CLIENTE`, `COMERCIO`, `DOMICILIARIO`, `ADMIN`). Si no cuenta con el rol, despliega una vista amigable de "Acceso Denegado (403)" con botón para volver al inicio.

---

## 6. Módulos y Flujos Implementados

### 👤 Cliente
- Exploración de comercios por categoría y búsqueda de texto.
- Menú del comercio con productos por categoría y selección de cantidades.
- Carrito persistente en el servidor (`/api/carritos`).
- Gestión de libreta de direcciones con coordenadas geográficas y selección de dirección principal.
- Creación de pedidos con cálculo autoritativo en backend (`POST /api/pedidos`).
- Visualización de pedidos con línea de tiempo y cancelación habilitada solo en estado `PENDIENTE`.

### 🏪 Comercio
- Vista general de métricas operativas (por confirmar, en preparación, listos para entrega).
- Gestión del ciclo de vida de la orden:
  - `CONFIRMADO` → `PUT /api/pedidos/:id/confirmar`
  - `PREPARANDO` → `PUT /api/pedidos/:id/preparar`
  - `LISTO` → `PUT /api/pedidos/:id/listo`
- Catálogo de productos: agregar nuevos productos, precios, descripción, categoría, tiempo de preparación y disponibilidad.
- Sucursales: configuración de sedes físicas y radio de entrega.

### 🛵 Domiciliario
- Piscina de pedidos disponibles (`GET /api/pedidos/domiciliario/disponibles`).
- Toma atómica de orden (`PUT /api/pedidos/:id/tomar`), previniendo condiciones de carrera con otros repartidores.
- Seguimiento de ruta: cambio a `EN_CAMINO` (`PUT /api/pedidos/:id/en-camino`).
- Confirmación de entrega al cliente: `ENTREGADO` (`PUT /api/pedidos/:id/entregar`).

### 🛡️ Administrador
- Auditoría de todos los usuarios registrados (con rol y estado de activación).
- Gestión y creación de categorías oficiales de productos.
- Monitoreo de comercios aliados.

---

## 7. Integraciones Externas

- **Wompi Colombia:** Integración preparada en checkout para pagos mediante Nequi y PSE. En modo Sandbox deshabilitado (`fastgo.wompi.enabled=false`), el backend responde de manera segura (400 Bad Request) y el frontend muestra feedback descriptivo sin exponer credenciales bancarias.
- **Google Maps Platform:** La clave del servidor permanece estrictamente en el backend. El frontend consume los endpoints proxy seguros (`/api/maps/config`, `/api/maps/geocode`, `/api/maps/route`), protegiendo cualquier cuota o API key.

---

## 8. Solución de Problemas Frecuentes (Troubleshooting)

- **Error de conexión con el backend:**
  Verifica que el proceso de Spring Boot esté activo en el puerto 8080:
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:8080/api/comercios"
  ```
- **Error CORS:**
  Comprueba que `http://localhost:5173` esté listado en `FASTGO_CORS_ALLOWED_ORIGINS` en el archivo `application.properties` del backend.
