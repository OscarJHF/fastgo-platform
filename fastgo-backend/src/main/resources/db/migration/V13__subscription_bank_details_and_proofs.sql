-- ============================================================
-- FASTGO: MIGRACIÓN V13
-- 1. Datos bancarios oficiales de FASTGO para cobro de suscripciones/activaciones
-- 2. Campos de comprobante, motivo de rechazo y revisión en suscripciones
-- ============================================================

-- 1. Extender configuracion_suscripciones con cuentas bancarias oficiales de recaudo
ALTER TABLE configuracion_suscripciones ADD COLUMN IF NOT EXISTS banco_nombre VARCHAR(100) DEFAULT 'Bancolombia';
ALTER TABLE configuracion_suscripciones ADD COLUMN IF NOT EXISTS banco_tipo_cuenta VARCHAR(50) DEFAULT 'Ahorros';
ALTER TABLE configuracion_suscripciones ADD COLUMN IF NOT EXISTS banco_numero_cuenta VARCHAR(50) DEFAULT '123-456789-00';
ALTER TABLE configuracion_suscripciones ADD COLUMN IF NOT EXISTS banco_titular VARCHAR(150) DEFAULT 'FastGo S.A.S.';
ALTER TABLE configuracion_suscripciones ADD COLUMN IF NOT EXISTS banco_documento VARCHAR(50) DEFAULT 'NIT 901.888.777-1';
ALTER TABLE configuracion_suscripciones ADD COLUMN IF NOT EXISTS instrucciones_pago TEXT DEFAULT 'Realiza la transferencia desde Bancolombia o Nequi y adjunta el comprobante para la verificación administrativa.';

-- Actualizar registro existente si id = 1
UPDATE configuracion_suscripciones
SET banco_nombre = COALESCE(banco_nombre, 'Bancolombia'),
    banco_tipo_cuenta = COALESCE(banco_tipo_cuenta, 'Ahorros'),
    banco_numero_cuenta = COALESCE(banco_numero_cuenta, '123-456789-00'),
    banco_titular = COALESCE(banco_titular, 'FastGo S.A.S.'),
    banco_documento = COALESCE(banco_documento, 'NIT 901.888.777-1'),
    instrucciones_pago = COALESCE(instrucciones_pago, 'Realiza la transferencia desde Bancolombia o Nequi y adjunta el comprobante para la verificación administrativa.')
WHERE id = 1;

-- 2. Extender suscripciones con comprobante privado y trazabilidad de revisión
ALTER TABLE suscripciones ADD COLUMN IF NOT EXISTS comprobante_url VARCHAR(500);
ALTER TABLE suscripciones ADD COLUMN IF NOT EXISTS comprobante_key VARCHAR(500);
ALTER TABLE suscripciones ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT;
ALTER TABLE suscripciones ADD COLUMN IF NOT EXISTS revisado_por VARCHAR(100);
ALTER TABLE suscripciones ADD COLUMN IF NOT EXISTS revisado_en TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_suscripciones_estado ON suscripciones(estado);
