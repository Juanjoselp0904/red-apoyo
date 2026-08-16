import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { cerrarSesion } from "@/lib/actions/volunteers";
import { linkWhatsapp, mostrarWhatsapp } from "@/lib/whatsapp";
import { TomarCaso } from "./TomarCaso";
import { CerrarCaso } from "./CerrarCaso";

export const metadata = { title: "Panel de voluntario — Red de Apoyo" };
export const dynamic = "force-dynamic";

type Caso = {
  id: string;
  codigo: string;
  nombre: string;
  ciudad: string | null;
  kind: "psicologo" | "escucha";
  urgencia: "urgente" | "pronto" | "puedo_esperar";
  mensaje: string | null;
  created_at: string;
};

type MiCaso = {
  match_id: string;
  codigo: string;
  nombre: string;
  whatsapp: string;
  mensaje: string | null;
  urgencia: string;
  ciudad: string | null;
  tomado_at: string;
};

const URGENCIA_TEXTO: Record<string, string> = {
  urgente: "Lo necesita hoy",
  pronto: "En los próximos días",
  puedo_esperar: "Puede esperar",
};

function haceCuanto(iso: string) {
  const horas = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (horas < 1) return "hace menos de una hora";
  if (horas < 24) return `hace ${horas} h`;
  return `hace ${Math.floor(horas / 24)} días`;
}

export default async function Voluntario() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/doy-ayuda/registro");

  const { data: perfil } = await supabase
    .from("volunteers")
    .select("nombre, kind, status, cupo_max")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!perfil) redirect("/doy-ayuda/registro");

  const encabezado = (
    <div className="flex items-baseline justify-between gap-4">
      <h1 className="text-3xl font-bold tracking-tight">
        Hola, {perfil.nombre}
      </h1>
      <form action={cerrarSesion}>
        <button className="text-[15px] text-muted underline underline-offset-4">
          Salir
        </button>
      </form>
    </div>
  );

  if (perfil.status !== "aprobado") {
    const mensajes: Record<string, string> = {
      pendiente:
        "Tu perfil está en revisión. Te avisamos por correo apenas quede aprobado. Gracias por la paciencia — revisamos uno por uno para cuidar a quien pide ayuda.",
      rechazado:
        "Por ahora no pudimos aprobar tu perfil. Si crees que hubo un error, escríbenos.",
      suspendido:
        "Tu cuenta está suspendida. Escríbenos si crees que se trata de un error.",
    };
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 space-y-6">
        {encabezado}
        <div className="rounded-xl border border-line bg-surface p-5">
          <p>{mensajes[perfil.status]}</p>
        </div>
        <Link
          href="/doy-ayuda/registro"
          className="inline-block text-[15px] underline underline-offset-4"
        >
          Ver o corregir mi perfil
        </Link>
      </div>
    );
  }

  const [{ data: casosRaw }, { data: miosRaw }] = await Promise.all([
    supabase.rpc("casos_disponibles"),
    supabase.rpc("mis_casos"),
  ]);

  const disponibles = (casosRaw ?? []) as Caso[];
  const activos = (miosRaw ?? []) as MiCaso[];
  const cupoLleno = activos.length >= (perfil.cupo_max ?? 3);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 space-y-10">
      {encabezado}

      <section>
        <h2 className="text-xl font-semibold">
          Mis casos activos ({activos.length}/{perfil.cupo_max})
        </h2>
        {activos.length === 0 ? (
          <p className="mt-2 text-muted">
            No tienes casos activos. Toma uno de la lista de abajo cuando
            tengas tiempo real para acompañar.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {activos.map((c) => (
              <li
                key={c.match_id}
                className="rounded-xl border border-line bg-surface p-5 space-y-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-lg font-semibold">{c.nombre}</span>
                  <span className="text-[14px] text-muted">
                    {c.codigo} · {haceCuanto(c.tomado_at)}
                  </span>
                </div>
                {c.mensaje && <p className="text-[15px]">{c.mensaje}</p>}
                <p className="text-[15px] text-muted">
                  {mostrarWhatsapp(c.whatsapp)}
                  {c.ciudad ? ` · ${c.ciudad}` : ""}
                </p>
                <a
                  href={linkWhatsapp(
                    c.whatsapp,
                    c.nombre,
                    perfil.nombre,
                    perfil.kind,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg bg-dar px-5 py-3 text-white font-semibold"
                >
                  Escribir por WhatsApp
                </a>
                <CerrarCaso matchId={c.match_id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold">Casos esperando</h2>
        <p className="mt-1 text-[15px] text-muted">
          Toma solo los que sientas que puedes acompañar. Si alguien necesita
          algo que se sale de tu alcance, déjalo para otro voluntario o
          ciérralo marcando la derivación. El número de contacto aparece
          únicamente cuando tomas el caso.
        </p>

        {cupoLleno && (
          <p className="mt-4 rounded-lg border border-line bg-surface px-4 py-3 text-[15px]">
            Llegaste a tu tope de casos activos. Cierra alguno para tomar otro
            — acompañar bien a pocos vale más que a muchos a medias.
          </p>
        )}

        {disponibles.length === 0 ? (
          <p className="mt-4 text-muted">
            No hay casos abiertos en este momento. Vuelve más tarde.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {disponibles.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-line bg-surface p-5 space-y-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-lg font-semibold">{c.nombre}</span>
                  <span className="text-[14px] text-muted">
                    {haceCuanto(c.created_at)}
                  </span>
                </div>
                <p className="text-[15px] text-muted">
                  {URGENCIA_TEXTO[c.urgencia]}
                  {c.ciudad ? ` · ${c.ciudad}` : ""}
                </p>
                {c.mensaje && <p className="text-[15px]">{c.mensaje}</p>}
                {!cupoLleno && <TomarCaso requestId={c.id} />}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/recursos"
        className="block text-[15px] underline underline-offset-4"
      >
        Guía de acompañamiento y líneas de derivación
      </Link>
    </div>
  );
}
