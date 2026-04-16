-- ============================================================
-- Kitty Studio — Seed Data
-- Ejecutar DESPUÉS de schema.sql
-- ============================================================

-- ------------------------------------------------------------
-- TRABAJADORAS
-- ------------------------------------------------------------
insert into trabajadoras (nombre, email, telefono, porcentaje_comision) values
  ('Valentina Rojas',    'vale@kittystudio.cl',  '+56911111111', 40),
  ('Camila Fernández',   'cami@kittystudio.cl',  '+56922222222', 40),
  ('Isidora Muñoz',      'isi@kittystudio.cl',   '+56933333333', 40);

-- ------------------------------------------------------------
-- SERVICIOS
-- ------------------------------------------------------------
-- Uñas
insert into servicios (nombre, duracion_minutos, precio, categoria) values
  ('Esmaltado',                   45,   10000, 'unas'),
  ('Kapping',                     90,   20000, 'unas'),
  ('Soft Gel',                    90,   20000, 'unas'),
  ('Polygel con Tips',           120,   23000, 'unas'),
  ('Acrílicas con Tips',         120,   23000, 'unas'),
  ('Acrílicas Esculpidas',       150,   25000, 'unas'),
  ('Manicura Limpieza',           30,    8000, 'unas'),
  ('Pedicura Limpieza',           45,   10000, 'unas'),
  ('Pedicura + Esmaltado',        60,   15000, 'unas'),
  ('Retiro',                      20,    5000, 'unas'),
  ('Parafinoterapia',             20,    5000, 'unas'),
-- Pestañas
  ('Extensiones Clásicas',       120,   25000, 'pestanas'),
  ('Extensiones Volumen',        150,   30000, 'pestanas'),
  ('Extensiones Wispy',          150,   30000, 'pestanas'),
  ('Foxy Eyes',                  150,   30000, 'pestanas'),
  ('Lifting de Pestañas',         60,   20000, 'pestanas'),
-- Cejas
  ('Perfilado de Cejas',          20,    6000, 'cejas'),
  ('Henna de Cejas',              40,    8000, 'cejas'),
  ('Laminado de Cejas',           60,   12000, 'cejas'),
  ('Epilación con Hilo',          20,    6000, 'cejas'),
-- Facial
  ('Limpieza Facial',             75,   20000, 'facial'),
  ('Peeling',                     90,   25000, 'facial'),
  ('Dermapen',                    90,   35000, 'facial'),
-- Masajes
  ('Masaje Relajante',            75,   20000, 'masajes');

-- ------------------------------------------------------------
-- TRABAJADORA_SERVICIOS — todas hacen todos los servicios
-- ------------------------------------------------------------
insert into trabajadora_servicios (trabajadora_id, servicio_id)
select t.id, s.id
from trabajadoras t cross join servicios s;
