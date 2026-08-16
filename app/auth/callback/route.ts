import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** Canje del enlace mágico por una sesión en cookies. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/voluntario";

  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/doy-ayuda/registro?error=enlace`);
}
