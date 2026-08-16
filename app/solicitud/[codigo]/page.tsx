import Link from "next/link";
import { notFound } from "next/navigation";
import { LineasCrisis } from "@/app/components/LineasCrisis";
import { cancelarSolicitud } from "@/lib/actions/requests";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Tu solicitud — Red de Apoyo" };
export const dynamic = "force-dynamic";

type Estado = {
  codigo: string;
  nombre: string;
  kind: "psicologo" | "escucha";
  urgencia: string;
  status: "abierta" | "tomada" | "cerrada" | "cancelada";
  created_at: string;
  voluntario_nombre: string | null;
  voluntario_kind: "psicologo" | "escucha" | null;
  tomado_at: string | null;
};

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

  const rol =
    data.voluntario_kind === "psicologo"
      ? "psicólogo(a) voluntario(a)"
      : "voluntario(a) de escucha";

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 space-y-8">
      {riesgo && <LineasCrisis prominente />}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {data.status === "abierta" && "Recibimos tu solicitud"}
          {data.status === "tomada" && "Alguien va a escribirte"}
          {data.status === "cerrada" && "Este acompañamiento ya terminó"}
          {data.status === "cancelada" && "Cancelaste esta solicitud"}
        </h1>

        <p className="mt-3 text-muted">
          {data.status === "abierta" && (
            <>
              Estás en la lista, {data.nombre}. Un voluntario tomará tu caso y
              te escribirá por WhatsApp. Puede tomar unas horas: somos
              personas, no un sistema automático.
            </>
          )}
          {data.status === "tomada" && (
            <>
              <strong className="text-foreground">
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
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        <p className="text-[15px] text-muted">Tu código de seguimiento</p>
        <p className="text-3xl font-bold tracking-wider mt-1">{data.codigo}</p>
        <p className="text-[14px] text-muted mt-3">
          Guárdalo o toma una foto de esta pantalla. Con él puedes volver a
          ver el estado de tu solicitud desde cualquier teléfono.
        </p>
      </div>

      {data.status === "abierta" && (
        <form action={cancelarSolicitud}>
          <input type="hidden" name="codigo" value={data.codigo} />
          <button
            type="submit"
            className="text-[15px] text-muted underline underline-offset-4"
          >
            Ya no necesito ayuda, cancelar mi solicitud
          </button>
        </form>
      )}

      {(data.status === "cerrada" || data.status === "cancelada") && (
        <Link
          href="/necesito-ayuda"
          className="inline-block rounded-xl bg-ayuda px-6 py-4 text-white font-semibold"
        >
          Pedir acompañamiento otra vez
        </Link>
      )}

      {!riesgo && <LineasCrisis />}
    </div>
  );
}
