"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { voluntarioSchema } from "@/lib/validation";
import { normalizarWhatsapp } from "@/lib/whatsapp";

export type EstadoForm = { error?: string };

export async function registrarVoluntario(
  _prev: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const parsed = voluntarioSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const whatsapp = normalizarWhatsapp(parsed.data.whatsapp);
  if (!whatsapp) {
    return { error: "Escribe tu celular colombiano, por ejemplo 300 123 4567." };
  }
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("registrar_voluntario", {
    p_nombre: parsed.data.nombre,
    p_kind: parsed.data.kind,
    p_ciudad: parsed.data.ciudad || null,
    p_whatsapp: whatsapp,
    p_bio: parsed.data.bio || null,
    p_credencial_path: parsed.data.credencialPath || null,
  });

  if (error) {
    if (error.message.includes("suspendido")) {
      return { error: "Esta cuenta está suspendida. Escríbenos si crees que es un error." };
    }
    return { error: "No pudimos guardar tu registro. Intenta de nuevo." };
  }

  redirect("/voluntario");
}

export async function cambiarStatus(formData: FormData) {
  const supabase = await supabaseServer();
  await supabase.rpc("admin_cambiar_status", {
    p_volunteer_id: String(formData.get("volunteerId") ?? ""),
    p_status: String(formData.get("status") ?? ""),
  });
  revalidatePath("/admin");
}

export async function cerrarSesion() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}
