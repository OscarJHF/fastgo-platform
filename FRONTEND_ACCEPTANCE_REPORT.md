# FASTGO — REPORTE DE AUDITORÍA FINAL VISUAL Y FUNCIONAL DE ACEPTACIÓN

**Fecha de Ejecución:** 14 de Septiembre de 2026  
**Auditor:** Staff Software Engineer & QA Automation Lead  
**Entorno de Ejecución:** Navegador Real (Chromium Headless / Puppeteer Core Engine)  
**Backend:** Spring Boot 4.0.7 (Java 21) en `http://localhost:8080`  
**Frontend:** React 19 + TypeScript + Vite + Tailwind CSS en `http://localhost:5173`  
**Base de Datos:** PostgreSQL 18.4 (`fastgo_db_new`)  
**Colección E2E / Automatización:** 22/22 Tests de Integración en Vivo, 14/14 Tests Unitarios Vitest, Suite de Navegador Puppeteer (8 Fases, 25 Capturas de Pantalla)

---

## 1. LEVANTAMIENTO Y SALUD DEL ENTORNO

Ambos servicios fueron verificados en tiempo real mediante sondeos HTTP e inspección de sockets locales:

| Componente | Dirección / Endpoint | Estado HTTP | Latencia | Integración |
| :--- | :--- | :---: | :---: | :--- |
| **Backend API** | `http://localhost:8080/api/comercios` | **200 OK** | ~42 ms | Spring Boot 4.0.7 + PostgreSQL 18.4 |
| **Frontend Web** | `http://localhost:5173/` | **200 OK** | ~12 ms | Vite Dev Server (V2/HMR Activo) |
| **Persistencia DB**| `localhost:5432/fastgo_db_new` | **CONECTADO** | <5 ms | HikariCP Pool (Flyway V1..V8) |

**Cero Mocks Utilizados:** Todas las verificaciones se ejecutaron contra el stack real completo, interactuando con el DOM generado por React y persistiendo datos en la base de datos PostgreSQL.

---

## 2. FLUJO INTEGRAL: CLIENTE (CONSUMIDOR FINAL)

Se ejecutó la jornada completa de punta a punta del rol `CLIENTE` utilizando la cuenta de pruebas (`cliente@fastgo.com`):

```
LOGIN
  ↓
HOME (Listado de comercios)
  ↓
BUSCAR COMERCIO ("Nápoles")
  ↓
ABRIR COMERCIO (Detalle Pizzería Nápoles)
  ↓
SELECCIONAR SUCURSAL (Sucursal Poblado - ID 1)
  ↓
VER PRODUCTOS & AGREGAR AL CARRITO (+ Feedback visual de Toast)
  ↓
ABRIR CARRITO & MODIFICAR CANTIDAD (+1 unidad)
  ↓
CHECKOUT (Selección de Dirección & Notificación Wompi Seguro)
  ↓
CREAR PEDIDO (Total autoritativo calculado en Backend)
  ↓
VER PEDIDO & TRACKING EN TIEMPO REAL (Barra secuencial de estados)
  ↓
CANCELACIÓN DE PEDIDO (Estado PENDIENTE permitido por máquina de estados)
```

### Resultados de la Validación Cliente:
- **Autenticación:** Formulario de inicio de sesión reactivo con auto-completado de credenciales demo, gestión segura de JWT en `localStorage`, decodificación de roles y expiración.
- **Catálogo y Búsqueda:** El buscador por texto filtra dinámicamente en memoria y contra backend. La card del comercio muestra estado operativo ("Abierto"), tiempo estimado y costo de domicilio.
- **Carrito Persistente y Multi-Sucursal:** Se seleccionó la sucursal activa. Al agregar el producto (Pizza Margherita, $28.000 COP) se incrementó el badge global de la cabecera. En la página de carrito se incrementó a 2 unidades ($56.000 COP), recalculando subtotal y domicilio ($4.500 COP) de forma instantánea.
- **Checkout Autoritativo:** Carga de direcciones registradas del cliente (ej. "Calle 10 #40-20, Medellín") y selector de medios de pago. Despliega aviso de seguridad de pasarela Wompi en modo local.
- **Creación de Pedido:** Se generó el pedido autoritativo `#15` en estado `PENDIENTE`.
- **Tracking:** Renderizado de la barra secuencial de progreso (`PENDIENTE` -> `CONFIRMADO` -> `EN_PREPARACION` -> `LISTO_PARA_ENTREGA` -> `EN_CAMINO` -> `ENTREGADO`).
- **Cancelación:** Se ejecutó la cancelación del pedido con modal de confirmación nativo. El backend transicionó el pedido a `CANCELADO` y la interfaz actualizó el badge y timeline de inmediato.
- **Resultado:** **PASS**

---

## 3. FLUJO OPERATIVO: COMERCIO (RESTAURANTE / SUCURSAL)

Se autenticó como `comercio@fastgo.com` (Pizzería Nápoles) para gestionar el ciclo de vida completo de un pedido entrante generado por el cliente:

```
LOGIN COMERCIO
  ↓
PANEL DE PEDIDOS (/comercio/pedidos)
  ↓
CONFIRMAR PEDIDO (PENDIENTE → CONFIRMADO)
  ↓
INICIAR PREPARACIÓN (CONFIRMADO → EN_PREPARACION / PREPARANDO)
  ↓
MARCAR LISTO PARA ENTREGA (EN_PREPARACION → LISTO / LISTO_PARA_ENTREGA)
  ↓
REVISIÓN DE SUCURSALES (/comercio/sucursales)
  ↓
REVISIÓN DE PRODUCTOS (/comercio/productos)
```

### Resultados de la Validación Comercio:
- **Visualización de Pedidos Entrantes:** El pedido `#16` apareció de inmediato en la columna de pedidos pendientes con desglose de ítems, hora, cliente y total.
- **Transición de Estados de Cocina:** Se validó la compatibilidad estricta con el enum del backend (`PREPARANDO` y `LISTO`):
  1. Click en *"Confirmar Pedido"* -> Transición a `CONFIRMADO`.
  2. Click en *"Iniciar Preparación"* -> Transición a `PREPARANDO` / `EN_PREPARACION`.
  3. Click en *"Marcar Listo para Entrega"* -> Transición a `LISTO` / `LISTO_PARA_ENTREGA`.
- **Inventario y Sucursales:** Acceso fluido a la lista de productos por categoría y a las sucursales vinculadas, con estado de disponibilidad conmutable.
- **Resultado:** **PASS**

---

## 4. FLUJO LOGÍSTICO: DOMICILIARIO (REPARTIDOR)

Se autenticó como `domiciliario@fastgo.com` para ejecutar la fase de transporte y despacho:

```
LOGIN DOMICILIARIO
  ↓
PANEL DE ENTREGAS (/domiciliario/pedidos)
  ↓
VER POOL DE PEDIDOS DISPONIBLES (Estado LISTO)
  ↓
TOMAR PEDIDO (Asignación Atómica / Prevención IDOR)
  ↓
INICIAR RUTA (LISTO → EN_CAMINO)
  ↓
ENTREGAR PEDIDO (EN_CAMINO → ENTREGADO)
```

### Resultados de la Validación Domiciliario:
- **Pool de Disponibles:** El pedido listo `#16` apareció en la bandeja de pedidos disponibles para reclamar.
- **Toma Atómica:** Al hacer clic en *"Tomar Pedido"*, el backend vinculó al repartidor autenticado impidiendo que otro domiciliario tome la misma orden simultáneamente.
- **Despacho y Entrega Final:**
  1. Click en *"Iniciar Ruta / En Camino"* -> Pedido en estado `EN_CAMINO`.
  2. Click en *"Marcar Entregado"* -> Pedido transicionado a `ENTREGADO`.
- **Confirmación Cliente:** El cliente visualizó su pedido como finalizado con badge verde `ENTREGADO`.
- **Resultado:** **PASS**

---

## 5. FLUJO ADMINISTRATIVO: ADMIN (CONTROL CENTRAL)

Se autenticó como `admin@fastgo.com` para auditar la plataforma global:

```
LOGIN ADMIN
  ↓
DASHBOARD CENTRAL (/admin/dashboard)
  ↓
GESTIÓN DE USUARIOS (/admin/usuarios)
  ↓
GESTIÓN DE CATEGORÍAS (/admin/categorias)
  ↓
SUPERVISIÓN DE COMERCIOS (/admin/comercios)
```

### Resultados de la Validación Admin:
- **Métricas:** Conteo global de pedidos, comercios activos, usuarios registrados y ventas brutas calculadas sin inconsistencias.
- **Supervisión de Usuarios:** Tabla paginada con filtrado por rol (`CLIENTE`, `COMERCIO`, `DOMICILIARIO`, `ADMIN`) y botón para alternar el estado de activación.
- **Categorías:** Lista interactiva de categorías del sistema (Restaurantes, Supermercados, Farmacias, Bebidas, etc.) con formulario para nuevas categorías.
- **Comercios:** Vista integral de todos los comercios afiliados y sus sucursales.
- **Resultado:** **PASS**

---

## 6. SEGURIDAD VISUAL Y CONTROL DE ACCESO (RBAC)

Se validó el cumplimiento estricto de las políticas de autorización tanto a nivel de componentes como de rutas del cliente:

| Prueba de Intrusión / Salto de Rol | URL Solicitada | Comportamiento Observado | Estado |
| :--- | :--- | :--- | :---: |
| **CLIENTE intenta acceder a Admin** | `/admin/dashboard` | Renderiza componente `403 Forbidden` (*"Acceso Denegado: No tienes los privilegios requeridos"*). | **PASS** |
| **COMERCIO intenta acceder a Admin** | `/admin/usuarios` | Renderiza pantalla `403 Forbidden` sin filtrar datos confidenciales. | **PASS** |
| **DOMICILIARIO intenta acceder a Admin** | `/admin/dashboard` | Renderiza pantalla `403 Forbidden` de manera inmediata. | **PASS** |
| **Anónimo intenta acceder a Pedidos** | `/pedidos` | Redirección automática inmediata a `/login?redirect=/pedidos`. | **PASS** |
| **Anónimo intenta acceder a Checkout** | `/checkout` | Redirección inmediata a `/login` preservando el estado del carrito. | **PASS** |

- **Resultado:** **PASS**

---

## 7. AUDITORÍA RESPONSIVA Y MULTI-DISPOSITIVO

Se ejecutaron pruebas visuales automatizadas midiendo el ancho del contenido (`scrollWidth`) frente al ancho del viewport (`clientWidth`) para detectar cualquier desbordamiento horizontal (`horizontal overflow`):

$$\Delta_{\text{overflow}} = \max(0, \text{scrollWidth} - \text{clientWidth})$$

| Viewport | Dispositivo Objetivo | Dimensiones | ScrollWidth | ClientWidth | Overflow | Evaluación |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **360x800_mobile** | Android Compact / Small | 360 x 800 | 360 px | 360 px | **0 px** | **PASS** |
| **390x844_iphone** | iPhone 12 / 13 / 14 / 15 | 390 x 844 | 390 px | 390 px | **0 px** | **PASS** |
| **768x1024_tablet** | iPad Mini / Tablet Vertical | 768 x 1024 | 768 px | 768 px | **0 px** | **PASS** |
| **1024x768_laptop** | iPad Horizontal / Laptop Pequeña | 1024 x 768 | 1024 px | 1024 px | **0 px** | **PASS** |
| **1440x900_desktop**| Desktop HD / MacBook Pro | 1440 x 900 | 1440 px | 1440 px | **0 px** | **PASS** |

### Ajustes Responsivos Destacados:
- **Navbar Responsive:** En viewports `< 640px`, los botones de texto extensos se ocultan del navbar principal y se despliegan limpiamente dentro del menú drawer tipo hamburguesa.
- **Grids Fluidos:** Los catálogos de comercios y productos utilizan `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` evitando desbordamiento lateral.
- **Tablas Adaptadas:** Las tablas de pedidos y usuarios cuentan con contenedores `overflow-x-auto` para visualización táctil sin romper el layout general.
- **Resultado:** **PASS**

---

## 8. EXPERIENCIA DE USUARIO (UX), PAGOS Y MAPAS EN MODO SEGURO

### 8.1 Fallback de Pasarela de Pagos Wompi (`fastgo.wompi.enabled=false`)
- **Comportamiento:** En la pantalla de checkout y detalle del pedido, la interfaz no simula aprobaciones financieras ficticias ni lanza errores crípticos.
- **Disclaimer Visual:** Muestra un banner informativo destacado:
  > *"Modo Seguro / Entorno Local: fastgo.wompi.enabled=false. Las transacciones con pasarela externa están desactivadas temporalmente. El pedido se registra con total autoritativo."*
- **Etiquetado:** Se exhibe *"Total del Pedido"* en lugar de *"Total Pagado"*, garantizando precisión contable.
- **Manejo de Errores de Red:** Al consultar `/api/pagos/wompi/pse/banks`, el backend responde HTTP 400 (esperado por configuración de pasarela deshabilitada); el frontend captura limpiamente el error en bloque `try...catch` sin congelar la interfaz ni mostrar pantallas en blanco.

### 8.2 Fallback de Google Maps (`fastgo.maps.enabled=false`)
- **Comportamiento:** Al consultar el detalle del pedido o la consola del repartidor sin API key activa de Google Maps, el sistema no intenta inyectar scripts remotos inválidos de `maps.googleapis.com`.
- **Visualización Alternativa:** Despliega una tarjeta estructurada de ubicación con:
  - Icono de geolocalización.
  - Dirección física textual normalizada del comercio y del cliente.
  - Coordenadas geográficas autoritativas almacenadas en base de datos.
  - Aviso descriptivo: *"Modo mapa en coordenadas textuales (fastgo.maps.enabled=false)"*.

### 8.3 Métricas de Calidad UX y Errores en Consola
- **Excepciones Críticas de JavaScript:** **0** (Cero `TypeError`, cero `ReferenceError`, cero `Uncaught Exception`, cero caídas de React Fiber).
- **Indicadores de Carga:** Spinners centrados en peticiones asíncronas y skeletons durante la resolución de rutas.
- **Empty States:** Ilustraciones y botones de acción clara en carrito vacío, sin pedidos activos y sin comercios encontrados.
- **Badges de Estado:** Código de color unificado:
  - `PENDIENTE` / `CONFIRMADO`: Amarillo / Ámbar
  - `PREPARANDO` / `EN_CAMINO`: Azul / Celeste
  - `LISTO`: Púrpura / Índigo
  - `ENTREGADO`: Verde esmeralda
  - `CANCELADO`: Rojo carmesí

---

## 9. EVIDENCIAS VISUALES GENERADAS (25 CAPTURAS)

Las capturas de pantalla de alta resolución se encuentran archivadas en `fastgo-frontend/scripts/screenshots/`:

| Archivo de Captura | Fase / Pantalla Auditada | Descripción Visual de la Evidencia |
| :--- | :--- | :--- |
| `01_login_page.png` | Login Unificado | Formulario de login limpio con botones de auto-llenado por rol. |
| `02_home_cliente.png` | Home Cliente | Carrusel de promociones, categorías y lista de comercios aliados. |
| `03_comercio_detail.png` | Detalle Comercio | Encabezado del comercio, selector de sucursal y menú por categorías. |
| `04_product_added.png` | Producto Agregado | Contador del carrito actualizado en navbar y toast de confirmación. |
| `05_carrito.png` | Carrito de Compras | Lista de ítems, selector de cantidad (+/-) y desglose de costos. |
| `06_checkout.png` | Checkout | Selector de direcciones, banner Wompi modo seguro y botón de orden. |
| `07_order_detail.png` | Detalle y Tracking | Pedido creado con barra de estado y tarjeta de ubicación fallback. |
| `08_order_cancelled.png`| Cancelación | Pedido actualizado a estado CANCELADO con badge visual rojo. |
| `09_comercio_dashboard.png` | Dashboard Comercio | KPIs de ventas, pedidos del día y estado de cocina. |
| `10_comercio_pedidos.png` | Pedidos Comercio | Bandeja de órdenes entrantes con botones de transición de estado. |
| `11_comercio_pedido_listo.png` | Pedido Listo | Orden marcada como LISTO para recogida por domiciliario. |
| `12_comercio_productos.png` | Productos Comercio | Catálogo de productos con precios y conmutador de disponibilidad. |
| `13_comercio_sucursales.png` | Sucursales Comercio| Lista de sucursales con direcciones y teléfono de contacto. |
| `14_domiciliario_dashboard.png`| Dashboard Repartidor| Panel con pedidos disponibles para tomar y métricas de entrega. |
| `15_domiciliario_entregas.png` | Pedido Entregado | Pedido culminado exitosamente en estado ENTREGADO. |
| `16_admin_dashboard.png` | Dashboard Admin | Resumen global de la plataforma, comercios, ventas y usuarios. |
| `17_admin_usuarios.png` | Gestión Usuarios | Tabla con filtros de rol, correos y alternador de activación. |
| `18_admin_categorias.png`| Gestión Categorías | Grilla de categorías comerciales con edición y alta. |
| `19_admin_comercios.png` | Gestión Comercios | Monitoreo de comercios afiliados y sus sucursales activas. |
| `20_rbac_cliente_to_admin.png` | Seguridad RBAC | Pantalla 403 Forbidden al intentar acceder a rutas no autorizadas. |
| `responsive_360x800_mobile.png` | Mobile 360x800 | Renderizado sin overflow, navbar con menú hamburguesa colapsado. |
| `responsive_390x844_iphone.png` | iPhone 390x844 | Layout fluido, tarjetas de comercios adaptadas verticalmente. |
| `responsive_768x1024_tablet.png`| Tablet 768x1024 | Vista dos columnas de comercios, navegación adaptada. |
| `responsive_1024x768_laptop.png`| Laptop 1024x768 | Grid completo de comercios y barra lateral de navegación. |
| `responsive_1440x900_desktop.png`| Desktop 1440x900 | Experiencia panorámica de escritorio con máxima densidad de info. |

---

## 10. BUGS ENCONTRADOS Y CORREGIDOS DURANTE LA AUDITORÍA

Durante las rondas de pruebas de aceptación visual e integración en navegador real, se detectaron y corrigieron las siguientes anomalías:

1. **Persistencia y Re-hidratación del Carrito al Recargar:**
   - *Diagnóstico:* Al cambiar de página o refrescar el navegador, `activeBranchId` no se rehidrataba desde `localStorage`, causando que el carrito pareciera vacío antes de sincronizar con el backend.
   - *Solución:* Se actualizó `CartContext.tsx` para almacenar y re-hidratar `fastgo_active_branch_id`, garantizando persistencia del carrito entre recargas y limpiezas al vaciarlo.
2. **Flash de Estado Vacío en Checkout y Carrito:**
   - *Diagnóstico:* Durante la carga asíncrona de la sesión y el carrito, `CartPage.tsx` y `CheckoutPage.tsx` mostraban momentáneamente *"Tu carrito está vacío"* antes de renderizar los ítems.
   - *Solución:* Se incorporó un guard de carga con `Spinner` mientras `isLoading` esté activo.
3. **Import Faltante de Spinner en `CartPage.tsx`:**
   - *Diagnóstico:* La compilación de TypeScript (`npm run build`) reportó `error TS2304: Cannot find name 'Spinner'`.
   - *Solución:* Se agregó el import explícito de `Spinner` desde `../../components/common/Spinner`, logrando compilación limpia con exit code 0.
4. **Compatibilidad de Estados de Cocina del Comercio:**
   - *Diagnóstico:* La máquina de estados del backend utiliza `PREPARANDO` y `LISTO` en sus transiciones principales, mientras algunas rutas de consulta retornaban `EN_PREPARACION` o `LISTO_PARA_ENTREGA`.
   - *Solución:* Se homogeneizó la lógica en `CommerceOrdersPage.tsx` y `DeliveryDashboardPage.tsx` para aceptar ambas variantes en los badges y botones de acción.
5. **Desbordamiento Horizontal Móvil en Navbar:**
   - *Diagnóstico:* En pantallas angostas (360px de ancho), los botones de texto *"Ingresar"* y *"Registrarse"* en el navbar sumaban 444px, generando scroll horizontal indeseado de 84px.
   - *Solución:* Se ocultaron los botones extendidos en `< 640px` y se integraron en el menú drawer desplegable, aplicando `overflow-x: hidden` en el layout raíz. El overflow se redujo exactamente a 0 px en 360x800 y 390x844.
6. **Rutas Alias de RBAC:**
   - *Diagnóstico:* Al ingresar manualmente a rutas convencionales como `/admin`, `/admin/dashboard`, `/admin/usuarios` o `/comercio/dashboard`, el enrutador no resolvía el componente correspondiente.
   - *Solución:* Se configuraron rutas alias en `src/routes/index.tsx` asociando todas las variaciones al guardia de seguridad `ProtectedRoute`.
7. **Salvaguarda de ID Numérico en Detalle de Comercio:**
   - *Diagnóstico:* Si la ruta no había terminado de parsear el parámetro `:id`, se intentaba disparar una petición a `/api/comercios/NaN`.
   - *Solución:* Se agregó un chequeo `if (isNaN(numericId))` en `CommerceDetailPage.tsx` que previene peticiones defectuosas.

---

## 11. TABLA FINAL DE ACEPTACIÓN POR ROL Y CAPACIDAD

| Rol / Módulo | Funcionalidad Evaluada | Resultado | Observaciones |
| :--- | :--- | :---: | :--- |
| **CLIENTE** | Login & Sesión JWT | **PASS** | Auto-completado y persistencia en localStorage |
| **CLIENTE** | Descubrimiento y Búsqueda | **PASS** | Búsqueda por texto y filtrado de comercios |
| **CLIENTE** | Selección de Sucursal & Menú | **PASS** | Carga de productos por categoría y sucursal |
| **CLIENTE** | Carrito de Compras | **PASS** | Modificación de cantidad, cálculo de subtotal |
| **CLIENTE** | Checkout & Direcciones | **PASS** | Selector de direcciones, disclaimer de pasarela |
| **CLIENTE** | Creación y Cancelación Pedido | **PASS** | Transición PENDIENTE -> CANCELADO validada |
| **COMERCIO** | Login & Dashboard | **PASS** | KPIs de ventas y métricas operativas |
| **COMERCIO** | Gestión de Pedidos | **PASS** | Confirmación, preparación y listo para entrega |
| **COMERCIO** | Productos & Sucursales | **PASS** | Visualización de catálogo y locales comerciales |
| **DOMICILIARIO**| Login & Dashboard | **PASS** | Listado de pedidos listos para reclamar |
| **DOMICILIARIO**| Toma Atómica de Pedido | **PASS** | Asignación segura con prevención de colisiones |
| **DOMICILIARIO**| Progresión de Entrega | **PASS** | EN_CAMINO -> ENTREGADO con feedback al cliente |
| **ADMIN** | Login & Panel Central | **PASS** | Métricas consolidadas de la plataforma |
| **ADMIN** | Gestión de Usuarios | **PASS** | Filtro por rol y control de estado de usuarios |
| **ADMIN** | Gestión de Categorías | **PASS** | Visualización y adición de categorías |
| **ADMIN** | Supervisión de Comercios | **PASS** | Inspección de aliados y sus sucursales |
| **SEGURIDAD** | Control de Acceso (RBAC) | **PASS** | Pantallas 403 y redirección a login en rutas protegidas |
| **RESPONSIVE** | Compatibilidad Multi-Pantalla | **PASS** | 0px de overflow en 360px, 390px, 768px, 1024px, 1440px |
| **PAGOS** | Pasarela Wompi en Modo Seguro | **PASS** | Fallback seguro sin transacciones falsas |
| **MAPAS** | Google Maps en Modo Seguro | **PASS** | Fallback textual con coordenadas sin errores de script |
| **CALIDAD** | Suite de Tests Automatizados | **PASS** | 14/14 Unitarios, 22/22 E2E, Build Exit Code 0 |

---

## 12. EVALUACIÓN TÉCNICA GLOBAL

FASTGO Beta 2 cumple plenamente con los criterios de arquitectura, funcionalidad, seguridad, diseño responsivo y resiliencia en integraciones de terceros. La aplicación es totalmente navegable, coherente entre roles y estable en un entorno de producción local.

---

FUNCTIONAL: PASS  
VISUAL: PASS  
RESPONSIVE: PASS  
AUTH: PASS  
CLIENT: PASS  
COMMERCE: PASS  
DELIVERY: PASS  
ADMIN: PASS  
CART: PASS  
ORDERS: PASS  
PAYMENTS: EXTERNAL  
MAPS: EXTERNAL  
BUILD: PASS  
TESTS: PASS  
E2E: PASS  
FINAL STATUS: READY
