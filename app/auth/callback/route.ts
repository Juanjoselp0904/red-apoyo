import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** Destinos permitidos tras iniciar sesión. Nunca redirigimos a una URL externa. */
const DESTINOS = ["/voluntario", "/doy-ayuda/registro", "/admin"];

/** Canje del enlace mágico por una sesión en cookies. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const cookieStore = await cookies();
  const guardado = cookieStore.get("post_login_next")?.value;
  const next = DESTINOS.includes(decodeURIComponent(guardado ?? ""))
    ? decodeURIComponent(guardado!)
    : "/voluntario";

  if (!code) {
    return NextResponse.redirect(`${origin}/doy-ayuda/registro?error=enlace`);
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/doy-ayuda/registro?error=enlace`);
  }

  const respuesta = NextResponse.redirect(`${origin}${next}`);
  respuesta.cookies.delete("post_login_next");
  return respuesta;
}
