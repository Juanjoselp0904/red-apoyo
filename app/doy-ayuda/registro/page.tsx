import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { LoginMagicLink } from "./LoginMagicLink";
import { FormVoluntario } from "./FormVoluntario";

export const metadata = { title: "Registro de voluntario — Red de Apoyo" };
export const dynamic = "force-dynamic";

export default async function Registro() {
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
          Entra con tu correo
        </h1>
        <p className="mt-3 text-muted">
          Usamos tu correo solo para identificarte y avisarte. No lo
          compartimos con nadie.
        </p>
        <div className="mt-8">
          <LoginMagicLink next="/doy-ayuda/registro" />
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
