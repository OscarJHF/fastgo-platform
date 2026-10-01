-- ============================================================
-- FASTGO: MIGRACIÓN V8
-- 1. Tarifa de domicilio por comercio (mínimo $2.000 COP)
-- 2. Configuración de Bancolombia como método de pago en comercios
-- 3. Estado de pago y comprobante de pago en pedidos
-- ============================================================

-- 1) Nuevas columnas en tabla comercios
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS tarifa_domicilio NUMERIC(12,2) DEFAULT 2000.00;
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS bancolombia_activo BOOLEAN DEFAULT FALSE;
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS bancolombia_tipo_cuenta VARCHAR(20);
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS bancolombia_numero_cuenta VARCHAR(50);
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS bancolombia_titular VARCHAR(150);
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS bancolombia_doc_titular VARCHAR(50);

-- Actualizar comercios existentes con valores por defecto
UPDATE comercios SET tarifa_domicilio = 2000.00 WHERE tarifa_domicilio IS NULL OR tarifa_domicilio < 2000.00;
UPDATE comercios SET bancolombia_activo = FALSE WHERE bancolombia_activo IS NULL;

-- Asegurar constraint de tarifa mínima $2.000 COP
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_comercios_tarifa_minima'
    ) THEN
        ALTER TABLE comercios
            ADD CONSTRAINT chk_comercios_tarifa_minima
            CHECK (tarifa_domicilio >= 2000.00);
    END IF;
END $$;

-- 2) Nuevas columnas en tabla pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(30) DEFAULT 'APROBADO';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS comprobante_pago_url VARCHAR(500);

-- Actualizar pedidos existentes con estado de pago APROBADO si es nulo
UPDATE pedidos SET estado_pago = 'APROBADO' WHERE estado_pago IS NULL;
