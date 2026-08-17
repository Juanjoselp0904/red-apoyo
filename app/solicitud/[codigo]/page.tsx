import Link from "next/link";
import { notFound } from "next/navigation";
import { LineasCrisis } from "@/app/components/LineasCrisis";
import { cancelarSolicitud } from "@/lib/actions/requests";
import { supabaseServer } from "@/lib/supabase/server";
import { CopiarCodigo } from "./CopiarCodigo";

export const metadata = { title: "Tu solicitud — Red de Apoyo" };
export const dynamic = "force-dynamic";

type Estado = {
  codigo: string;
  nombre: string;
  kind: "psicologo" | "escucha" | null;
  urgencia: string;
  status: "abierta" | "tomada" | "cerrada" | "cancelada";
  created_at: string;
  voluntario_nombre: string | null;
  voluntario_kind: "psicologo" | "escucha" | null;
  tomado_at: string | null;
};

const PASOS = [
  "Solicitud recibida",
  "Un voluntario la toma",
  "Te escribe por WhatsApp",
];

/** Cuántos pasos van cumplidos según el estado. `null` = no mostrar progreso. */
const AVANCE: Record<Estado["status"], number | null> = {
  abierta: 1,
  tomada: 2,
  cerrada: 3,
  cancelada: null,
};

const TITULO: Record<Estado["status"], string> = {
  abierta: "Recibimos tu solicitud",
  tomada: "Alguien va a escribirte",
  cerrada: "Este acompañamiento ya terminó",
  cancelada: "Cancelaste esta solicitud",
};

function Marca({ cancelada }: { cancelada: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid size-[46px] flex-none place-items-center rounded-full ${
        cancelada ? "bg-chip text-tenue" : "bg-ok-soft text-ok"
      }`}
    >
      {cancelada ? (
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path
            d="M7 12h10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path
            d="M5 12.5l4.5 4.5L19 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

export default async function Solicitud({
  params,
  searchParams,
}: PageProps<"/solicitud/[codigo]">) {
  const { codigo } = await params;
  const { riesgo } = await searchParams;

  const supabase = await supabaseServer();
  const { data } = await supabase
    .rpc("estado_solicitud", { p_codigo: codigo })
    .maybeSingle<Estado>();

  if (!data) notFound();

  const avance = AVANCE[data.status];
  const rol =
    data.voluntario_kind === "psicologo"
      ? "psicólogo(a) voluntario(a)"
      : "voluntario(a) de escucha";

  return (
    <div className="mx-auto grid max-w-[900px] gap-[22px] px-6 pt-[34px] pb-14">
      {riesgo && <LineasCrisis prominente />}

      <header className="grid gap-3.5">
        <div className="flex items-center gap-3.5">
          <Marca cancelada={data.status === "cancelada"} />
          <h1 className="text-[34px] leading-[1.12] font-extrabold tracking-[-.03em] text-balance text-foreground">
            {TITULO[data.status]}
          </h1>
        </div>
        <p className="max-w-[52ch] text-[16.5px] leading-relaxed text-muted">
          {data.status === "abierta" && (
            <>
              Estás en la lista, {data.nombre}. Un voluntario tomará tu caso y
              te escribirá por WhatsApp.
            </>
          )}
          {data.status === "tomada" && (
            <>
              <strong className="font-bold text-foreground">
                {data.voluntario_nombre}
              </strong>
              , {rol}, tomó tu caso. Te va a escribir por WhatsApp desde su
              número personal. Si no reconoces el mensaje, pregúntale por este
              código antes de responder.
            </>
          )}
          {data.status === "cerrada" &&
            "Si vuelves a necesitar hablar, puedes pedir acompañamiento otra vez cuando quieras."}
          {data.status === "cancelada" &&
            "Si cambias de opinión, puedes pedir acompañamiento de nuevo cuando quieras."}
        </p>
      </header>

      <section className="overflow-hidden rounded-card bg-surface shadow-card">
        {avance !== null && (
          <ol className="grid grid-cols-3 gap-x-3 px-6 pt-6 pb-5">
            {PASOS.map((paso, i) => {
              const cumplido = i < avance;
              return (
                <li key={paso} className="grid gap-2.5">
                  <span
                    aria-hidden
                    className={`h-1.5 w-full rounded-full ${
                      cumplido ? "bg-ayuda" : "bg-line-fuerte"
                    }`}
                  />
                  <span
                    className={`text-center text-[13.5px] font-bold text-balance ${
                      cumplido ? "text-foreground" : "text-tenue"
                    }`}
                    aria-current={i === avance - 1 ? "step" : undefined}
                  >
                    {paso}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <div
          className={`grid gap-4 px-6 py-6 ${avance !== null ? "border-t border-separador" : ""}`}
        >
          <span className="text-[12.5px] font-bold tracking-[.1em] text-tenue uppercase">
            Tu código de seguimiento
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3.5">
            <span className="rounded-2xl border-[1.5px] border-dashed border-codigo-borde bg-codigo-bg px-5 py-3 font-mono text-[34px] font-bold whitespace-nowrap text-foreground">
              {data.codigo}
            </span>
            <CopiarCodigo codigo={data.codigo} />
          </div>
          <p className="max-w-[56ch] text-[15.5px] leading-relaxed text-muted">
            Guárdalo o toma una foto de esta pantalla. Con él puedes volver a
            ver el estado de tu solicitud desde cualquier teléfono.
          </p>
        </div>
      </section>

      {data.status === "abierta" && (
        <form action={cancelarSolicitud}>
          <input type="hidden" name="codigo" value={data.codigo} />
          <button
            type="submit"
            className="text-[15px] font-semibold text-tenue transition-colors hover:text-urgente"
          >
            Ya no necesito ayuda, cancelar mi solicitud
          </button>
        </form>
      )}

      {(data.status === "cerrada" || data.status === "cancelada") && (
        <Link
          href="/necesito-ayuda"
          className="inline-flex flex-none items-center justify-self-start rounded-full bg-ayuda px-7 py-4 text-[15.5px] font-bold whitespace-nowrap text-white shadow-boton transition-colors hover:bg-ayuda-hover"
        >
          Pedir acompañamiento otra vez
        </Link>
      )}

      {!riesgo && <LineasCrisis />}
    </div>
  );
}
