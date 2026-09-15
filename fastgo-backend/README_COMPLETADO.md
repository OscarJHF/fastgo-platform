# FastGo Backend - versión completada

Esta versión parte del backend entregado en `FastGo.zip` y conserva la arquitectura existente.

## Cambios principales

- Seguridad JWT simplificada y sin logs de tokens.
- JWT secret movido a `application.properties` mediante variable de entorno.
- Registro público fuerza el rol CLIENTE y nunca devuelve la contraseña.
- Comercio: propietario autenticado obligatorio para crear/editar/eliminar.
- Comercio: respuestas mediante DTO, sin exponer Usuario ni password.
- Categorías de comercio: consulta pública para usuarios autenticados.
- Sucursales: CRUD del comercio propietario.
- Productos: CRUD del comercio propietario mediante la sucursal.
- Carrito: siempre pertenece al usuario autenticado; un producto debe pertenecer a la sucursal del carrito.
- Pedidos: validación de propietario de cliente, comercio y domiciliario.
- Estados de pedido: PENDIENTE -> CONFIRMADO -> PREPARANDO -> LISTO -> EN_CAMINO -> ENTREGADO.
- Cancelación: solamente el cliente propietario y mientras esté PENDIENTE.
- Domiciliarios: toman pedidos LISTOS y solo pueden entregar pedidos asignados a ellos.
- Pagos: propietario del pedido puede consultar; el comercio propietario puede confirmar.
- Manejador global de errores JSON.
- Flyway configurado para aplicar la migración V2 sobre la base existente.

## Base de datos

Para una base ya existente, revisar y ejecutar:

`database/schema/002_backend_completo.sql`

La aplicación también contiene la migración Flyway:

`fastgo-backend/src/main/resources/db/migration/V2__fastgo_security_delivery.sql`

No se debe ejecutar ambos mecanismos de migración sobre la misma base si Flyway ya está habilitado y aplicando V2.

## Variables opcionales

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `FASTGO_JWT_SECRET`
- `FASTGO_JWT_EXPIRATION_MS`
- `SERVER_PORT`

Si no se definen, se usan valores de desarrollo en `application.properties`.

## Importante

Los tokens JWT generados antes de esta versión pueden dejar de ser válidos si cambia `FASTGO_JWT_SECRET`. Después de iniciar el backend, hacer login nuevamente y usar el nuevo token en Postman.
