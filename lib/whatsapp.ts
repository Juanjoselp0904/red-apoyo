/** Normaliza un número colombiano a E.164 (+57XXXXXXXXXX). Devuelve null si no es válido. */
export function normalizarWhatsapp(raw: string): string | null {
  const soloDigitos = raw.replace(/\D/g, "");
  // 3001234567 → +573001234567 ; 573001234567 → +573001234567
  const nacional = soloDigitos.startsWith("57")
    ? soloDigitos.slice(2)
    : soloDigitos;
  if (!/^3\d{9}$/.test(nacional)) return null;
  return `+57${nacional}`;
}

/** Formato legible: +57 300 123 4567 */
export function mostrarWhatsapp(e164: string): string {
  const n = e164.replace("+57", "");
  return `+57 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}

/** Link wa.me con el saludo ya escrito, para que el voluntario no arranque en frío. */
export function linkWhatsapp(
  e164: string,
  nombreSolicitante: string,
  nombreVoluntario: string,
  kind: "psicologo" | "escucha",
): string {
  const rol =
    kind === "psicologo"
      ? "psicólogo(a) voluntario(a)"
      : "voluntario(a) de escucha";
  const texto =
    `Hola ${nombreSolicitante}, soy ${nombreVoluntario}, ${rol} de Red de Apoyo. ` +
    `Recibí tu solicitud y quiero acompañarte. ` +
    `¿Te queda bien hablar por aquí, o prefieres que te llame? ` +
    `Cuando quieras y como tú puedas.`;
  return `https://wa.me/${e164.replace("+", "")}?text=${encodeURIComponent(texto)}`;
}
