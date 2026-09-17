-- ============================================================
-- FASTGO: MIGRACIÓN V5
-- 1. Unificación de Cuenta Única de Usuario con Roles Múltiples (usuarios_roles)
-- 2. Restauración de UNIQUE(correo) sobre tabla usuarios
-- 3. Configuración de Tiendas: Horarios, Métodos de Pago, Pausa Manual
-- 4. Soporte de Stock en Productos
-- 5. Método de Pago en Pedidos
-- ============================================================

-- 1) Asegurar constraint única en usuarios_roles (usuario_id, rol_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_usuarios_roles_usuario_rol'
    ) THEN
        DELETE FROM usuarios_roles a USING usuarios_roles b
        WHERE a.id > b.id AND a.usuario_id = b.usuario_id AND a.rol_id = b.rol_id;

        ALTER TABLE usuarios_roles
            ADD CONSTRAINT uq_usuarios_roles_usuario_rol
            UNIQUE (usuario_id, rol_id);
    END IF;
END $$;

-- 2) Migrar roles actuales desde usuarios.rol_id a usuarios_roles
INSERT INTO usuarios_roles (usuario_id, rol_id)
SELECT u.id, u.rol_id
FROM usuarios u
WHERE u.rol_id IS NOT NULL
ON CONFLICT (usuario_id, rol_id) DO NOTHING;

-- 3) Fusionar registros duplicados por correo (si existieran de la etapa V4)
DO $$
DECLARE
    rec RECORD;
    v_target_id INTEGER;
    v_dup_id INTEGER;
BEGIN
    FOR rec IN
        SELECT LOWER(TRIM(correo)) AS email_norm, MIN(id) AS target_id
        FROM usuarios
        GROUP BY LOWER(TRIM(correo))
        HAVING COUNT(*) > 1
    LOOP
        v_target_id := rec.target_id;

        FOR v_dup_id IN
            SELECT id FROM usuarios
            WHERE LOWER(TRIM(correo)) = rec.email_norm AND id <> v_target_id
        LOOP
            INSERT INTO usuarios_roles (usuario_id, rol_id)
            SELECT v_target_id, ur.rol_id
            FROM usuarios_roles ur
            WHERE ur.usuario_id = v_dup_id
            ON CONFLICT (usuario_id, rol_id) DO NOTHING;

            UPDATE pedidos SET usuario_id = v_target_id WHERE usuario_id = v_dup_id;
            UPDATE pedidos SET domiciliario_id = v_target_id WHERE domiciliario_id = v_dup_id;
            UPDATE comercios SET usuario_id = v_target_id WHERE usuario_id = v_dup_id;
            UPDATE direcciones SET usuario_id = v_target_id WHERE usuario_id = v_dup_id;
            UPDATE carritos SET usuario_id = v_target_id WHERE usuario_id = v_dup_id;
            UPDATE encomiendas SET cliente_id = v_target_id WHERE cliente_id = v_dup_id;
            UPDATE encomiendas SET domiciliario_id = v_target_id WHERE domiciliario_id = v_dup_id;

            DELETE FROM usuarios_roles WHERE usuario_id = v_dup_id;
            DELETE FROM usuarios WHERE id = v_dup_id;
        END LOOP;
    END LOOP;
END $$;

-- 4) Restaurar restricción UNIQUE sobre correo en la tabla usuarios
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS uq_usuarios_correo_rol;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_correo_key;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS uq_usuarios_correo;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_usuarios_correo'
    ) THEN
        ALTER TABLE usuarios
            ADD CONSTRAINT uq_usuarios_correo
            UNIQUE (correo);
    END IF;
END $$;

-- 5) Configuración extendida para Comercios (Horarios, Pausa Temporal, Métodos de Pago, Preparación)
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS metodos_pago VARCHAR(255) DEFAULT 'EFECTIVO,NEQUI,DAVIPLATA,TRANSFERENCIA';
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS hora_apertura TIME DEFAULT '08:00:00';
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS hora_cierre TIME DEFAULT '22:00:00';
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS dias_atencion VARCHAR(50) DEFAULT '1,2,3,4,5,6,7';
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS tiempo_preparacion_min INTEGER DEFAULT 20;
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS pausa_manual BOOLEAN DEFAULT FALSE;

-- 6) Soporte de Stock en Productos (NULL = no limitado por inventario numérico)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT NULL;

-- 7) Registro de Método de Pago en Pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50) DEFAULT 'EFECTIVO';
