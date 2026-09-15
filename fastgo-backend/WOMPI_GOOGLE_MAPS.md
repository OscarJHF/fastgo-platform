# FASTGO — Integraciones de pagos y mapas

## Pagos

La integración se concentra en Wompi. El backend calcula siempre el monto a partir del pedido y genera la firma de integridad; el cliente no puede escoger el monto.

Métodos previstos:

- `NEQUI`: celular de 10 dígitos.
- `BANCOLOMBIA_TRANSFER`: transferencia Bancolombia.
- `PSE`: el cliente elige su entidad financiera. Davivienda se utiliza por PSE cuando esté disponible en el listado del comercio.
- `DAVIPLATA`: disponible cuando Wompi lo tenga habilitado para la cuenta.

El backend no guarda números de tarjeta. Las llaves privadas y secretos permanecen en variables de entorno.

Endpoints:

- `GET /api/pagos/wompi/acceptance`
- `GET /api/pagos/wompi/pse/banks`
- `POST /api/pagos/wompi/transactions`
- `GET /api/pagos/wompi/transactions/{transactionId}`
- `POST /api/pagos/wompi/webhook`

Antes de producción se debe registrar el webhook HTTPS en Wompi y configurar `FASTGO_WOMPI_EVENTS_SECRET`.

## Google Maps

Se preparó integración para:

- geocodificar direcciones;
- calcular rutas de entrega para motocicleta;
- exponer configuración para el cliente móvil.

Endpoints:

- `GET /api/maps/config`
- `POST /api/maps/geocode`
- `POST /api/maps/route`

Variables:

- `FASTGO_MAPS_ENABLED=true`
- `FASTGO_MAPS_SERVER_KEY=...`

En producción se recomienda restringir las llaves por API/plataforma y mantener una llave de servidor distinta de la llave del cliente móvil.
