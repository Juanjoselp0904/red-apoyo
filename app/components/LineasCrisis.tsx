import {
  LINEAS_EMERGENCIA,
  LINEAS_SALUD_MENTAL,
  type Linea,
} from "@/lib/lineas";

function IconoTelefono() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 3.5h3l1.5 3-2 1.5a8 8 0 004.5 4.5l1.5-2 3 1.5v3H13A10 10 0 013 6.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ROTULO =
  "px-6 py-2.5 text-[12.5px] font-bold tracking-[.1em] uppercase border-t border-separador";

/** Cada línea es un enlace `tel:` real, con área táctil holgada. */
function Fila({ linea, tono }: { linea: Linea; tono: "azul" | "coral" }) {
  return (
    <a
      href={`tel:${linea.tel}`}
      className={`flex flex-wrap items-center gap-x-[18px] gap-y-2 border-t border-separador px-6 py-4 transition-colors ${
        tono === "azul" ? "hover:bg-surface-sutil" : "hover:bg-[#fff8f4]"
      }`}
    >
      <span className="min-w-[220px] flex-1">
        <span className="block text-[17px] font-bold text-foreground">
          {linea.nombre}
        </span>
        <span className="mt-0.5 block text-[14.5px] leading-snug text-muted">
          {linea.detalle}
        </span>
      </span>
      <span
        className={`inline-flex flex-none items-center gap-2 rounded-full px-4 py-2.5 whitespace-nowrap ${
          tono === "azul"
            ? "bg-[#eaf4ff] text-enlace"
            : "bg-ayuda-soft text-urgente"
        }`}
      >
        <IconoTelefono />
        <span className="text-[17px] font-extrabold">{linea.numero}</span>
      </span>
    </a>
  );
}

/**
 * Bloque de líneas de atención.
 *
 * `prominente` lo pinta como lo primero que se lee en la página, con la lista
 * completa: es lo que se muestra cuando detectamos señales de riesgo. En el
 * modo normal solo van las destacadas, para no ahogar la página en números.
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
      className={`overflow-hidden rounded-card bg-surface shadow-card ${
        prominente ? "border-2 border-alerta" : ""
      }`}
    >
      <div className="px-6 pt-6 pb-4">
        <h2
          className={`text-[20px] font-extrabold tracking-[-.02em] ${
            prominente ? "text-alerta" : "text-foreground"
          }`}
        >
          {titulo ??
            (prominente
              ? "Si estás en peligro ahora, no esperes a un voluntario"
              : "Líneas de atención inmediata")}
        </h2>
        {prominente && (
          <p className="mt-2 text-[15.5px] leading-relaxed">
            Estas líneas atienden ya mismo, gratis y las 24 horas. Tu vida
            importa y hay alguien esperando tu llamada.
          </p>
        )}
      </div>

      <p className={`${ROTULO} text-tenue`}>Para hablar ahora</p>
      {saludMental.map((l) => (
        <Fila key={l.numero} linea={l} tono="azul" />
      ))}

      <p className={`${ROTULO} bg-[#fbfdff] text-urgente`}>
        Emergencias y desastres
      </p>
      {emergencia.map((l) => (
        <Fila key={l.numero} linea={l} tono="coral" />
      ))}
    </section>
  );
}
