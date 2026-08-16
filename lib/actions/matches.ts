"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { linkWhatsapp } from "@/lib/whatsapp";

export type ResultadoTomar =
  | { ok: true; link: string; nombre: string; matchId: string }
  | { ok: false; error: string };

const MENSAJES: Record<string, string> = {
  ya_tomado: "Otra persona tomó este caso hace un momento.",
  cupo_lleno:
    "Ya tienes tus casos activos al tope. Cierra uno antes de tomar otro.",
  no_aprobado: "Tu cuenta todavía no está aprobada.",
  kind_no_coincide: "Ese caso pide otro tipo de acompañamiento.",
  no_existe: "Ese caso ya no existe.",
};

function traducir(mensaje: string) {
  const clave = Object.keys(MENSAJES).find((k) => mensaje.includes(k));
  return clave ? MENSAJES[clave] : "No pudimos tomar el caso. Recarga la página.";
}

export async function tomarCaso(
  _prev: ResultadoTomar | null,
  formData: FormData,
): Promise<ResultadoTomar> {
  const requestId = String(formData.get("requestId") ?? "");
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .rpc("tomar_caso", { p_request_id: requestId })
    .single<{
      match_id: string;
      nombre: string;
      whatsapp: string;
      mensaje: string | null;
      urgencia: string;
    }>();

  if (error || !data) {
    return { ok: false, error: traducir(error?.message ?? "") };
  }

  const { data: yo } = await supabase
    .from("volunteers")
    .select("nombre, kind")
    .single<{ nombre: string; kind: "psicologo" | "escucha" }>();

  revalidatePath("/voluntario");

  return {
    ok: true,
    matchId: data.match_id,
    nombre: data.nombre,
    link: linkWhatsapp(
      data.whatsapp,
      data.nombre,
      yo?.nombre ?? "un voluntario",
      yo?.kind ?? "escucha",
    ),
  };
}

export async function cerrarCaso(formData: FormData) {
  const supabase = await supabaseServer();
  await supabase.rpc("cerrar_caso", {
    p_match_id: String(formData.get("matchId") ?? ""),
    p_nota: String(formData.get("nota") ?? ""),
    p_derivado: formData.get("derivado") === "on",
  });
  revalidatePath("/voluntario");
}
