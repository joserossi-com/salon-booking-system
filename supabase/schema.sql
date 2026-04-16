-- ============================================================
-- Beauty Salon Booking System — Supabase Schema
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- TRABAJADORAS
-- ------------------------------------------------------------
create table trabajadoras (
  id                  uuid primary key default uuid_generate_v4(),
  nombre              text not null check (char_length(nombre) <= 100),
  email               text unique check (char_length(email) <= 200),
  telefono            text check (char_length(telefono) <= 20),
  porcentaje_comision numeric(5,2) not null default 0 check (porcentaje_comision >= 0 and porcentaje_comision <= 100),
  activa              boolean not null default true,
  created_at          timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SERVICIOS
-- ------------------------------------------------------------
create table servicios (
  id                uuid primary key default uuid_generate_v4(),
  nombre            text not null check (char_length(nombre) <= 100),
  descripcion       text check (char_length(descripcion) <= 500),
  duracion_minutos  integer not null check (duracion_minutos > 0 and duracion_minutos <= 480),
  precio            integer not null check (precio >= 0),
  categoria         text not null check (categoria in ('unas','pestanas','cejas','facial','masajes')),
  activo            boolean not null default true,
  created_at        timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TRABAJADORA_SERVICIOS
-- ------------------------------------------------------------
create table trabajadora_servicios (
  trabajadora_id  uuid references trabajadoras(id) on delete cascade,
  servicio_id     uuid references servicios(id) on delete cascade,
  primary key (trabajadora_id, servicio_id)
);

-- ------------------------------------------------------------
-- CLIENTES
-- ------------------------------------------------------------
create table clientes (
  id                   uuid primary key default uuid_generate_v4(),
  nombre               text not null check (char_length(nombre) <= 100),
  telefono             text not null unique check (char_length(telefono) <= 20),
  email                text check (char_length(email) <= 200),
  notas                text check (char_length(notas) <= 500),
  fecha_primera_visita date,
  created_at           timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CITAS
-- ------------------------------------------------------------
create table citas (
  id                 uuid primary key default uuid_generate_v4(),
  cliente_id         uuid not null references clientes(id) on delete restrict,
  trabajadora_id     uuid not null references trabajadoras(id) on delete restrict,
  servicio_id        uuid not null references servicios(id) on delete restrict,
  fecha_hora_inicio  timestamptz not null,
  fecha_hora_fin     timestamptz not null,
  estado             text not null default 'pendiente' check (estado in ('pendiente','confirmada','cancelada','completada')),
  precio_cobrado     integer check (precio_cobrado >= 0),
  metodo_pago        text check (metodo_pago in ('efectivo','transferencia','debito','credito')),
  notas              text check (char_length(notas) <= 500),
  created_at         timestamptz not null default now(),
  constraint fecha_coherente check (fecha_hora_fin > fecha_hora_inicio)
);

create index idx_citas_trabajadora_fecha on citas (trabajadora_id, fecha_hora_inicio);
create index idx_citas_fecha on citas (fecha_hora_inicio);

-- ------------------------------------------------------------
-- COMISIONES
-- ------------------------------------------------------------
create table comisiones (
  id              uuid primary key default uuid_generate_v4(),
  trabajadora_id  uuid not null references trabajadoras(id) on delete restrict,
  cita_id         uuid not null unique references citas(id) on delete restrict,
  monto_comision  integer not null check (monto_comision >= 0),
  fecha           date not null,
  pagada          boolean not null default false
);

create index idx_comisiones_trabajadora on comisiones (trabajadora_id, pagada);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- El service_role key de Supabase bypasea RLS automáticamente.
-- Las policies protegen acceso desde el client (anon/auth).
-- ------------------------------------------------------------
alter table trabajadoras       enable row level security;
alter table servicios          enable row level security;
alter table trabajadora_servicios enable row level security;
alter table clientes           enable row level security;
alter table citas              enable row level security;
alter table comisiones         enable row level security;

-- Solo usuarios autenticados (dashboard) pueden leer y escribir
create policy "auth_read_trabajadoras"  on trabajadoras  for select to authenticated using (true);
create policy "auth_write_trabajadoras" on trabajadoras  for all    to authenticated using (true);

create policy "auth_read_servicios"     on servicios     for select to authenticated using (true);
create policy "auth_write_servicios"    on servicios     for all    to authenticated using (true);

create policy "auth_read_ts"            on trabajadora_servicios for select to authenticated using (true);
create policy "auth_write_ts"           on trabajadora_servicios for all    to authenticated using (true);

create policy "auth_read_clientes"      on clientes      for select to authenticated using (true);
create policy "auth_write_clientes"     on clientes      for all    to authenticated using (true);

create policy "auth_read_citas"         on citas         for select to authenticated using (true);
create policy "auth_write_citas"        on citas         for all    to authenticated using (true);

create policy "auth_read_comisiones"    on comisiones    for select to authenticated using (true);
create policy "auth_write_comisiones"   on comisiones    for all    to authenticated using (true);

-- Trigger: auto-crear comisión al completar una cita
create or replace function crear_comision_al_completar()
returns trigger language plpgsql as $$
declare
  v_trabajadora trabajadoras%rowtype;
  v_monto integer;
begin
  if new.estado = 'completada' and old.estado != 'completada' then
    select * into v_trabajadora from trabajadoras where id = new.trabajadora_id;
    v_monto := coalesce(new.precio_cobrado, 0) * v_trabajadora.porcentaje_comision / 100;
    insert into comisiones (trabajadora_id, cita_id, monto_comision, fecha)
    values (new.trabajadora_id, new.id, v_monto, now()::date)
    on conflict (cita_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger trg_comision_completada
  after update on citas
  for each row execute function crear_comision_al_completar();
