-- ============================================================
-- Migración: Agregar soporte de Google Calendar
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Columna google_calendar_id en trabajadoras
--    Guarda el ID del calendario de Google donde se crearán los eventos de cada trabajadora.
--    Para un calendario compartido, todas apuntan al mismo ID.
ALTER TABLE trabajadoras
  ADD COLUMN IF NOT EXISTS google_calendar_id text;

-- 2. Columna google_event_id en citas
--    Guarda el ID del evento creado en Google Calendar para poder cancelarlo después.
ALTER TABLE citas
  ADD COLUMN IF NOT EXISTS google_event_id text;

-- 3. Asignar el calendario compartido a las 3 trabajadoras
--    Usando el calendario principal de Kitty Studio (joserossi.angulo@gmail.com).
--    Si en el futuro quieres un calendario separado, reemplaza el ID aquí.
UPDATE trabajadoras
SET google_calendar_id = 'joserossi.angulo@gmail.com'
WHERE id IN (
  '6f040372-3229-4d33-9442-61dfa176da8b',  -- Nicole
  'bd19a647-85d6-47a9-9f07-eb23b436301e',  -- Constanza
  '74dcd59f-9a56-40d2-867e-979134c50160'   -- Jacqueline / Kitty
);

-- Verificar que quedó bien:
SELECT id, nombre, google_calendar_id FROM trabajadoras ORDER BY nombre;
