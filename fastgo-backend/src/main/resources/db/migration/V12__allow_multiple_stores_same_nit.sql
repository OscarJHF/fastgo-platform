-- V12__allow_multiple_stores_same_nit.sql
-- Eliminar la restriccion global UNIQUE en NIT de comercios para habilitar el modelo multitienda oficial de FASTGO
ALTER TABLE comercios DROP CONSTRAINT IF EXISTS comercios_nit_key;

-- Garantizar unicidad de nombre de tienda por usuario comerciante
DROP INDEX IF EXISTS idx_comercios_usuario_nombre_unique;
CREATE UNIQUE INDEX idx_comercios_usuario_nombre_unique ON comercios (usuario_id, LOWER(TRIM(nombre)));
