-- ====================================================
-- V9: Seguimiento de Pedidos en Tiempo Real (GPS Tracking)
-- ====================================================

CREATE TABLE IF NOT EXISTS seguimiento_pedidos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    domiciliario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    latitud NUMERIC(10, 7) NOT NULL,
    longitud NUMERIC(11, 7) NOT NULL,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_seguimiento_pedido UNIQUE (pedido_id)
);

CREATE INDEX IF NOT EXISTS idx_seguimiento_pedido_domiciliario ON seguimiento_pedidos(domiciliario_id);
