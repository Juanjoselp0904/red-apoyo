import {
  LINEAS_EMERGENCIA,
  LINEAS_SALUD_MENTAL,
  type Linea,
} from "@/lib/lineas";

function Grupo({ titulo, lineas }: { titulo: string; lineas: Linea[] }) {
  return (
    <div>
      <h3 className="text-[14px] font-semibold uppercase tracking-wide text-muted">
        {titulo}
      </h3>
      <ul className="mt-1 divide-y divide-line">
        {lineas.map((l) => (
          <li key={l.numero} className="py-3 last:pb-0">
            <a
              href={`tel:${l.tel}`}
              className="flex items-baseline justify-between gap-4"
            >
              <span className="font-medium">{l.nombre}</span>
              <span className="text-xl font-bold whitespace-nowrap underline underline-offset-4">
                {l.numero}
              </span>
            </a>
            <p className="text-[14px] text-muted mt-0.5">{l.detalle}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Bloque de líneas de atención.
 *
 * `prominente` lo pinta como lo primero que se lee en la página, con la lista
 * completa y las líneas de escucha de primeras: es lo que se muestra cuando
 * detectamos señales de riesgo. En el modo normal solo van las destacadas,
 * para no ahogar la página en números.
 */
export function LineasCrisis({
  prominente = false,
  titulo,
}: {
  prominente?: boolean;
  titulo?: string;
}) {
  const emergencia = prominente
    ? LINEAS_EMERGENCIA
    : LINEAS_EMERGENCIA.filter((l) => l.destacada);
  const saludMental = prominente
    ? LINEAS_SALUD_MENTAL
    : LINEAS_SALUD_MENTAL.filter((l) => l.destacada);

  return (
    <section
      className={
        prominente
          ? "rounded-xl border-2 border-alerta bg-alerta-soft p-5"
          : "rounded-xl border border-line bg-surface p-5"
      }
    >
      <h2
        className={`text-lg font-semibold mb-1 ${prominente ? "text-alerta" : ""}`}
      >
        {titulo ??
          (prominente
            ? "Si estás en peligro ahora, no esperes a un voluntario"
            : "Líneas de atención inmediata")}
      </h2>
      {prominente && (
        <p className="text-[15px] mb-4">
          Estas líneas atienden ya mismo, gratis y las 24 horas. Tu vida
          importa y hay alguien esperando tu llamada.
        </p>
      )}

      <div className="space-y-5">
        {/* Primero la escucha: en una crisis emocional es la que sirve. */}
        <Grupo titulo="Para hablar ahora" lineas={saludMental} />
        <Grupo titulo="Emergencias y desastres" lineas={emergencia} />
      </div>
    </section>
  );
}
