"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export function LoginMagicLink({ next = "/voluntario" }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "listo">("idle");
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    setError(null);

    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setError("No pudimos enviar el enlace. Revisa el correo e intenta otra vez.");
      setEstado("idle");
      return;
    }
    setEstado("listo");
  }

  if (estado === "listo") {
    return (
      <div className="rounded-xl border border-line bg-dar-soft p-5">
        <h2 className="font-semibold">Revisa tu correo</h2>
        <p className="mt-1.5 text-[15px]">
          Te enviamos un enlace a <strong>{email}</strong>. Ábrelo desde este
          mismo teléfono o computador para continuar. Si no llega en unos
          minutos, mira en spam.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label htmlFor="email" className="block font-medium mb-1.5">
          Tu correo electrónico
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@ejemplo.com"
          className="w-full rounded-lg border border-line bg-surface px-4 py-3"
        />
        <p className="text-[14px] text-muted mt-1">
          Sin contraseña: te llega un enlace para entrar.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-alerta text-[15px]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="w-full rounded-xl bg-dar px-6 py-4 text-white text-lg font-semibold disabled:opacity-60"
      >
        {estado === "enviando" ? "Enviando…" : "Enviarme el enlace"}
      </button>
    </form>
  );
}
