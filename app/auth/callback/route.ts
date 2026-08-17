import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Canje del código de OAuth por una sesión en cookies.
 * Siempre devuelve a /entrar, que resuelve el rol y despacha.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/entrar?error=enlace`);
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/entrar?error=enlace`);
  }

  return NextResponse.redirect(`${origin}/entrar`);
}
