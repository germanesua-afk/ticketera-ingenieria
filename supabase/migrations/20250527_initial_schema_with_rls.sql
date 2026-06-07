-- ============================================================================
-- SISTEMA DE TICKETERA - DESPLIEGUE DE OBRAS
-- Migración inicial completa + Políticas RLS production-grade
-- Basado en el Documento de Diseño v1.0 (ID: 524054a8)
-- ============================================================================

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

create type public.user_role as enum (
  'SOLICITANTE',
  'SOLICITANTE+',
  'ING',
  'JEFEING',
  'ADMIN'
);

create type public.ticket_estado as enum (
  'NUEVO',
  'PENDIENTE_ASIGNACION',
  'ASIGNADO',
  'EN_PROGRESO',
  'EN_REVISION',
  'CERRADO',
  'CANCELADO'
);

create type public.ticket_prioridad as enum (
  'BAJA',
  'MEDIA',
  'ALTA',
  'CRITICA'
);

create type public.historial_accion as enum (
  'CREACION',
  'ASIGNACION',
  'CAMBIO_ESTADO',
  'CAMBIO_FECHAS',
  'CAMBIO_PRIORIDAD',
  'COMENTARIO',      -- legacy (se mantiene por compatibilidad)
  'CANCELACION',
  'CIERRE'
);

-- ============================================================================
-- TABLAS
-- ============================================================================

-- Usuarios (extiende auth.users de Supabase)
create table public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nombre_completo text not null,
  rol public.user_role not null default 'SOLICITANTE',
  area_obra text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tickets principales
create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  numero text unique, -- se genera con trigger
  titulo text not null,
  descripcion text,
  solicitante_id uuid not null references public.usuarios(id),
  dueno_id uuid references public.usuarios(id),
  estado public.ticket_estado not null default 'NUEVO',
  prioridad public.ticket_prioridad not null default 'MEDIA',
  area_obra text,
  fecha_creacion timestamptz not null default now(),
  fecha_fin_estimada date,
  fecha_cierre timestamptz,
  link_planos text,
  link_avance text,
  link_fotos text,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Historial inmutable de cambios
create table public.historial_cambios (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  actor_id uuid not null references public.usuarios(id),
  accion public.historial_accion not null,
  campo text,
  valor_anterior text,
  valor_nuevo text,
  motivo text,
  created_at timestamptz not null default now()
);

-- Comentarios (públicos e internos)
create table public.comentarios (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  autor_id uuid not null references public.usuarios(id),
  contenido text not null,
  es_interno boolean not null default false,
  created_at timestamptz not null default now()
);

-- Adjuntos (referencias a Storage)
create table public.adjuntos (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  nombre_archivo text not null,
  storage_path text not null,
  tipo_mime text,
  tamano_bytes bigint,
  subido_por uuid not null references public.usuarios(id),
  created_at timestamptz not null default now()
);

-- Notificaciones (para auditoría y reintentos)
create table public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.tickets(id) on delete cascade,
  destinatario_id uuid references public.usuarios(id),
  tipo text not null, -- 'asignacion', 'cambio_estado', 'recordatorio', etc.
  asunto text not null,
  contenido text,
  enviado_en timestamptz,
  error text,
  created_at timestamptz not null default now()
);

-- Feature flags (para rollout controlado)
create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- FUNCIONES HELPER RLS (SECURITY DEFINER)
-- ============================================================================

-- Helper: obtener rol del usuario actual
create or replace function public.get_current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select rol from public.usuarios where id = auth.uid();
$$;

grant execute on function public.get_current_user_role() to authenticated;

comment on function public.get_current_user_role() is
'Devuelve el rol del usuario autenticado actual. Usado por RLS policies.';

-- Helper: obtener area_obra del usuario actual
create or replace function public.get_current_user_area_obra()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select area_obra from public.usuarios where id = auth.uid();
$$;

grant execute on function public.get_current_user_area_obra() to authenticated;

-- Helper principal: determina si el usuario puede ver un ticket específico
-- Incluye la lógica completa de SOLICITANTE+ por área (resolución de Issue 10)
create or replace function public.can_view_ticket(p_ticket_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_ticket_area text;
  v_user_role public.user_role;
  v_user_area text;
  v_solicitante_id uuid;
  v_dueno_id uuid;
begin
  select area_obra, solicitante_id, dueno_id
  into v_ticket_area, v_solicitante_id, v_dueno_id
  from public.tickets
  where id = p_ticket_id;

  if not found then
    return false;
  end if;

  v_user_role := public.get_current_user_role();
  v_user_area := public.get_current_user_area_obra();

  -- Dueño del ticket o solicitante original
  if v_solicitante_id = auth.uid() or v_dueno_id = auth.uid() then
    return true;
  end if;

  -- Roles elevados
  if v_user_role in ('ING', 'JEFEING', 'ADMIN') then
    return true;
  end if;

  -- SOLICITANTE+ puede ver tickets de su misma área
  if v_user_role = 'SOLICITANTE+' 
     and v_ticket_area is not null 
     and v_user_area is not null 
     and v_ticket_area is not distinct from v_user_area then
    return true;
  end if;

  return false;
end;
$$;

grant execute on function public.can_view_ticket(uuid) to authenticated;

comment on function public.can_view_ticket(uuid) is
'Determina si el usuario actual puede ver un ticket específico (propietario, dueño, roles elevados o SOLICITANTE+ del mismo area_obra). Base para todas las políticas SELECT de tablas hijas y Storage.';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Generar número de ticket correlativo
create or replace function public.generate_ticket_numero()
returns trigger
language plpgsql
as $$
begin
  if new.numero is null then
    new.numero := 'TK-' || to_char(now(), 'YYYY') || '-' || 
                  lpad(nextval('ticket_numero_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create sequence if not exists ticket_numero_seq;

create trigger trg_tickets_numero
before insert on public.tickets
for each row
execute function public.generate_ticket_numero();

-- Actualizar updated_at automáticamente
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_usuarios_updated_at
before update on public.usuarios
for each row
execute function public.update_updated_at_column();

create trigger trg_tickets_updated_at
before update on public.tickets
for each row
execute function public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS COMPLETAS
-- ============================================================================

alter table public.usuarios enable row level security;
alter table public.tickets enable row level security;
alter table public.historial_cambios enable row level security;
alter table public.comentarios enable row level security;
alter table public.adjuntos enable row level security;
alter table public.notificaciones enable row level security;

-- ---------------- USUARIOS ----------------
create policy "usuarios_select_self_or_admin"
on public.usuarios for select
to authenticated
using (
  id = auth.uid()
  or get_current_user_role() in ('ING', 'JEFEING', 'ADMIN')
);

create policy "usuarios_update_only_admin"
on public.usuarios for update
to authenticated
using (get_current_user_role() = 'ADMIN')
with check (get_current_user_role() = 'ADMIN');

create policy "usuarios_insert_only_admin"
on public.usuarios for insert
to authenticated
with check (get_current_user_role() = 'ADMIN');

-- ---------------- TICKETS ----------------
create policy "tickets_select_visibility"
on public.tickets for select
to authenticated
using ( can_view_ticket(id) );

create policy "tickets_insert_own"
on public.tickets for insert
to authenticated
with check (
  solicitante_id = auth.uid()
  and get_current_user_role() in ('SOLICITANTE', 'SOLICITANTE+')
);

create policy "tickets_update_owner_or_jefe"
on public.tickets for update
to authenticated
using (
  dueno_id = auth.uid()
  or get_current_user_role() in ('JEFEING', 'ADMIN')
)
with check (
  dueno_id = auth.uid()
  or get_current_user_role() in ('JEFEING', 'ADMIN')
);

create policy "tickets_delete_admin_only"
on public.tickets for delete
to authenticated
using (get_current_user_role() = 'ADMIN');

-- ---------------- HISTORIAL_CAMBIOS ----------------
create policy "historial_select_if_ticket_visible"
on public.historial_cambios for select
to authenticated
using ( can_view_ticket(ticket_id) );

create policy "historial_insert_own_actor_only"
on public.historial_cambios for insert
to authenticated
with check (
  actor_id = auth.uid()
  and can_view_ticket(ticket_id)
);

-- Historial es inmutable (no UPDATE / DELETE para nadie)
create policy "historial_no_update"
on public.historial_cambios for update
to authenticated
using (false);

create policy "historial_no_delete"
on public.historial_cambios for delete
to authenticated
using (false);

-- ---------------- COMENTARIOS ----------------
create policy "comentarios_select"
on public.comentarios for select
to authenticated
using (
  can_view_ticket(ticket_id)
  and (
    not es_interno
    or get_current_user_role() in ('ING', 'JEFEING', 'ADMIN')
  )
);

create policy "comentarios_insert"
on public.comentarios for insert
to authenticated
with check (
  autor_id = auth.uid()
  and can_view_ticket(ticket_id)
  and (
    (get_current_user_role() in ('SOLICITANTE', 'SOLICITANTE+') and not es_interno)
    or get_current_user_role() in ('ING', 'JEFEING', 'ADMIN')
  )
);

-- ---------------- ADJUNTOS ----------------
create policy "adjuntos_select"
on public.adjuntos for select
to authenticated
using ( can_view_ticket(ticket_id) );

create policy "adjuntos_insert"
on public.adjuntos for insert
to authenticated
with check (
  subido_por = auth.uid()
  and can_view_ticket(ticket_id)
);

-- ============================================================================
-- STORAGE BUCKET POLICIES (para adjuntos)
-- ============================================================================

-- NOTA: El bucket 'adjuntos-tickets' debe crearse manualmente en Supabase Storage
-- Path convention: tickets/{ticket_id}/{filename}

-- Las políticas de Storage se aplican vía SQL en el bucket (ver diseño para detalles completos)

-- ============================================================================
-- DATOS INICIALES (seed mínimo para desarrollo)
-- ============================================================================

-- Feature flags por defecto
insert into public.feature_flags (key, enabled, description) values
  ('sistema_activo', true, 'Activa/desactiva todo el sistema'),
  ('notificaciones_email', true, 'Habilita envío de emails'),
  ('dashboard_avanzado', false, 'Funcionalidades avanzadas de dashboard (fase 2)');

-- ============================================================================
-- ÍNDICES RECOMENDADOS
-- ============================================================================

create index idx_tickets_estado on public.tickets(estado);
create index idx_tickets_dueno on public.tickets(dueno_id);
create index idx_tickets_solicitante on public.tickets(solicitante_id);
create index idx_tickets_area on public.tickets(area_obra);
create index idx_tickets_fecha_fin on public.tickets(fecha_fin_estimada);
create index idx_historial_ticket on public.historial_cambios(ticket_id, created_at desc);
create index idx_comentarios_ticket on public.comentarios(ticket_id, created_at desc);

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================
-- Próximos pasos:
-- 1. Crear el bucket "adjuntos-tickets" en Storage (público = false)
-- 2. Aplicar políticas de Storage (ver subsección completa en el documento de diseño)
-- 3. Ejecutar verificación de RLS con los casos de prueba documentados
-- ============================================================================