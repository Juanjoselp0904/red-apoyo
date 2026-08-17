import type { ReactNode } from "react";
import { iniciales } from "@/lib/iniciales";

export function Avatar({
  nombre,
  grande = false,
  apagado = false,
}: {
  nombre: string;
  grande?: boolean;
  /** Gris en vez de azul: el caso todavía no es de nadie. */
  apagado?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`grid flex-none place-items-center font-extrabold ${
        grande
          ? "size-11 rounded-[14px] text-[16px]"
          : "size-[42px] rounded-[13px] text-[15px]"
      } ${apagado ? "bg-[#f2f5f8] text-tenue" : "bg-[#dceefb] text-enlace"}`}
    >
      {iniciales(nombre)}
    </span>
  );
}

/** Lo que escribió la persona: es lo importante de la tarjeta, no un detalle. */
export function Cita({ children }: { children: ReactNode }) {
  return (
    <blockquote className="rounded-2xl bg-surface-sutil px-[18px] py-4 text-[16.5px] leading-[1.55] text-texto">
      “{children}”
    </blockquote>
  );
}

export function ChipMeta({
  icono,
  children,
}: {
  icono: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-[7px] rounded-full bg-chip px-3 py-[7px] text-[14px] font-semibold text-muted">
      {icono}
      {children}
    </span>
  );
}

export function IconoTelefono() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 3.5h3l1.5 3-2 1.5a8 8 0 004.5 4.5l1.5-2 3 1.5v3H13A10 10 0 013 6.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        opacity=".75"
      />
    </svg>
  );
}

export function IconoCiudad() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 14.5S3 10 3 6.5a5 5 0 0110 0C13 10 8 14.5 8 14.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity=".75"
      />
      <circle cx="8" cy="6.4" r="1.7" fill="currentColor" opacity=".75" />
    </svg>
  );
}
