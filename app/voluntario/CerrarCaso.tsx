"use client";

import { useState } from "react";
import { cerrarCaso } from "@/lib/actions/matches";

export function CerrarCaso({ matchId }: { matchId: string }) {
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="text-[15px] text-muted underline underline-offset-4"
      >
        Cerrar este caso
      </button>
    );
  }

  return (
    <form action={cerrarCaso} className="space-y-3 border-t border-line pt-4">
      <input type="hidden" name="matchId" value={matchId} />
      <label className="block">
        <span className="font-medium block mb-1.5">
          ¿Cómo terminó? <span className="text-muted">(opcional)</span>
        </span>
        <textarea
          name="nota"
          rows={2}
          maxLength={600}
          placeholder="Una nota breve para ti y para el equipo."
          className="w-full rounded-lg border border-line bg-surface px-4 py-3"
        />
      </label>
      <label className="flex gap-3 rounded-lg border border-line bg-surface p-4 cursor-pointer">
        <input type="checkbox" name="derivado" className="mt-1.5 size-4 shrink-0" />
        <span className="text-[15px]">
          Detecté una situación de riesgo y la derivé a una línea profesional.
          Marca esto para que el equipo le haga seguimiento.
        </span>
      </label>
      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-foreground px-5 py-3 text-background font-semibold"
        >
          Cerrar caso
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="px-4 py-3 text-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
