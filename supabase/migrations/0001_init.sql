-- =====================================================================
-- Red de Apoyo — esquema inicial
--
-- Principio de seguridad: NADIE toca las tablas directamente.
-- Todo el acceso pasa por funciones SECURITY DEFINER que validan
-- quién eres y qué puedes ver. RLS queda activo y SIN políticas
-- permisivas para anon/authenticated en las tablas sensibles, así
-- que una fuga por consulta directa con la anon key es imposible.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- tipos ----------
create type volunteer_kind   as enum ('psicologo','escucha');
create type volunteer_status as enum ('pendiente','aprobado','rechazado','suspendido');
create type request_status   as enum ('abierta','tomada','cerrada','cancelada');
create type urgency          as enum ('puedo_esperar','pronto','urgente');

-- ---------- tablas ----------
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table volunteers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  nombre text not null,
  kind volunteer_kind not null,
  ciudad text,
  whatsapp text not null,                    -- E.164, nunca público
  bio text,
  credencial_path text,                      -- Storage privado; obligatorio para psicólogos
  status volunteer_status not null default 'pendiente',
  cupo_max int not null default 3,
  acepto_terminos boolean not null default false,
  created_at timestamptz not null default now()
);

create table requests (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  nombre text not null,                      -- solo nombre de pila
  ciudad text,
  whatsapp text not null,                    -- se revela SOLO al tomar el caso
  kind volunteer_kind not null,
  urgencia urgency not null default 'pronto',
  mensaje text,
  status request_status not null default 'abierta',
  ip_hash text,
  created_at timestamptz not null default now()
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references requests(id) on delete cascade,
  volunteer_id uuid not null references volunteers(id) on delete cascade,
  tomado_at timestamptz not null default now(),
  cerrado_at timestamptz,
  nota_cierre text,
  derivado boolean not null default false
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete set null,
  reportado_por uuid references auth.users(id) on delete set null,
  motivo text not null,
  detalle text,
  atendido boolean not null default false,
  created_at timestamptz not null default now()
);

create index on requests (status, kind, created_at desc);
create index on requests (ip_hash, created_at desc);
create index on matches (volunteer_id) where cerrado_at is null;

-- ---------- RLS: encendido en todo, sin políticas permisivas ----------
alter table admins     enable row level security;
alter table volunteers enable row level security;
alter table requests   enable row level security;
alter table matches    enable row level security;
alter table reports    enable row level security;

revoke all on admins, volunteers, requests, matches, reports from anon, authenticated;

-- Única excepción cómoda: el voluntario puede leer y editar SU propia ficha.
grant select (id, user_id, nombre, kind, ciudad, whatsapp, bio, status, cupo_max, created_at)
  on volunteers to authenticated;
grant update (nombre, ciudad, whatsapp, bio) on volunteers to authenticated;

create policy volunteers_leo_mi_ficha on volunteers
  for select to authenticated using (user_id = auth.uid());
create policy volunteers_edito_mi_ficha on volunteers
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- helpers ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

create or replace function public.gen_codigo() returns text
language sql volatile as $$
  -- alfabeto sin caracteres ambiguos (0/O, 1/I/L)
  select 'AYUDA-' || string_agg(
    substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ',
           1 + floor(random() * 31)::int, 1), '')
  from generate_series(1, 4);
$$;

-- =====================================================================
-- Solicitar ayuda (público, sin sesión)
-- =====================================================================
create or replace function public.crear_solicitud(
  p_nombre text, p_ciudad text, p_whatsapp text,
  p_kind volunteer_kind, p_urgencia urgency, p_mensaje text, p_ip_hash text
) returns text
language plpgsql volatile security definer set search_path = public as $$
declare
  v_codigo text;
  v_recientes int;
begin
  if length(trim(p_nombre)) < 2 then raise exception 'nombre_invalido'; end if;
  if p_whatsapp !~ '^\+57[0-9]{10}$' then raise exception 'whatsapp_invalido'; end if;

  -- rate limit: máximo 3 solicitudes por hora desde la misma IP
  select count(*) into v_recientes
  from requests
  where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';
  if v_recientes >= 3 then raise exception 'rate_limited'; end if;

  -- si ya tiene una solicitud viva con el mismo número, devolvemos esa
  select codigo into v_codigo from requests
  where whatsapp = p_whatsapp and status in ('abierta','tomada')
  order by created_at desc limit 1;
  if v_codigo is not null then return v_codigo; end if;

  loop
    v_codigo := gen_codigo();
    exit when not exists (select 1 from requests where codigo = v_codigo);
  end loop;

  insert into requests (codigo, nombre, ciudad, whatsapp, kind, urgencia, mensaje, ip_hash)
  values (v_codigo, trim(p_nombre), nullif(trim(coalesce(p_ciudad,'')),''), p_whatsapp,
          p_kind, p_urgencia, nullif(trim(coalesce(p_mensaje,'')),''), p_ip_hash);

  return v_codigo;
end $$;

-- Estado por código. Nunca devuelve teléfonos.
create or replace function public.estado_solicitud(p_codigo text)
returns table (codigo text, nombre text, kind volunteer_kind, urgencia urgency,
               status request_status, created_at timestamptz,
               voluntario_nombre text, voluntario_kind volunteer_kind, tomado_at timestamptz)
language sql stable security definer set search_path = public as $$
  select r.codigo, r.nombre, r.kind, r.urgencia, r.status, r.created_at,
         v.nombre, v.kind, m.tomado_at
  from requests r
  left join matches m on m.request_id = r.id and m.cerrado_at is null
  left join volunteers v on v.id = m.volunteer_id
  where upper(r.codigo) = upper(trim(p_codigo));
$$;

create or replace function public.cancelar_solicitud(p_codigo text) returns void
language plpgsql volatile security definer set search_path = public as $$
begin
  update requests set status = 'cancelada'
  where upper(codigo) = upper(trim(p_codigo)) and status = 'abierta';
end $$;

-- =====================================================================
-- Voluntarios
-- =====================================================================
create or replace function public.registrar_voluntario(
  p_nombre text, p_kind volunteer_kind, p_ciudad text,
  p_whatsapp text, p_bio text, p_credencial_path text
) returns uuid
language plpgsql volatile security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'no_autenticado'; end if;
  if p_whatsapp !~ '^\+57[0-9]{10}$' then raise exception 'whatsapp_invalido'; end if;
  if p_kind = 'psicologo' and coalesce(p_credencial_path,'') = '' then
    raise exception 'credencial_requerida';
  end if;

  insert into volunteers (user_id, nombre, kind, ciudad, whatsapp, bio, credencial_path, acepto_terminos)
  values (auth.uid(), trim(p_nombre), p_kind, nullif(trim(coalesce(p_ciudad,'')),''),
          p_whatsapp, nullif(trim(coalesce(p_bio,'')),''), nullif(p_credencial_path,''), true)
  on conflict (user_id) do update
    set nombre = excluded.nombre, kind = excluded.kind, ciudad = excluded.ciudad,
        whatsapp = excluded.whatsapp, bio = excluded.bio,
        credencial_path = coalesce(excluded.credencial_path, volunteers.credencial_path)
    where volunteers.status <> 'suspendido'
  returning id into v_id;

  if v_id is null then raise exception 'suspendido'; end if;
  return v_id;
end $$;

-- Bandeja: casos abiertos del tipo que atiende este voluntario. SIN teléfono.
create or replace function public.casos_disponibles()
returns table (id uuid, codigo text, nombre text, ciudad text, kind volunteer_kind,
               urgencia urgency, mensaje text, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare v_kind volunteer_kind;
begin
  select v.kind into v_kind from volunteers v
  where v.user_id = auth.uid() and v.status = 'aprobado';
  if v_kind is null then raise exception 'no_aprobado'; end if;

  return query
    select r.id, r.codigo, r.nombre, r.ciudad, r.kind, r.urgencia, r.mensaje, r.created_at
    from requests r
    where r.status = 'abierta' and r.kind = v_kind
    order by (r.urgencia = 'urgente') desc, r.created_at asc
    limit 100;
end $$;

-- Tomar un caso: transaccional. Solo aquí se revela el WhatsApp.
create or replace function public.tomar_caso(p_request_id uuid)
returns table (match_id uuid, nombre text, whatsapp text, mensaje text, urgencia urgency)
language plpgsql volatile security definer set search_path = public as $$
declare
  v_vol volunteers%rowtype;
  v_req requests%rowtype;
  v_activos int;
  v_match uuid;
begin
  select * into v_vol from volunteers
  where user_id = auth.uid() and status = 'aprobado';
  if v_vol.id is null then raise exception 'no_aprobado'; end if;

  select count(*) into v_activos from matches
  where volunteer_id = v_vol.id and cerrado_at is null;
  if v_activos >= v_vol.cupo_max then raise exception 'cupo_lleno'; end if;

  -- el lock es lo que evita que dos voluntarios tomen el mismo caso
  select * into v_req from requests where id = p_request_id for update;
  if v_req.id is null       then raise exception 'no_existe';    end if;
  if v_req.status <> 'abierta' then raise exception 'ya_tomado'; end if;
  if v_req.kind <> v_vol.kind  then raise exception 'kind_no_coincide'; end if;

  insert into matches (request_id, volunteer_id) values (v_req.id, v_vol.id)
  returning id into v_match;
  update requests set status = 'tomada' where id = v_req.id;

  return query select v_match, v_req.nombre, v_req.whatsapp, v_req.mensaje, v_req.urgencia;
end $$;

-- Mis casos activos (con teléfono: ya son míos).
create or replace function public.mis_casos()
returns table (match_id uuid, codigo text, nombre text, whatsapp text, mensaje text,
               urgencia urgency, ciudad text, tomado_at timestamptz)
language sql stable security definer set search_path = public as $$
  select m.id, r.codigo, r.nombre, r.whatsapp, r.mensaje, r.urgencia, r.ciudad, m.tomado_at
  from matches m
  join requests r   on r.id = m.request_id
  join volunteers v on v.id = m.volunteer_id
  where v.user_id = auth.uid() and m.cerrado_at is null
  order by m.tomado_at desc;
$$;

create or replace function public.cerrar_caso(p_match_id uuid, p_nota text, p_derivado boolean)
returns void
language plpgsql volatile security definer set search_path = public as $$
declare v_req uuid;
begin
  select m.request_id into v_req
  from matches m join volunteers v on v.id = m.volunteer_id
  where m.id = p_match_id and v.user_id = auth.uid() and m.cerrado_at is null;
  if v_req is null then raise exception 'no_autorizado'; end if;

  update matches set cerrado_at = now(),
                     nota_cierre = nullif(trim(coalesce(p_nota,'')),''),
                     derivado = coalesce(p_derivado,false)
  where id = p_match_id;
  update requests set status = 'cerrada' where id = v_req;
end $$;

create or replace function public.reportar(p_match_id uuid, p_motivo text, p_detalle text)
returns void
language plpgsql volatile security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'no_autenticado'; end if;
  insert into reports (match_id, reportado_por, motivo, detalle)
  values (p_match_id, auth.uid(), p_motivo, nullif(trim(coalesce(p_detalle,'')),''));
end $$;

-- =====================================================================
-- Admin
-- =====================================================================
create or replace function public.admin_voluntarios(p_status volunteer_status default null)
returns table (id uuid, nombre text, kind volunteer_kind, ciudad text, whatsapp text,
               bio text, credencial_path text, status volunteer_status,
               email text, activos bigint, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'no_autorizado'; end if;
  return query
    select v.id, v.nombre, v.kind, v.ciudad, v.whatsapp, v.bio, v.credencial_path, v.status,
           u.email::text,
           (select count(*) from matches m where m.volunteer_id = v.id and m.cerrado_at is null),
           v.created_at
    from volunteers v
    join auth.users u on u.id = v.user_id
    where p_status is null or v.status = p_status
    order by (v.status = 'pendiente') desc, v.created_at desc;
end $$;

create or replace function public.admin_cambiar_status(p_volunteer_id uuid, p_status volunteer_status)
returns void
language plpgsql volatile security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'no_autorizado'; end if;
  update volunteers set status = p_status where id = p_volunteer_id;
end $$;

create or replace function public.admin_metricas()
returns table (abiertas bigint, tomadas bigint, cerradas bigint,
               voluntarios_pendientes bigint, voluntarios_aprobados bigint,
               derivaciones bigint, reportes_abiertos bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'no_autorizado'; end if;
  return query select
    (select count(*) from requests where status = 'abierta'),
    (select count(*) from requests where status = 'tomada'),
    (select count(*) from requests where status = 'cerrada'),
    (select count(*) from volunteers where status = 'pendiente'),
    (select count(*) from volunteers where status = 'aprobado'),
    (select count(*) from matches where derivado),
    (select count(*) from reports where not atendido);
end $$;

-- =====================================================================
-- Retención: los casos cerrados se anonimizan a los 30 días
-- =====================================================================
create or replace function public.anonimizar_casos_viejos() returns void
language sql volatile security definer set search_path = public as $$
  update requests set whatsapp = '', mensaje = null, nombre = 'anónimo', ip_hash = null
  where status in ('cerrada','cancelada') and created_at < now() - interval '30 days'
    and whatsapp <> '';
$$;

-- =====================================================================
-- Permisos de ejecución
-- =====================================================================
revoke execute on function public.anonimizar_casos_viejos() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;

grant execute on function
  public.crear_solicitud(text,text,text,volunteer_kind,urgency,text,text),
  public.estado_solicitud(text),
  public.cancelar_solicitud(text)
  to anon, authenticated;

grant execute on function
  public.registrar_voluntario(text,volunteer_kind,text,text,text,text),
  public.casos_disponibles(), public.tomar_caso(uuid), public.mis_casos(),
  public.cerrar_caso(uuid,text,boolean), public.reportar(uuid,text,text),
  public.is_admin(),
  public.admin_voluntarios(volunteer_status),
  public.admin_cambiar_status(uuid,volunteer_status),
  public.admin_metricas()
  to authenticated;

-- =====================================================================
-- Storage: credenciales profesionales (bucket privado)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('credenciales','credenciales', false, 5242880,
        array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

create policy "credencial: subo la mía" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'credenciales' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "credencial: leo la mía" on storage.objects
  for select to authenticated
  using (bucket_id = 'credenciales'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
