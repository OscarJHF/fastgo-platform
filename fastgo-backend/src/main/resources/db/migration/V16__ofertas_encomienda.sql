-- ============================================================
-- FASTGO: MIGRACIÓN V16
-- Sistema de Ofertas Negociables para Encomiendas Urbanas (Fase J)
-- ============================================================

-- 1. Tabla de Ofertas de Encomienda
CREATE TABLE IF NOT EXISTS ofertas_encomienda (
    id SERIAL PRIMARY KEY,
    encomienda_id INTEGER NOT NULL REFERENCES encomiendas(id) ON DELETE CASCADE,
    domiciliario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    valor DECIMAL(12,2) NOT NULL,
    mensaje VARCHAR(255),
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, ACEPTADA, RECHAZADA, CANCELADA
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Índice único parcial: un domiciliario solo puede tener una oferta PENDIENTE activa a la vez por encomienda
CREATE UNIQUE INDEX IF NOT EXISTS uq_encomienda_domi_activa
ON ofertas_encomienda (encomienda_id, domiciliario_id)
WHERE estado = 'PENDIENTE';

-- 3. Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_ofertas_encomienda_id ON ofertas_encomienda(encomienda_id);
CREATE INDEX IF NOT EXISTS idx_ofertas_domiciliario_id ON ofertas_encomienda(domiciliario_id);
CREATE INDEX IF NOT EXISTS idx_ofertas_estado ON ofertas_encomienda(estado);

-- 4. Campo de valor inicial propuesto por el remitente en encomiendas
ALTER TABLE encomiendas ADD COLUMN IF NOT EXISTS valor_inicial DECIMAL(12,2);
UPDATE encomiendas SET valor_inicial = costo_envio WHERE valor_inicial IS NULL;
