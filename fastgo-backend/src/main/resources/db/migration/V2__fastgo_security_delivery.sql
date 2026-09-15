-- FastGo: ajustes para propiedad de comercios, roles y asignación de domiciliarios.
-- Esta migración es segura para una base existente y compatible con el esquema 001.

-- 1) Roles: asegurar que existan antes de usar sus IDs.
INSERT INTO roles (nombre, descripcion)
VALUES ('CLIENTE', 'Usuario que realiza pedidos')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO roles (nombre, descripcion)
VALUES ('COMERCIO', 'Negocio registrado en FastGo')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO roles (nombre, descripcion)
VALUES ('DOMICILIARIO', 'Usuario que entrega pedidos')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO roles (nombre, descripcion)
VALUES ('ADMIN', 'Administrador del sistema')
ON CONFLICT (nombre) DO NOTHING;

-- 2) Relación directa usuario -> rol.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_usuarios_rol'
    ) THEN
        ALTER TABLE usuarios
            ADD CONSTRAINT fk_usuarios_rol
            FOREIGN KEY (rol_id)
            REFERENCES roles(id);
    END IF;
END $$;

-- Si la base antigua usa usuarios_roles, copiar roles cuando el usuario
-- tiene un único rol definido allí.
UPDATE usuarios u
SET rol_id = ur.rol_id
FROM (
    SELECT usuario_id, MIN(rol_id) AS rol_id
    FROM usuarios_roles
    GROUP BY usuario_id
    HAVING MIN(rol_id) = MAX(rol_id)
) ur
WHERE u.id = ur.usuario_id
  AND u.rol_id IS NULL;

-- 3) Propietario del comercio.
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS usuario_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_comercios_usuario'
    ) THEN
        ALTER TABLE comercios
            ADD CONSTRAINT fk_comercios_usuario
            FOREIGN KEY (usuario_id)
            REFERENCES usuarios(id)
            ON DELETE CASCADE;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_comercios_usuario_id
    ON comercios(usuario_id)
    WHERE usuario_id IS NOT NULL;

-- Para instalaciones de desarrollo existentes:
-- si solo existe un usuario COMERCIO y solo existe un comercio sin propietario,
-- asociarlos automáticamente.
DO $$
DECLARE
    comercio_sin_propietario INTEGER;
    usuario_comercio INTEGER;
BEGIN
    SELECT c.id
    INTO comercio_sin_propietario
    FROM comercios c
    WHERE c.usuario_id IS NULL
    ORDER BY c.id
    LIMIT 1;

    SELECT u.id
    INTO usuario_comercio
    FROM usuarios u
    JOIN roles r ON r.id = u.rol_id
    WHERE UPPER(r.nombre) = 'COMERCIO'
    ORDER BY u.id
    LIMIT 1;

    IF comercio_sin_propietario IS NOT NULL
       AND usuario_comercio IS NOT NULL
       AND (SELECT COUNT(*) FROM comercios WHERE usuario_id IS NULL) = 1
       AND (SELECT COUNT(*)
            FROM usuarios u2
            JOIN roles r2 ON r2.id = u2.rol_id
            WHERE UPPER(r2.nombre) = 'COMERCIO') = 1
    THEN
        UPDATE comercios
        SET usuario_id = usuario_comercio
        WHERE id = comercio_sin_propietario;
    END IF;
END $$;

-- 4) Domiciliario asignado al pedido.
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS domiciliario_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_pedidos_domiciliario'
    ) THEN
        ALTER TABLE pedidos
            ADD CONSTRAINT fk_pedidos_domiciliario
            FOREIGN KEY (domiciliario_id)
            REFERENCES usuarios(id);
    END IF;
END $$;

-- 5) Índices de uso frecuente.
CREATE INDEX IF NOT EXISTS idx_pedidos_domiciliario_id
    ON pedidos(domiciliario_id);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado
    ON pedidos(estado);

CREATE INDEX IF NOT EXISTS idx_productos_sucursal_id
    ON productos(sucursal_id);

CREATE INDEX IF NOT EXISTS idx_carritos_usuario_sucursal
    ON carritos(usuario_id, sucursal_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_carritos_usuario_sucursal
    ON carritos(usuario_id, sucursal_id);

-- Solo una dirección principal por usuario.
CREATE UNIQUE INDEX IF NOT EXISTS uq_direccion_principal_usuario
    ON direcciones(usuario_id)
    WHERE principal = TRUE;
