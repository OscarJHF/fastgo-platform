-- ==============================================================================
-- FASTGO - MIGRACIÓN V15: REGISTRO DE DISPOSITIVOS Y TOKENS PUSH
-- ==============================================================================

CREATE TABLE IF NOT EXISTS dispositivos_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    dispositivo_id VARCHAR(100),
    plataforma VARCHAR(20) NOT NULL, -- 'ANDROID', 'WEB', 'IOS'
    push_token VARCHAR(500) NOT NULL,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuario_push_token UNIQUE (usuario_id, push_token)
);

CREATE INDEX IF NOT EXISTS idx_dispositivos_usuario_id ON dispositivos_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_dispositivos_push_token ON dispositivos_usuario(push_token);
CREATE INDEX IF NOT EXISTS idx_dispositivos_activo ON dispositivos_usuario(activo) WHERE activo = TRUE;
