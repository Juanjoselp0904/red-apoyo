import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { cambiarStatus, cerrarSesion } from "@/lib/actions/volunteers";
import { mostrarWhatsapp } from "@/lib/whatsapp";

export const metadata = { title: "Administración — Red de Apoyo" };
export const dynamic = "force-dynamic";

type Voluntario = {
  id: string;
  nombre: string;
  kind: "psicologo" | "escucha";
  ciudad: string | null;
  whatsapp: string;
  bio: string | null;
  credencial_path: string | null;
  status: "pendiente" | "aprobado" | "rechazado" | "suspendido";
  email: string;
  activos: number;
  created_at: string;
};

type Metricas = {
  abiertas: number;
  tomadas: number;
  cerradas: number;
  voluntarios_pendientes: number;
  voluntarios_aprobados: number;
  derivaciones: number;
  reportes_abiertos: number;
};

function Accion({
  id,
  status,
  etiqueta,
  destacado = false,
}: {
  id: string;
  status: string;
  etiqueta: string;
  destacado?: boolean;
}) {
  return (
    <form action={cambiarStatus}>
      <input type="hidden" name="volunteerId" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        className={
          destacado
            ? "rounded-lg bg-dar px-4 py-2.5 text-white font-medium"
            : "rounded-lg border border-line px-4 py-2.5 font-medium"
        }
      >
        {etiqueta}
      </button>
    </form>
  );
}

export default async function Admin() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar");

  const { data: esAdmin } = await supabase.rpc("is_admin");
  if (!esAdmin) redirect("/voluntario");

  const [{ data: voluntariosRaw }, { data: metricasRaw }] = await Promise.all([
    supabase.rpc("admin_voluntarios"),
    supabase.rpc("admin_metricas"),
  ]);

  const voluntarios = (voluntariosRaw ?? []) as Voluntario[];
  const m = ((metricasRaw ?? []) as Metricas[])[0];
  const pendientes = voluntarios.filter((v) => v.status === "pendiente");
  const resto = voluntarios.filter((v) => v.status !== "pendiente");

  // Enlaces firmados de corta vida para revisar las tarjetas profesionales.
  const credenciales = new Map<string, string>();
  for (const v of pendientes) {
    if (!v.credencial_path) continue;
    const { data } = await supabase.storage
      .from("credenciales")
      .createSignedUrl(v.credencial_path, 300);
    if (data?.signedUrl) credenciales.set(v.id, data.signedUrl);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 space-y-10">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Administración</h1>
        <form action={cerrarSesion}>
          <button className="text-[15px] text-muted underline underline-offset-4">
            Salir
          </button>
        </form>
      </div>

      {m && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ["Casos abiertos", m.abiertas],
            ["En acompañamiento", m.tomadas],
            ["Cerrados", m.cerradas],
            ["Derivaciones", m.derivaciones],
          ].map(([etiqueta, valor]) => (
            <div
              key={String(etiqueta)}
              className="rounded-xl border border-line bg-surface p-4"
            >
              <p className="text-2xl font-bold">{valor}</p>
              <p className="text-[14px] text-muted">{etiqueta}</p>
            </div>
          ))}
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold">
          Por aprobar ({pendientes.length})
        </h2>
        {pendientes.length === 0 ? (
          <p className="mt-2 text-muted">Nada pendiente.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {pendientes.map((v) => (
              <li
                key={v.id}
                className="rounded-xl border border-line bg-surface p-5 space-y-3"
              >
                <div>
                  <p className="text-lg font-semibold">
                    {v.nombre}{" "}
                    <span className="text-[15px] font-normal text-muted">
                      · {v.kind === "psicologo" ? "psicólogo(a)" : "escucha"}
                      {v.ciudad ? ` · ${v.ciudad}` : ""}
                    </span>
                  </p>
                  <p className="text-[15px] text-muted">
                    {v.email} · {mostrarWhatsapp(v.whatsapp)}
                  </p>
                </div>
                {v.bio && <p className="text-[15px]">{v.bio}</p>}
                {v.kind === "psicologo" &&
                  (credenciales.get(v.id) ? (
                    <a
                      href={credenciales.get(v.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-[15px] underline underline-offset-4"
                    >
                      Ver tarjeta profesional
                    </a>
                  ) : (
                    <p className="text-[15px] font-medium text-alerta">
                      No adjuntó tarjeta profesional. Verifícala por otro medio
                      antes de aprobarlo como psicólogo(a).
                    </p>
                  ))}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Accion id={v.id} status="aprobado" etiqueta="Aprobar" destacado />
                  <Accion id={v.id} status="rechazado" etiqueta="Rechazar" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold">Todos los voluntarios</h2>
        <ul className="mt-4 divide-y divide-line">
          {resto.map((v) => (
            <li
              key={v.id}
              className="py-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="font-medium">
                  {v.nombre}{" "}
                  <span className="text-[14px] font-normal text-muted">
                    · {v.kind === "psicologo" ? "psicólogo(a)" : "escucha"} ·{" "}
                    {v.status} · {v.activos} activo(s)
                  </span>
                </p>
                <p className="text-[14px] text-muted">{v.email}</p>
              </div>
              <div className="flex gap-2">
                {v.status === "aprobado" ? (
                  <Accion id={v.id} status="suspendido" etiqueta="Suspender" />
                ) : (
                  <Accion id={v.id} status="aprobado" etiqueta="Reactivar" />
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
