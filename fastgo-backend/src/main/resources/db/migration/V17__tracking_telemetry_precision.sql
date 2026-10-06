-- ====================================================
-- V17: Telemetría GPS Extendida (Precisión, Rumbo y Velocidad)
-- ====================================================

ALTER TABLE seguimiento_pedidos ADD COLUMN IF NOT EXISTS precision NUMERIC(10, 2);
ALTER TABLE seguimiento_pedidos ADD COLUMN IF NOT EXISTS rumbo NUMERIC(10, 2);
ALTER TABLE seguimiento_pedidos ADD COLUMN IF NOT EXISTS velocidad NUMERIC(10, 2);
