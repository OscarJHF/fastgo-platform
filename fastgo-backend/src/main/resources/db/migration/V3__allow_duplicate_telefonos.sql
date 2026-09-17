-- FastGo: permitir múltiples usuarios con el mismo número telefónico
-- Se elimina la restricción UNIQUE sobre la columna telefono en la tabla usuarios.

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_telefono_key;
DROP INDEX IF EXISTS usuarios_telefono_key;
DROP INDEX IF EXISTS uq_usuarios_telefono;
