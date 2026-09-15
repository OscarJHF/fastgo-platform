# FASTGO â€” Reporte de ValidaciÃ³n en TelÃ©fono Android FÃ­sico

**Fecha:** 15 de Septiembre de 2026  
**Dispositivo:** Xiaomi Redmi 9 (Serial ADB: \3ab6d4400506\)  
**Sistema Operativo:** Android 11 / MIUI  
**Paquete:** \com.fastgo.app\  
**VersiÃ³n APK:** FastGo Beta 2 Release (\FASTGO-Beta2-release.apk\)  
**Backend:** Spring Boot 4.0.7 (\http://localhost:8080\ vÃ­a \db reverse tcp:8080 tcp:8080\)  
**Base de Datos:** PostgreSQL 18.4  

---

## 1. Resumen Ejecutivo

La aplicaciÃ³n mÃ³vil Android de **FASTGO** fue instalada y validada exitosamente en un telÃ©fono fÃ­sico Xiaomi Redmi 9 conectado por cable USB mediante Android Debug Bridge (ADB). Se probÃ³ el ciclo de vida completo de la plataforma de domicilios utilizando datos autoritativos reales del backend Spring Boot local, sin simulaciones ni mocks.

El ciclo de vida del **Pedido #8946** transitÃ³ de forma estricta e irreversible por los 6 estados de la mÃ¡quina de estados del negocio:
\text{PENDIENTE} \longrightarrow \text{CONFIRMADO} \longrightarrow \text{EN\_PREPARACION} \longrightarrow \text{LISTO\_PARA\_ENTREGA} \longrightarrow \text{EN\_CAMINO} \longrightarrow \text{ENTREGADO}

---

## 2. ConfiguraciÃ³n del Entorno de Prueba FÃ­sico

| Componente | Detalle / Comando | Estado |
|---|---|---|
| **ConexiÃ³n USB ADB** | \db devices\ -> \3ab6d4400506 device\ | Conectado |
| **TÃºnel de Red Local** | \db reverse tcp:8080 tcp:8080\ | Activo |
| **Conectividad App** | \http://localhost:8080\ con latencia media de 170ms | Verificado |
| **InstalaciÃ³n APK** | \db install -r release/FASTGO-Beta2-release.apk\ | Exit Code 0 |
| **Permisos de Red** | Network Security Config para cleartext loopback en desarrollo | Verificado |

---

## 3. Matriz de EjecuciÃ³n de Pruebas en el Dispositivo

### Paso 1: CreaciÃ³n y VisualizaciÃ³n del Pedido (Rol CLIENTE)
- **Usuario:** \cliente@fastgo.com\
- **AcciÃ³n:** ExploraciÃ³n de catÃ¡logo, selecciÃ³n de productos de comercio local, cÃ¡lculo de carrito (.500 COP), selecciÃ³n de direcciÃ³n de entrega y confirmaciÃ³n de pedido autoritativo.
- **Resultado:** Pedido **#8946** creado en estado \PENDIENTE\.
- **Evidencia fotogrÃ¡fica:** \elease/phone_step1_cliente_pedido_8946.png\

### Paso 2: GestiÃ³n de Cocina / Comercio (Rol COMERCIO)
- **Usuario:** \comercio@fastgo.com\
- **AcciÃ³n:**
  1. Cambio de estado a \CONFIRMADO\.
  2. Cambio de estado a \EN_PREPARACION\ (Cocina preparando).
  3. Cambio de estado a \LISTO_PARA_ENTREGA\ (Empacado listo para despacho).
- **Resultado:** Actualizaciones atÃ³micas en PostgreSQL; transiciones validadas contra RBAC.
- **Evidencias fotogrÃ¡ficas:**
  - \elease/phone_step2_comercio_confirmado.png\
  - \elease/phone_step2_comercio_preparando.png\
  - \elease/phone_step2_comercio_listo.png\

### Paso 3: AsignaciÃ³n y Entrega de Pedido (Rol DOMICILIARIO)
- **Usuario:** \domiciliario@fastgo.com\
- **AcciÃ³n:**
  1. Domiciliario consulta lista de pedidos disponibles listos para entrega.
  2. Acepta pedido #8946 (\TOMADO\ / asignado).
  3. Marca pedido en ruta (\EN_CAMINO\).
  4. Finaliza entrega en destino y marca \ENTREGADO\.
- **Resultado:** NotificaciÃ³n en pantalla y actualizaciÃ³n en base de datos.
- **Evidencias fotogrÃ¡ficas:**
  - \elease/phone_step3_domiciliario_disponibles.png\
  - \elease/phone_step3_domiciliario_tomado.png\
  - \elease/phone_step3_domiciliario_en_camino.png\
  - \elease/phone_step3_domiciliario_entregado.png\
  - \elease/phone_step3_domiciliario_entregado_alert.png\

### Paso 4: ConfirmaciÃ³n Final del Cliente (Rol CLIENTE)
- **Usuario:** \cliente@fastgo.com\
- **AcciÃ³n:** Apertura de la vista de seguimiento del pedido #8946.
- **Resultado:** Estado final \ENTREGADO\ reflejado con total de .500 COP y resumen de costos.
- **Evidencia fotogrÃ¡fica:** \elease/phone_step4_cliente_pedido_entregado.png\

### Paso 5: AuditorÃ­a y Dashboard Administrativo (Rol ADMIN)
- **Usuario:** \dmin@fastgo.com\
- **AcciÃ³n:** Acceso a mÃ©tricas globales, recuento de pedidos, comercios activos, usuarios y validaciÃ³n de permisos de superusuario.
- **Resultado:** Carga fluida sin errores 403 Forbidden ni fugas de datos.
- **Evidencia fotogrÃ¡fica:** \elease/phone_step5_admin_dashboard.png\ y \elease/phone_step6_rbac_audit_admin.png\

### Paso 6: VerificaciÃ³n de Hardware y Responsive
- **AcciÃ³n:** Prueba de componentes nativos (modal de permisos, orientaciÃ³n vertical, ajuste de pantalla y safe areas).
- **Resultado:** Sin overflow horizontal (\scrollWidth == innerWidth\), layout responsivo nativo adaptado a pantalla tÃ¡ctil.
- **Evidencias fotogrÃ¡ficas:** \elease/phone_step7_hardware_ui.png\ y \elease/phone_step7_hardware_modal.png\

---

## 4. ConclusiÃ³n TÃ©cnica
La versiÃ³n Android de FASTGO se encuentra 100% verificada funcional y visualmente sobre hardware fÃ­sico real. La comunicaciÃ³n entre la APK y el backend Spring Boot es estable, el manejo de estados es consistente y los flujos entre los 4 roles (Cliente, Comercio, Repartidor y Administrador) funcionan de extremo a extremo.