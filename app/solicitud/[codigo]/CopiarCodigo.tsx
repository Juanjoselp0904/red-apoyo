"use client";

import { useEffect, useState } from "react";

export function CopiarCodigo({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(t);
  }, [copiado]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
    } catch {
      // Sin permiso de portapapeles: el código sigue visible para copiarlo a mano.
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      aria-live="polite"
      className="inline-flex flex-none items-center gap-2.5 rounded-full bg-ayuda px-[22px] py-3.5 text-[15.5px] font-bold whitespace-nowrap text-white shadow-boton transition-colors hover:bg-ayuda-hover"
    >
      {copiado ? (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            d="M3.5 9.5l3.5 3.5 7.5-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <rect
            x="6"
            y="6"
            width="9.5"
            height="9.5"
            rx="2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M12 4.5A2.5 2.5 0 009.5 2h-5A2.5 2.5 0 002 4.5v5A2.5 2.5 0 004.5 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      )}
      {copiado ? "Copiado" : "Copiar código"}
    </button>
  );
}
