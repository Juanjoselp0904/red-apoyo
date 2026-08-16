-- =====================================================================
-- Una sola bolsa de casos.
--
-- Quitamos del formulario la pregunta "¿con quién prefieres hablar?":
-- casi todo el mundo escogía psicólogo por defecto, así que el dato no
-- discriminaba nada y sí dejaba a los voluntarios de escucha sin casos.
--
-- Ahora cualquier voluntario aprobado ve y puede tomar cualquier caso
-- abierto. La columna requests.kind se queda (nullable) para no perder
-- el histórico y para poder revertir esto sin migrar datos.
-- =====================================================================

alter table requests alter column kind drop not null;

-- ---------- crear_solicitud: cambia la firma, hay que recrearla ----------
drop function if exists public.crear_solicitud(
  text, text, text, volunteer_kind, urgency, text, text);

create or replace function public.crear_solicitud(
  p_nombre text, p_ciudad text, p_whatsapp text,
  p_urgencia urgency, p_mensaje text, p_ip_hash text
) returns text
language plpgsql volatile security definer set search_path = public as $$
declare
  v_codigo text;
  v_recientes int;
begin
  if length(trim(p_nombre)) < 2 then raise exception 'nombre_invalido'; end if;
  if p_whatsapp !~ '^\+57[0-9]{10}$' then raise exception 'whatsapp_invalido'; end if;

  select count(*) into v_recientes
  from requests
  where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';
  if v_recientes >= 3 then raise exception 'rate_limited'; end if;

  select codigo into v_codigo from requests
  where whatsapp = p_whatsapp and status in ('abierta','tomada')
  order by created_at desc limit 1;
  if v_codigo is not null then return v_codigo; end if;

  loop
    v_codigo := gen_codigo();
    exit when not exists (select 1 from requests where codigo = v_codigo);
  end loop;

  insert into requests (codigo, nombre, ciudad, whatsapp, urgencia, mensaje, ip_hash)
  values (v_codigo, trim(p_nombre), nullif(trim(coalesce(p_ciudad,'')),''), p_whatsapp,
          p_urgencia, nullif(trim(coalesce(p_mensaje,'')),''), p_ip_hash);

  return v_codigo;
end $$;

-- ---------- la bandeja ya no filtra por tipo ----------
create or replace function public.casos_disponibles()
returns table (id uuid, codigo text, nombre text, ciudad text, kind volunteer_kind,
               urgencia urgency, mensaje text, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (
    select 1 from volunteers v
    where v.user_id = auth.uid() and v.status = 'aprobado'
  ) then
    raise exception 'no_aprobado';
  end if;

  return query
    select r.id, r.codigo, r.nombre, r.ciudad, r.kind, r.urgencia, r.mensaje, r.created_at
    from requests r
    where r.status = 'abierta'
    order by (r.urgencia = 'urgente') desc, r.created_at asc
    limit 100;
end $$;

-- ---------- tomar_caso: se cae la validación de tipo ----------
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

  select * into v_req from requests where id = p_request_id for update;
  if v_req.id is null          then raise exception 'no_existe'; end if;
  if v_req.status <> 'abierta' then raise exception 'ya_tomado'; end if;

  insert into matches (request_id, volunteer_id) values (v_req.id, v_vol.id)
  returning id into v_match;
  update requests set status = 'tomada' where id = v_req.id;

  return query select v_match, v_req.nombre, v_req.whatsapp, v_req.mensaje, v_req.urgencia;
end $$;

grant execute on function
  public.crear_solicitud(text,text,text,urgency,text,text)
  to anon, authenticated;
