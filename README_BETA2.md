# FastGo Beta 2

Versión preparada para continuar con pruebas de seguridad y, después, frontend.

## Integraciones incorporadas

### Wompi

- Nequi
- Transferencia Bancolombia
- PSE (incluye entidades como Davivienda según disponibilidad del comercio)
- DaviPlata como opción preparada para activación si la cuenta Wompi la tiene habilitada
- Consulta de bancos PSE
- Firma de integridad generada en el servidor
- Validación de webhook mediante SHA-256
- El importe se toma exclusivamente de `pedido.total`

### Google Maps Platform

- Geocodificación de direcciones
- Cálculo de rutas para moto con Routes API
- La clave de servidor nunca se entrega al cliente
- La app móvil queda preparada para usar una clave pública restringida independiente

## Configuración

Usa las variables de entorno documentadas en:

`fastgo-backend/src/main/resources/application-security.properties.example`

Nunca subas a Git las llaves privadas, secretos de integridad, secreto de eventos o la clave de servidor de Google Maps.

## Base de datos

**Esta Beta 2 no añade migraciones nuevas y no cambia tablas/campos respecto a V1/V2.**

La referencia existente `V2__fastgo_security_delivery.sql` se conserva.

## Limitación de esta entrega

Las credenciales reales de Wompi y Google Maps no están incluidas. Por seguridad deben configurarse mediante variables de entorno. La integración está preparada para Sandbox; antes de producción hay que ejecutar pruebas reales en Sandbox, configurar el webhook HTTPS de Wompi y aplicar restricciones de API keys.
