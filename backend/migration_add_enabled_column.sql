-- Script de migración para agregar la columna 'enabled' a la tabla users
-- Ejecutar este script en la base de datos existente para actualizar el esquema

-- Agregar la columna 'enabled' si no existe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Actualizar todos los usuarios existentes para que estén habilitados
UPDATE users SET enabled = TRUE WHERE enabled IS NULL OR enabled = FALSE;

