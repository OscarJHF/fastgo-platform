# FastGo Backend — endurecimiento de seguridad

Esta versión fortalece el backend antes de iniciar el frontend.

## Cambios aplicados

- Registro público convertido a DTO de entrada: el cliente no puede enviar `rol`, `estado` ni otros campos sensibles.
- Contraseña validada y almacenada con BCrypt cost 12.
- Login normalizado y respuesta de credenciales inválidas con HTTP 401.
- JWT validado criptográficamente en cada petición.
- La identidad, estado y rol se vuelven a comprobar contra la base de datos en cada petición; un token viejo no conserva privilegios después de desactivar o cambiar el rol de un usuario.
- `GET /api/usuarios` queda restringido a ADMIN.
- CORS deja de ser `*` y es configurable por variable de entorno.
- Se eliminó `@CrossOrigin("*")` de los controladores.
- Cabeceras de seguridad: X-Content-Type-Options, frame-ancestors/deny y HSTS.
- Respuestas 401/403 consistentes.
- Validación de parámetros de entrada en operaciones principales.
- Límite de cantidad por operación del carrito.
- El costo de envío enviado por el cliente ya no determina el cobro: temporalmente el backend utiliza 0 hasta implementar un cálculo de tarifa del servidor.
- Asignación de pedidos a domiciliarios realizada mediante actualización condicional para evitar una carrera entre dos domiciliarios.
- Mensajes de error internos de Spring no se exponen mediante `server.error.*`.

## Base de datos

**No se agregó ninguna migración nueva y no se modificó el esquema de PostgreSQL en esta versión.**
Las migraciones `V1` y `V2` se conservan.

## Importante antes de ejecutar

Configura `FASTGO_JWT_SECRET` con un secreto aleatorio de al menos 32 caracteres. El valor de desarrollo incluido en `application.properties` está deliberadamente marcado como inválido para impedir arrancar con la clave por defecto.

## Alcance

Esta es una etapa de endurecimiento del backend. No se considera una auditoría de seguridad de producción completa hasta ejecutar pruebas integrales con Postman y, posteriormente, pruebas de penetración controladas, rate limiting, gestión de secretos, HTTPS real, observabilidad y controles específicos del proveedor de pagos.
