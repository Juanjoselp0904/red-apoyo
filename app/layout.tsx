import type { Metadata } from "next";
import Link from "next/link";
import { Manrope } from "next/font/google";
import { SiteNav } from "./components/SiteNav";
import { MenuUsuario } from "./components/MenuUsuario";
import { getSesion } from "@/lib/auth";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans-app",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Red de Apoyo — acompañamiento tras el terremoto",
  description:
    "Conectamos a quienes están pasando por un momento difícil tras el terremoto con psicólogos voluntarios y personas dispuestas a escuchar.",
};

/** Marca de la cabecera: dos círculos que se acompañan. */
function Logo() {
  return (
    <Link href="/" className="mr-auto flex items-center gap-3">
      <span className="grid size-[38px] place-items-center rounded-xl bg-ayuda shadow-[0_6px_14px_rgba(61,156,245,.35)]">
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="7" cy="8" r="3.4" fill="#fff" opacity=".95" />
          <circle cx="13" cy="12" r="3.4" fill="#fff" opacity=".7" />
        </svg>
      </span>
      <span className="text-[19px] font-extrabold tracking-[-.02em] text-foreground">
        Red de Apoyo
      </span>
    </Link>
  );
}

/**
 * Acceso de voluntarios y equipo. Va deliberadamente discreto: quien busca
 * ayuda no necesita cuenta y no debe leer esto como un requisito.
 */
async function BloqueSesion() {
  const sesion = await getSesion();

  if (!sesion.user) {
    return (
      <Link
        href="/entrar"
        className="ml-auto rounded-full border-[1.5px] border-line-fuerte px-[18px] py-2 text-[15px] font-semibold whitespace-nowrap text-muted transition-colors hover:border-ayuda hover:text-foreground sm:ml-0"
      >
        Entrar
      </Link>
    );
  }

  return (
    <MenuUsuario
      nombre={
        sesion.voluntario?.nombre ??
        sesion.user.user_metadata?.full_name ??
        sesion.user.email ??
        "Cuenta"
      }
      email={sesion.user.email ?? ""}
      esAdmin={sesion.esAdmin}
      tieneFicha={Boolean(sesion.voluntario)}
    />
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <div className="flex-1 bg-[linear-gradient(var(--background-alto),var(--background)_320px)]">
          <header className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-7 gap-y-4 px-6 py-5">
            <Logo />
            <SiteNav />
            <BloqueSesion />
          </header>

          <main>{children}</main>
        </div>

        <footer className="border-t border-line bg-surface px-6 pt-[34px] pb-11">
          <div className="mx-auto grid max-w-[1180px] gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            <nav className="grid content-start gap-2.5 text-[15px] font-semibold">
              <Link href="/" className="text-enlace hover:underline">
                Inicio
              </Link>
              <Link href="/recursos" className="text-enlace hover:underline">
                Líneas de ayuda y recursos
              </Link>
              <Link href="/doy-ayuda" className="text-enlace hover:underline">
                Ser voluntario
              </Link>
            </nav>
            <p className="max-w-[56ch] text-[14.5px] leading-[1.65] text-muted">
              Red de Apoyo es una iniciativa ciudadana de acompañamiento
              emocional.{" "}
              <strong className="font-bold text-muted">
                No es un servicio de emergencia
              </strong>{" "}
              ni reemplaza la atención médica o psicológica profesional
              continua.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
