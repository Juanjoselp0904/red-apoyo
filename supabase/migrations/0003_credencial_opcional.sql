-- =====================================================================
-- La tarjeta profesional deja de ser obligatoria para registrarse.
--
-- Objetivo: quitar fricción en el registro de voluntarios. El control no
-- desaparece, se mueve: la cola de aprobación manual sigue siendo la
-- puerta, y el panel de admin marca a quién le falta el documento para
-- que sea una decisión consciente y no un descuido.
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
