-- ====================================================
-- V18: Preservación Histórica de Nombres de Productos en Pedidos
-- ====================================================

ALTER TABLE detalle_pedido ADD COLUMN IF NOT EXISTS producto_nombre VARCHAR(150);

-- Backfill histórico para pedidos existentes a partir del catálogo actual
UPDATE detalle_pedido dp
SET producto_nombre = p.nombre
FROM productos p
WHERE dp.producto_id = p.id
  AND (dp.producto_nombre IS NULL OR dp.producto_nombre = '');
