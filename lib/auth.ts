import type { User } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

export type Voluntario = {
  nombre: string;
  kind: "psicologo" | "escucha";
  status: "pendiente" | "aprobado" | "rechazado" | "suspendido";
  cupo_max: number;
};

export type Sesion = {
  user: User | null;
  esAdmin: boolean;
  voluntario: Voluntario | null;
};

/**
 * Sesión y rol en una sola pasada. Lo consumen la cabecera, /entrar y los
 * guards de las páginas privadas, para no repetir estas tres consultas.
 */
export async function getSesion(): Promise<Sesion> {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, esAdmin: false, voluntario: null };

  const [{ data: esAdmin }, { data: voluntario }] = await Promise.all([
    supabase.rpc("is_admin"),
    supabase
      .from("volunteers")
      .select("nombre, kind, status, cupo_max")
      .eq("user_id", user.id)
      .maybeSingle<Voluntario>(),
  ]);

  return {
    user,
    esAdmin: Boolean(esAdmin),
    voluntario: voluntario ?? null,
  };
}

/**
 * A dónde pertenece esta persona. Los admin caen en su panel; siempre
 * pueden saltar al de voluntario desde el menú.
 */
export function destinoSegunRol(sesion: Sesion): string {
  if (sesion.esAdmin) return "/admin";
  if (sesion.voluntario) return "/voluntario";
  return "/doy-ayuda/registro";
}
