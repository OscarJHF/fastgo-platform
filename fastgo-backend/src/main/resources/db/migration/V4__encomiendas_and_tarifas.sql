-- ============================================================
-- FASTGO: MIGRACIÓN V4
-- 1. Regla de una cuenta por rol: UNIQUE(correo, rol_id)
-- 2. Tabla de Encomiendas para envíos y mensajería
-- 3. Campos de distancia y aceptación de tarifa en pedidos
-- ============================================================

-- 1) Permitir múltiples cuentas por correo siempre que tengan roles diferentes
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_correo_key;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS uq_usuarios_correo;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_usuarios_correo_rol'
    ) THEN
        ALTER TABLE usuarios
            ADD CONSTRAINT uq_usuarios_correo_rol
            UNIQUE (correo, rol_id);
    END IF;
END $$;

-- 2) Tabla de Encomiendas
CREATE TABLE IF NOT EXISTS encomiendas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    remitente_nombre VARCHAR(100) NOT NULL,
    remitente_telefono VARCHAR(20) NOT NULL,
    direccion_origen VARCHAR(255) NOT NULL,
    origen_lat DECIMAL(10,8),
    origen_lng DECIMAL(11,8),
    destinatario_nombre VARCHAR(100) NOT NULL,
    destinatario_telefono VARCHAR(20) NOT NULL,
    direccion_destino VARCHAR(255) NOT NULL,
    destino_lat DECIMAL(10,8),
    destino_lng DECIMAL(11,8),
    descripcion VARCHAR(255) NOT NULL,
    tamano_peso VARCHAR(50),
    distancia_km DECIMAL(6,2) NOT NULL,
    costo_envio DECIMAL(12,2) NOT NULL,
    tarifa_aceptada BOOLEAN DEFAULT TRUE,
    domiciliario_id INTEGER,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    observaciones TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_encomiendas_cliente FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_encomiendas_domiciliario FOREIGN KEY (domiciliario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_encomiendas_cliente ON encomiendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_encomiendas_domiciliario ON encomiendas(domiciliario_id);
CREATE INDEX IF NOT EXISTS idx_encomiendas_estado ON encomiendas(estado);

-- 3) Campos en tabla pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS distancia_km DECIMAL(6,2);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tarifa_aceptada BOOLEAN DEFAULT TRUE;
