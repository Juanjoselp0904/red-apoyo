import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { cerrarSesion } from "@/lib/actions/volunteers";
import { linkWhatsapp, mostrarWhatsapp } from "@/lib/whatsapp";
import { Avatar, Cita, ChipMeta, IconoCiudad, IconoTelefono } from "./piezas";
import { TomarCaso } from "./TomarCaso";
import { CerrarCaso } from "./CerrarCaso";

export const metadata = { title: "Panel de voluntario — Red de Apoyo" };
export const dynamic = "force-dynamic";

type Caso = {
  id: string;
  codigo: string;
  nombre: string;
  ciudad: string | null;
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

const CARD = "rounded-[22px] bg-surface shadow-card";
const H2 = "text-[20px] font-extrabold tracking-[-.02em] text-foreground";
const CODIGO =
  "flex-none whitespace-nowrap rounded-lg border border-chip-borde bg-chip px-[11px] py-1.5 font-mono text-[12.5px] font-semibold text-muted";

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
    <header className="flex flex-wrap items-center gap-x-6 gap-y-3.5">
      <div className="mr-auto flex items-center gap-3">
        <Avatar nombre={perfil.nombre} grande />
        <div className="grid gap-0.5">
          <h1 className="text-[21px] font-extrabold tracking-[-.02em] text-foreground">
            Hola, {perfil.nombre}
          </h1>
          <p className="text-[13.5px] font-semibold text-tenue">
            Voluntario · acompañamiento emocional
          </p>
        </div>
      </div>
      <form action={cerrarSesion}>
        <button className="rounded-full bg-surface px-[18px] py-2.5 text-[15px] font-bold whitespace-nowrap text-muted shadow-pill transition-colors hover:text-foreground">
          Salir
        </button>
      </form>
    </header>
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
      <div className="mx-auto grid max-w-[1180px] gap-[22px] px-6 pt-2 pb-14">
        {encabezado}
        <div className={`${CARD} p-6`}>
          <p className="text-[16px] leading-relaxed">
            {mensajes[perfil.status]}
          </p>
        </div>
        <Link
          href="/doy-ayuda/registro"
          className="justify-self-start text-[15px] font-semibold text-enlace hover:underline"
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
  const cupo = perfil.cupo_max ?? 3;
  const libres = Math.max(0, cupo - activos.length);
  const cupoLleno = libres === 0;

  return (
    <div className="mx-auto grid max-w-[1180px] gap-[22px] px-6 pt-2 pb-14">
      {encabezado}

      {/* Capacidad: el límite se entiende antes de mirar la lista. */}
      <section
        className={`${CARD} flex flex-wrap items-center gap-x-[26px] gap-y-4 px-6 py-5`}
      >
        <div className="mr-auto grid gap-1">
          <span className="text-[13px] font-bold tracking-[.06em] text-tenue uppercase">
            Tu capacidad
          </span>
          <span className="text-[17px] font-bold text-foreground">
            {activos.length} de {cupo} casos activos
          </span>
        </div>
        <div className="flex gap-2" aria-hidden>
          {Array.from({ length: cupo }, (_, i) => (
            <span
              key={i}
              className={`h-2.5 w-[46px] rounded-full ${
                i < activos.length ? "bg-ayuda" : "bg-line-fuerte"
              }`}
            />
          ))}
        </div>
        <span className="text-[14px] font-semibold text-muted">
          {cupoLleno
            ? "Llegaste a tu tope"
            : `Puedes tomar ${libres} más`}
        </span>
      </section>

      <section className="grid gap-3.5">
        <h2 className={H2}>
          Mis casos activos{" "}
          <span className="font-bold text-tenue">
            ({activos.length}/{cupo})
          </span>
        </h2>

        {activos.length === 0 ? (
          <p className={`${CARD} px-6 py-5 text-muted`}>
            No tienes casos activos. Toma uno de la lista de abajo cuando
            tengas tiempo real para acompañar.
          </p>
        ) : (
          activos.map((c) => (
            <article
              key={c.match_id}
              className={`${CARD} grid overflow-hidden`}
            >
              <div className="h-1 bg-ayuda" />
              <div className="grid gap-[18px] p-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <Avatar nombre={c.nombre} />
                  <h3 className="mr-auto text-[18px] font-extrabold tracking-[-.01em] text-foreground">
                    {c.nombre}
                  </h3>
                  <span className={CODIGO}>{c.codigo}</span>
                  <span className="text-[13.5px] font-semibold text-tenue">
                    {haceCuanto(c.tomado_at)}
                  </span>
                </div>

                {c.mensaje && <Cita>{c.mensaje}</Cita>}

                <div className="flex flex-wrap gap-2.5">
                  <ChipMeta icono={<IconoTelefono />}>
                    {mostrarWhatsapp(c.whatsapp)}
                  </ChipMeta>
                  {c.ciudad && (
                    <ChipMeta icono={<IconoCiudad />}>{c.ciudad}</ChipMeta>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-[18px] gap-y-3 pt-1">
                  <a
                    href={linkWhatsapp(
                      c.whatsapp,
                      c.nombre,
                      perfil.nombre,
                      perfil.kind,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-none items-center gap-2.5 rounded-full bg-wa px-[22px] py-3.5 text-[15.5px] font-bold whitespace-nowrap text-white shadow-wa transition-colors hover:bg-wa-hover"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                      <path
                        d="M9 1.8a7.2 7.2 0 00-6.1 11l-1 4.1 4.2-1.1A7.2 7.2 0 109 1.8z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Escribir por WhatsApp
                  </a>
                  <CerrarCaso matchId={c.match_id} />
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="grid gap-3.5">
        <div className="grid max-w-[78ch] gap-2">
          <h2 className={H2}>Casos esperando</h2>
          <p className="text-[15.5px] leading-relaxed text-pretty text-muted">
            Toma solo los que sientas que puedes acompañar. Si alguien necesita
            algo que se sale de tu alcance, déjalo para otro voluntario o
            ciérralo marcando la derivación. El número de contacto aparece
            únicamente cuando tomas el caso.
          </p>
        </div>

        {cupoLleno && (
          <p className={`${CARD} px-6 py-5 text-[15.5px]`}>
            Llegaste a tu tope de casos activos. Cierra alguno para tomar otro
            — acompañar bien a pocos vale más que a muchos a medias.
          </p>
        )}

        {disponibles.length === 0 ? (
          <p className={`${CARD} px-6 py-5 text-muted`}>
            No hay casos abiertos en este momento. Vuelve más tarde.
          </p>
        ) : (
          disponibles.map((c) => (
            <article
              key={c.id}
              className={`${CARD} grid gap-4 border border-line p-6`}
            >
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-3">
                <Avatar nombre={c.nombre} apagado />
                <h3 className="text-[18px] font-extrabold tracking-[-.01em] text-foreground">
                  {c.nombre}
                </h3>
                {c.urgencia === "urgente" ? (
                  <span className="inline-flex flex-none items-center gap-[7px] rounded-full bg-ayuda-soft px-3 py-1.5 text-[13px] font-bold whitespace-nowrap text-urgente">
                    <span className="size-[7px] rounded-full bg-ayuda-icono" />
                    {URGENCIA_TEXTO[c.urgencia]}
                  </span>
                ) : (
                  <span className="text-[13.5px] font-semibold text-tenue">
                    {URGENCIA_TEXTO[c.urgencia]}
                  </span>
                )}
                <span className="ml-auto text-[13.5px] font-semibold text-tenue">
                  {haceCuanto(c.created_at)}
                </span>
              </div>

              {c.mensaje && <Cita>{c.mensaje}</Cita>}

              {c.ciudad && (
                <div className="flex flex-wrap gap-2.5">
                  <ChipMeta icono={<IconoCiudad />}>{c.ciudad}</ChipMeta>
                </div>
              )}

              {!cupoLleno && <TomarCaso requestId={c.id} />}
            </article>
          ))
        )}
      </section>

      <Link
        href="/recursos"
        className="justify-self-start text-[15px] font-semibold text-enlace hover:underline"
      >
        Guía de acompañamiento y líneas de derivación
      </Link>
    </div>
  );
}
