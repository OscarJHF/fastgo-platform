-- FastGo - cambios adicionales requeridos por el backend completo.
-- Para una base existente: ejecutar este archivo una sola vez.

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol_id INTEGER;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_rol') THEN
        ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id);
    END IF;
END $$;

ALTER TABLE comercios ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_comercios_usuario') THEN
        ALTER TABLE comercios ADD CONSTRAINT fk_comercios_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;
    END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS uq_comercios_usuario_id ON comercios(usuario_id) WHERE usuario_id IS NOT NULL;

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS domiciliario_id INTEGER;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pedidos_domiciliario') THEN
        ALTER TABLE pedidos ADD CONSTRAINT fk_pedidos_domiciliario FOREIGN KEY (domiciliario_id) REFERENCES usuarios(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pedidos_domiciliario_id ON pedidos(domiciliario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_productos_sucursal_id ON productos(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_carritos_usuario_sucursal ON carritos(usuario_id, sucursal_id);

INSERT INTO roles (nombre)
VALUES ('CLIENTE')
ON CONFLICT (nombre) DO NOTHING;
INSERT INTO roles (nombre)
VALUES ('COMERCIO')
ON CONFLICT (nombre) DO NOTHING;
INSERT INTO roles (nombre)
VALUES ('DOMICILIARIO')
ON CONFLICT (nombre) DO NOTHING;
