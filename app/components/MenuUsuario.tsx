"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cerrarSesion } from "@/lib/actions/volunteers";
import { iniciales } from "@/lib/iniciales";

export function MenuUsuario({
  nombre,
  email,
  esAdmin,
  tieneFicha,
}: {
  nombre: string;
  email: string;
  esAdmin: boolean;
  tieneFicha: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const disparador = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;

    function alClic(e: MouseEvent) {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    }
    function alTeclear(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAbierto(false);
        disparador.current?.focus();
      }
    }

    document.addEventListener("mousedown", alClic);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("mousedown", alClic);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto]);

  const item =
    "block rounded-lg px-3 py-2.5 text-[15px] font-semibold text-texto transition-colors hover:bg-surface-sutil";

  return (
    <div ref={contenedor} className="relative ml-auto sm:ml-0">
      <button
        ref={disparador}
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-surface"
      >
        <span className="sr-only">Tu cuenta</span>
        <span
          aria-hidden
          className="grid size-9 place-items-center rounded-full bg-[#dceefb] text-[13px] font-extrabold text-enlace"
        >
          {iniciales(nombre)}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M2.5 4.5L6 8l3.5-3.5"
            fill="none"
            stroke="#7d9ab5"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {abierto && (
        <div
          role="menu"
          // El ancho se recorta al viewport para que nunca se salga por el
          // borde izquierdo en pantallas angostas.
          className="absolute top-[calc(100%+8px)] right-0 z-50 w-[248px] max-w-[calc(100vw-3rem)] rounded-2xl border border-line bg-surface p-2 shadow-[0_18px_44px_rgba(41,98,168,.16)]"
        >
          <div className="border-b border-separador px-3 pt-1.5 pb-3">
            <p className="truncate font-bold text-foreground">{nombre}</p>
            <p className="truncate text-[13.5px] text-tenue">{email}</p>
          </div>

          <div className="pt-2">
            {esAdmin && (
              <Link
                href="/admin"
                role="menuitem"
                className={item}
                onClick={() => setAbierto(false)}
              >
                Administración
              </Link>
            )}
            <Link
              href={tieneFicha ? "/voluntario" : "/doy-ayuda/registro"}
              role="menuitem"
              className={item}
              onClick={() => setAbierto(false)}
            >
              {tieneFicha ? "Mi panel" : "Crear mi perfil"}
            </Link>
            <form action={cerrarSesion}>
              <button role="menuitem" className={`${item} w-full text-left`}>
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
