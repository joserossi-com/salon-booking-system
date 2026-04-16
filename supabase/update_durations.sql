-- ============================================================
-- Kitty Studio — Actualizar duraciones de servicios
-- Ejecutar en Supabase SQL Editor contra la DB de producción
-- ============================================================

-- Uñas
UPDATE servicios SET duracion_minutos = 45  WHERE nombre ILIKE '%esmaltado%' AND categoria = 'unas';
UPDATE servicios SET duracion_minutos = 90  WHERE nombre ILIKE '%kapping%';
UPDATE servicios SET duracion_minutos = 90  WHERE nombre ILIKE '%soft gel%';
UPDATE servicios SET duracion_minutos = 120 WHERE nombre ILIKE '%polygel%';
UPDATE servicios SET duracion_minutos = 120 WHERE nombre ILIKE '%acrílicas con tips%';
UPDATE servicios SET duracion_minutos = 150 WHERE nombre ILIKE '%acrílicas esculpidas%';

-- Pestañas
UPDATE servicios SET duracion_minutos = 120 WHERE nombre ILIKE '%extensiones clásicas%' OR nombre ILIKE '%extensiones rímel%' OR nombre ILIKE '%extensiones máscara%';
UPDATE servicios SET duracion_minutos = 150 WHERE nombre ILIKE '%volumen%' OR nombre ILIKE '%wispy%' OR nombre ILIKE '%foxy%';
UPDATE servicios SET duracion_minutos = 60  WHERE nombre ILIKE '%lifting de pestañas%';
UPDATE servicios SET duracion_minutos = 75  WHERE nombre ILIKE '%lifting con%';

-- Cejas
UPDATE servicios SET duracion_minutos = 20  WHERE nombre ILIKE '%perfilado de cejas%' OR nombre ILIKE '%epilación con hilo%';
UPDATE servicios SET duracion_minutos = 40  WHERE nombre ILIKE '%henna de cejas%';
UPDATE servicios SET duracion_minutos = 60  WHERE nombre ILIKE '%laminado de cejas%';

-- Facial
UPDATE servicios SET duracion_minutos = 75  WHERE nombre ILIKE '%limpieza facial%';
UPDATE servicios SET duracion_minutos = 90  WHERE nombre ILIKE '%peeling%' OR nombre ILIKE '%dermapen%' OR nombre ILIKE '%despigment%';

-- Masajes
UPDATE servicios SET duracion_minutos = 75  WHERE nombre ILIKE '%masaje%';
UPDATE servicios SET duracion_minutos = 45  WHERE nombre ILIKE '%acrocordones%';

-- Valor por defecto para cualquier servicio que quede sin asignar
UPDATE servicios SET duracion_minutos = 60 WHERE duracion_minutos IS NULL OR duracion_minutos = 0;

-- Verificar resultado
SELECT nombre, categoria, duracion_minutos, precio FROM servicios ORDER BY categoria, nombre;
