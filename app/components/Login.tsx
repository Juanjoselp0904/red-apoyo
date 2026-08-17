"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

function LogoGoogle() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84a10.13 10.13 0 01-4.4 6.65v5.52h7.12c4.16-3.83 6.56-9.47 6.56-16.18z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.12-5.52c-1.97 1.32-4.49 2.1-7.44 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7A22 22 0 0024 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18A13.2 13.2 0 0111 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A22 22 0 002 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

/**
 * Botón de entrada. Siempre vuelve a /entrar, que es quien resuelve el rol
 * y despacha al panel correspondiente.
 */
export function Login() {
  const [conectando, setConectando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function entrarConGoogle() {
    setConectando(true);
    setError(null);

    const { error } = await supabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError("No pudimos conectarte con Google. Intenta de nuevo.");
      setConectando(false);
    }
    // Si sale bien, el navegador ya va camino a Google.
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={entrarConGoogle}
        disabled={conectando}
        className="flex w-full items-center justify-center gap-3 rounded-xl border-[1.5px] border-line-fuerte bg-surface px-6 py-4 text-lg font-semibold text-foreground transition-colors hover:border-ayuda hover:bg-[#f5f9fe] disabled:opacity-60"
      >
        <LogoGoogle />
        {conectando ? "Conectando…" : "Continuar con Google"}
      </button>

      {error && (
        <p role="alert" className="text-[15px] text-alerta">
          {error}
        </p>
      )}

      <p className="text-[14px] text-muted">
        Usamos tu cuenta solo para identificarte. No publicamos nada ni
        accedemos a tus contactos.
      </p>
    </div>
  );
}
