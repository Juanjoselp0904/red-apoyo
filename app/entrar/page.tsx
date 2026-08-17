import { redirect } from "next/navigation";
import { Login } from "@/app/components/Login";
import { destinoSegunRol, getSesion } from "@/lib/auth";

export const metadata = { title: "Entrar — Red de Apoyo" };
export const dynamic = "force-dynamic";

/**
 * Única puerta de entrada para voluntarios y admin.
 * Con sesión abierta no muestra nada: resuelve el rol y despacha.
 */
export default async function Entrar({ searchParams }: PageProps<"/entrar">) {
  const { error } = await searchParams;
  const sesion = await getSesion();

  if (sesion.user) redirect(destinoSegunRol(sesion));

  return (
    <div className="mx-auto grid max-w-[560px] gap-[22px] px-6 pt-[34px] pb-14">
      <header className="grid gap-3.5">
        <h1 className="text-[34px] leading-[1.12] font-extrabold tracking-[-.03em] text-foreground">
          Entrar
        </h1>
        <p className="text-[16.5px] leading-relaxed text-muted">
          Para voluntarios y equipo de Red de Apoyo. Si es tu primera vez, al
          entrar te llevamos a crear tu perfil.
        </p>
      </header>

      {error === "enlace" && (
        <p
          role="alert"
          className="rounded-2xl border border-alerta bg-alerta-soft px-5 py-4 text-[15px] text-alerta"
        >
          No pudimos completar el inicio de sesión. Intenta de nuevo.
        </p>
      )}

      <div className="rounded-card bg-surface p-6 shadow-card">
        <Login />
      </div>

      <p className="text-[15px] text-muted">
        ¿Buscas acompañamiento?{" "}
        <a
          href="/necesito-ayuda"
          className="font-semibold text-enlace hover:underline"
        >
          Pide ayuda aquí
        </a>
        , no necesitas cuenta.
      </p>
    </div>
  );
}
