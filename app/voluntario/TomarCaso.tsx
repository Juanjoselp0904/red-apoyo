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
      className="rounded-lg bg-dar px-5 py-3 text-white font-semibold disabled:opacity-60"
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
      <div className="rounded-lg border border-dar bg-dar-soft p-4">
        <p className="font-medium">
          El caso es tuyo. Escríbele a {estado.nombre} cuando puedas.
        </p>
        <a
          href={estado.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block rounded-lg bg-dar px-5 py-3 text-white font-semibold"
        >
          Abrir WhatsApp
        </a>
        <p className="text-[14px] text-muted mt-2">
          Si cierras esta pantalla, el caso queda en “Mis casos activos” con el
          enlace listo.
        </p>
      </div>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="requestId" value={requestId} />
      <Boton />
      {estado && !estado.ok && (
        <p role="alert" className="text-[15px] text-alerta mt-2">
          {estado.error}
        </p>
      )}
    </form>
  );
}
