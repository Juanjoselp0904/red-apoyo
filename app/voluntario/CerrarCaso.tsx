"use client";

import { useState } from "react";
import { cerrarCaso } from "@/lib/actions/matches";

export function CerrarCaso({ matchId }: { matchId: string }) {
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="text-[15px] font-bold whitespace-nowrap text-muted transition-colors hover:text-foreground"
      >
        Cerrar este caso
      </button>
    );
  }

  return (
    <form
      action={cerrarCaso}
      className="w-full space-y-3.5 border-t border-line pt-5"
    >
      <input type="hidden" name="matchId" value={matchId} />
      <label className="block">
        <span className="mb-1.5 block font-semibold text-foreground">
          ¿Cómo terminó? <span className="font-normal text-muted">(opcional)</span>
        </span>
        <textarea
          name="nota"
          rows={2}
          maxLength={600}
          placeholder="Una nota breve para ti y para el equipo."
          className="w-full rounded-[14px] border-[1.5px] border-line-fuerte bg-surface-sutil px-4 py-3"
        />
      </label>
      <label className="flex cursor-pointer gap-3 rounded-[14px] bg-surface-sutil p-4">
        <input type="checkbox" name="derivado" className="mt-1.5 size-4 shrink-0" />
        <span className="text-[15px]">
          Detecté una situación de riesgo y la derivé a una línea profesional.
          Marca esto para que el equipo le haga seguimiento.
        </span>
      </label>
      <div className="flex flex-wrap items-center gap-x-[18px] gap-y-3">
        <button
          type="submit"
          className="inline-flex flex-none items-center rounded-full bg-foreground px-6 py-3.5 text-[15.5px] font-bold whitespace-nowrap text-white"
        >
          Cerrar caso
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="text-[15px] font-bold text-muted transition-colors hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
