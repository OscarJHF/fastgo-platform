# Base de datos - FastGo

## Cambios requeridos

El backend utiliza:

- `usuarios.rol_id`
- `comercios.usuario_id`
- `pedidos.domiciliario_id`

La migración Flyway está en:

`fastgo-backend/src/main/resources/db/migration/V2__fastgo_security_delivery.sql`

Para una base ya existente, **no ejecutes al mismo tiempo** el SQL manual y la migración Flyway. Con Flyway habilitado, deja que la aplicación gestione la migración.

Antes de ejecutar el backend contra una base existente, comprueba:

```sql
SELECT id, nombre, correo, rol_id
FROM usuarios
ORDER BY id;

SELECT id, nombre, correo, usuario_id
FROM comercios
ORDER BY id;

SELECT id, usuario_id, sucursal_id
FROM carritos
ORDER BY id;

SELECT id, usuario_id, sucursal_id, estado, domiciliario_id
FROM pedidos
ORDER BY id;
```

Para el estado actual que se estaba usando en desarrollo, el comercio existente estaba asociado al usuario de `comercio@fastgo.com`.

La migración también crea los índices necesarios y la unicidad de una dirección principal por usuario.
