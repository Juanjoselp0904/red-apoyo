"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { detectaRiesgo, solicitudSchema } from "@/lib/validation";
import { normalizarWhatsapp } from "@/lib/whatsapp";

export type EstadoForm = { error?: string };

const MENSAJES_ERROR: Record<string, string> = {
  rate_limited:
    "Ya recibimos varias solicitudes desde esta conexión. Espera una hora, o llama al 123 si es urgente.",
  whatsapp_invalido: "Ese número de WhatsApp no parece válido.",
  nombre_invalido: "Escribe tu nombre.",
};

function hashIp(ip: string) {
  return createHash("sha256")
    .update(ip + (process.env.IP_SALT ?? "red-de-apoyo"))
    .digest("hex");
}

export async function crearSolicitud(
  _prev: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const parsed = solicitudSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const whatsapp = normalizarWhatsapp(parsed.data.whatsapp);
  if (!whatsapp) {
    return {
      error: "Escribe tu celular colombiano, por ejemplo 300 123 4567.",
    };
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "0.0.0.0").split(",")[0].trim();

  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("crear_solicitud", {
    p_nombre: parsed.data.nombre,
    p_ciudad: parsed.data.ciudad || null,
    p_whatsapp: whatsapp,
    p_urgencia: parsed.data.urgencia,
    p_mensaje: parsed.data.mensaje || null,
    p_ip_hash: hashIp(ip),
  });

  if (error) {
    const clave = Object.keys(MENSAJES_ERROR).find((k) =>
      error.message.includes(k),
    );
    return {
      error: clave
        ? MENSAJES_ERROR[clave]
        : "No pudimos guardar tu solicitud. Intenta de nuevo, o llama al 123 si es urgente.",
    };
  }

  // Si hay señales de riesgo o marcó urgente, la página de estado abre con
  // las líneas de crisis de primero.
  const riesgo =
    parsed.data.urgencia === "urgente" || detectaRiesgo(parsed.data.mensaje);

  redirect(`/solicitud/${data}${riesgo ? "?riesgo=1" : ""}`);
}

export async function cancelarSolicitud(formData: FormData) {
  const codigo = String(formData.get("codigo") ?? "");
  const supabase = await supabaseServer();
  await supabase.rpc("cancelar_solicitud", { p_codigo: codigo });
  redirect(`/solicitud/${codigo}`);
}
