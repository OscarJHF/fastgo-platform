-- ============================================================
-- FASTGO: MIGRACIÓN V10
-- 1. Soporte Multitiendas por usuario (Eliminación de uq_comercios_usuario_id)
-- 2. Columnas es_principal y estado en comercios
-- 3. Tabla de suscripciones persistentes
-- 4. Tabla de configuración global de suscripciones
-- 5. Tabla de auditoría administrativa
-- ============================================================

-- 1) Permitir múltiples comercios por usuario eliminando el índice único
DROP INDEX IF EXISTS uq_comercios_usuario_id;

-- 2) Extender comercios con indicador de tienda principal y estado comercial
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS es_principal BOOLEAN DEFAULT FALSE;
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS estado VARCHAR(30) DEFAULT 'ACTIVA';

-- Actualizar tiendas existentes como principales y activas
UPDATE comercios 
SET es_principal = TRUE, estado = 'ACTIVA' 
WHERE es_principal IS NULL OR es_principal = FALSE;

-- 3) Tabla de Suscripciones
CREATE TABLE IF NOT EXISTS suscripciones (
    id SERIAL PRIMARY KEY,
    comercio_id INTEGER NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_plan VARCHAR(40) NOT NULL,
    estado VARCHAR(40) NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP,
    monto NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    periodo VARCHAR(30) NOT NULL DEFAULT 'MENSUAL',
    fecha_pago TIMESTAMP,
    referencia_pago VARCHAR(100),
    creado_por VARCHAR(100),
    actualizado_por VARCHAR(100),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suscripciones_comercio_id ON suscripciones(comercio_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_usuario_id ON suscripciones(usuario_id);

-- Backfill: Registrar suscripción gratuita inicial de 6 meses para comercios existentes
INSERT INTO suscripciones (comercio_id, usuario_id, tipo_plan, estado, fecha_inicio, fecha_fin, monto, periodo, creado_por)
SELECT 
    c.id, 
    c.usuario_id, 
    'TIENDA_PRINCIPAL', 
    'GRATUITO', 
    COALESCE(c.creado_en, CURRENT_TIMESTAMP), 
    COALESCE(c.creado_en, CURRENT_TIMESTAMP) + INTERVAL '6 months', 
    0.00, 
    'GRATUITO', 
    'MIGRACION_V10'
FROM comercios c
WHERE c.usuario_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM suscripciones s WHERE s.comercio_id = c.id);

-- 4) Tabla de Configuración Global de Suscripciones
CREATE TABLE IF NOT EXISTS configuracion_suscripciones (
    id SERIAL PRIMARY KEY,
    free_primary_stores INTEGER NOT NULL DEFAULT 1,
    primary_free_period_months INTEGER NOT NULL DEFAULT 6,
    primary_monthly_price NUMERIC(12,2) NOT NULL DEFAULT 20000.00,
    additional_store_activation_price NUMERIC(12,2) NOT NULL DEFAULT 50000.00,
    additional_store_monthly_price NUMERIC(12,2) NOT NULL DEFAULT 30000.00,
    allow_new_stores BOOLEAN NOT NULL DEFAULT TRUE,
    actualizado_por VARCHAR(100),
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed de configuración inicial por defecto
INSERT INTO configuracion_suscripciones (
    id, free_primary_stores, primary_free_period_months, primary_monthly_price,
    additional_store_activation_price, additional_store_monthly_price, allow_new_stores, actualizado_por
)
SELECT 1, 1, 6, 20000.00, 50000.00, 30000.00, TRUE, 'SISTEMA'
WHERE NOT EXISTS (SELECT 1 FROM configuracion_suscripciones WHERE id = 1);

-- 5) Tabla de Auditoría Administrativa
CREATE TABLE IF NOT EXISTS auditoria_admin (
    id SERIAL PRIMARY KEY,
    admin_correo VARCHAR(150) NOT NULL,
    accion VARCHAR(80) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    entidad_id VARCHAR(50),
    valor_anterior TEXT,
    valor_nuevo TEXT,
    detalles TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auditoria_admin_fecha ON auditoria_admin(fecha DESC);
