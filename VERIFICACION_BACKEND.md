# Verificación del backend FastGo

## Correcciones aplicadas

- Restaurado `Usuario.java` con todos sus getters/setters y sin dependencia necesaria de Lombok.
- Eliminadas declaraciones y métodos duplicados de `domiciliarioId` en `Pedido.java`.
- Movida `DetallePedido.java` a `com/fastgo/entity` para que la ruta coincida con su package.
- Eliminado el `PagoRepository.java` duplicado que estaba en `com/fastgo` raíz.
- Restaurado `PagoRepository.java` en `com/fastgo/repository`.
- Eliminados métodos duplicados de `PedidoService`.
- Corregido el flujo de pedidos para validar propietario, comercio y domiciliario.
- Mantenida compatibilidad con `/api/pedidos/usuario/{usuarioId}`.
- Corregida actualización de productos para no borrar la sucursal cuando `sucursalId` no llega.
- Protegida la salida de `Usuario.password` y `Comercio.usuario` frente a serialización accidental.
- Mantenida la protección por propietario en comercios, direcciones, productos y pagos.
- Mejorada la migración Flyway V2 para roles, propietario de comercio, domiciliarios e índices.

## Validaciones realizadas en este entorno

1. Revisión estructural de 65 archivos Java.
2. Comprobación de packages y clases internas.
3. Comprobación de imports internos sin referencias inexistentes.
4. Comprobación de métodos duplicados en los archivos Java: 0 encontrados después de las correcciones.
5. Comprobación específica de `Pedido.java`: un solo `domiciliarioId`.
6. Comprobación de ubicación de `DetallePedido.java`: ahora coincide con `com.fastgo.entity.DetallePedido`.
7. Comprobación de la separación única de `PagoRepository`.

## Limitación de ejecución

No fue posible ejecutar Maven completo dentro de este entorno porque el wrapper necesita descargar Maven/dependencias externas y la red del entorno no permitió esa descarga.

Por tanto, no se declara un `BUILD SUCCESS` ejecutado en este entorno. El proyecto quedó preparado para que se ejecute en Windows con:

```powershell
.\mvnw.cmd clean package -DskipTests
```

y luego:

```powershell
.\mvnw.cmd spring-boot:run
```

