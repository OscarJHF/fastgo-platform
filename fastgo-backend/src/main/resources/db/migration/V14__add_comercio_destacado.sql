-- Migracion V14: Tiendas Destacadas en Banner Principal de FastGo
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_comercios_destacado ON comercios (destacado) WHERE destacado = TRUE;

