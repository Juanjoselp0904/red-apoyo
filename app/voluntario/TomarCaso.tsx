"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { tomarCaso, type ResultadoTomar } from "@/lib/actions/matches";

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex flex-none items-center rounded-full bg-ayuda px-6 py-3.5 text-[15.5px] font-bold whitespace-nowrap text-white shadow-boton transition-colors hover:bg-ayuda-hover disabled:opacity-60"
    >
      {pending ? "Tomando…" : "Tomar este caso"}
    </button>
  );
}

export function TomarCaso({ requestId }: { requestId: string }) {
  const [estado, action] = useActionState<ResultadoTomar | null, FormData>(
    tomarCaso,
    null,
  );

  if (estado?.ok) {
    return (
      <div className="rounded-2xl bg-[#e9f7f2] px-[18px] py-4">
        <p className="font-semibold text-foreground">
          El caso es tuyo. Escríbele a {estado.nombre} cuando puedas.
        </p>
        <a
          href={estado.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex flex-none items-center gap-2.5 rounded-full bg-wa px-[22px] py-3.5 text-[15.5px] font-bold whitespace-nowrap text-white shadow-wa transition-colors hover:bg-wa-hover"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M9 1.8a7.2 7.2 0 00-6.1 11l-1 4.1 4.2-1.1A7.2 7.2 0 109 1.8z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          Abrir WhatsApp
        </a>
        <p className="mt-2.5 text-[13.5px] font-semibold text-muted">
          Si cierras esta pantalla, el caso queda en “Mis casos activos” con el
          enlace listo.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-x-[18px] gap-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      <Boton />
      <span className="text-[13.5px] font-semibold text-[var(--tenue)]">
        El contacto se revela al tomarlo
      </span>
      {estado && !estado.ok && (
        <p role="alert" className="w-full text-[15px] font-semibold text-alerta">
          {estado.error}
        </p>
      )}
    </form>
  );
}
