import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Login } from "@/app/components/Login";
import { FormVoluntario } from "./FormVoluntario";

export const metadata = { title: "Registro de voluntario — Red de Apoyo" };
export const dynamic = "force-dynamic";

export default async function Registro({
  searchParams,
}: PageProps<"/doy-ayuda/registro">) {
  const { error } = await searchParams;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-5 py-10">
        <Link href="/doy-ayuda" className="text-[15px] text-muted underline underline-offset-4">
          ← Volver
        </Link>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          Entra para ser voluntario
        </h1>
        <p className="mt-3 text-muted">
          Con tu cuenta de Google. Es solo para identificarte y avisarte
          cuando aprobemos tu perfil.
        </p>
        {error === "enlace" && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-alerta bg-alerta-soft px-4 py-3 text-[15px] text-alerta"
          >
            No pudimos completar el inicio de sesión. Intenta de nuevo.
          </p>
        )}

        <div className="mt-8">
          {/*
            Siempre a /voluntario: esa página decide si mandar al registro,
            y solo lo hace cuando no hay ficha en volunteers.
          */}
          <Login next="/voluntario" />
        </div>
      </div>
    );
  }

  const { data: perfil } = await supabase
    .from("volunteers")
    .select("nombre, kind, ciudad, whatsapp, bio")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/doy-ayuda" className="text-[15px] text-muted underline underline-offset-4">
        ← Volver
      </Link>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">
        {perfil ? "Actualiza tu perfil" : "Tu perfil de voluntario"}
      </h1>
      <p className="mt-3 text-muted">
        Un administrador lo revisa antes de darte acceso a los casos. Te
        avisamos por correo.
      </p>

      <div className="mt-8">
        <FormVoluntario
          userId={user.id}
          inicial={
            perfil
              ? {
                  nombre: perfil.nombre ?? "",
                  kind: perfil.kind ?? "escucha",
                  ciudad: perfil.ciudad ?? "",
                  whatsapp: perfil.whatsapp ?? "",
                  bio: perfil.bio ?? "",
                  credencialPath: "",
                }
              : null
          }
        />
      </div>
    </div>
  );
}
