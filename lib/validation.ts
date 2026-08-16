import { z } from "zod";

export const kindSchema = z.enum(["psicologo", "escucha"]);
export const urgenciaSchema = z.enum(["puedo_esperar", "pronto", "urgente"]);

export const solicitudSchema = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre").max(60),
  ciudad: z.string().trim().max(80).optional().or(z.literal("")),
  whatsapp: z.string().trim().min(7, "Necesitamos tu WhatsApp"),
  urgencia: urgenciaSchema,
  mensaje: z.string().trim().max(1500).optional().or(z.literal("")),
});

export const voluntarioSchema = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre").max(80),
  kind: kindSchema,
  ciudad: z.string().trim().max(80).optional().or(z.literal("")),
  whatsapp: z.string().trim().min(7, "Necesitamos tu WhatsApp"),
  bio: z.string().trim().max(600).optional().or(z.literal("")),
  credencialPath: z.string().trim().max(300).optional().or(z.literal("")),
  acepto: z.literal("on", { message: "Debes aceptar los compromisos" }),
});

/**
 * Señales de riesgo inmediato. No es un diagnóstico: solo decide si la
 * pantalla siguiente pone las líneas de crisis por delante de todo lo demás.
 * Preferimos falsos positivos.
 */
const SENALES = [
  "suicid",
  "matarme",
  "me quiero morir",
  "quiero morir",
  "no quiero vivir",
  "acabar con todo",
  "quitarme la vida",
  "hacerme daño",
  "no aguanto mas",
  "no aguanto más",
  "sin salida",
];

export function detectaRiesgo(texto: string | undefined | null): boolean {
  if (!texto) return false;
  const t = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return SENALES.some((s) =>
    t.includes(s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")),
  );
}
