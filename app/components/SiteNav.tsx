"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/recursos", etiqueta: "Líneas de ayuda y recursos" },
  { href: "/doy-ayuda", etiqueta: "Ser voluntario" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-x-[22px] gap-y-2 text-[15px] font-semibold">
      {ENLACES.map(({ href, etiqueta }) => {
        const activo =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className={
              activo
                ? "text-foreground"
                : "text-muted hover:text-foreground transition-colors"
            }
          >
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
