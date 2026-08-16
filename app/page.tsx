import Image from "next/image";
import Link from "next/link";

/**
 * Sin `object-cover`: dejamos que la imagen conserve su proporción para que
 * el encuadre no corte a las figuras al cambiar el ancho de la columna.
 */
function Ilustracion() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-line-fuerte bg-[#f5fafe]">
      <Image
        src="/hero-acompanamiento.png"
        alt="Dos personas sentadas en una banca frente a un paisaje sereno; una apoya la mano en el hombro de la otra."
        width={1536}
        height={1024}
        priority
        sizes="(max-width: 767px) 100vw, 560px"
        className="h-auto w-full"
      />
    </div>
  );
}

function Chevron() {
  return (
    <svg
      width="10"
      height="18"
      viewBox="0 0 10 18"
      className="ml-auto flex-none"
      aria-hidden="true"
    >
      <path
        d="M2 2l6 7-6 7"
        fill="none"
        stroke="#b8cade"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const tarjeta =
  "group grid content-start gap-3.5 rounded-card bg-surface p-[26px] shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-card-alta";

export default function Home() {
  return (
    <div className="mx-auto grid max-w-[1180px] gap-[22px] px-6 pt-2 pb-14">
      <section className="grid items-center gap-[30px] rounded-hero bg-surface p-[34px] shadow-hero [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        <div className="grid content-start gap-4">
          <span className="justify-self-start rounded-full bg-[#eaf4ff] px-[13px] py-[7px] text-[13px] font-bold text-enlace">
            Gratis · Confidencial
          </span>
          <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-[-.03em] text-balance text-foreground">
            Red de Apoyo
          </h1>
          <p className="max-w-[46ch] text-[17px] leading-relaxed text-pretty text-muted">
            Después del terremoto, muchos estamos cargando cosas que no se ven:
            el miedo, la pérdida, el empezar de nuevo. Aquí puedes hablar con
            alguien. Es gratis, es confidencial y no estás solo.
          </p>
        </div>
        <Ilustracion />
      </section>

      <section className="grid gap-[22px] [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
        <Link href="/necesito-ayuda" className={tarjeta}>
          <div className="flex items-center gap-3.5">
            <span className="grid size-[52px] flex-none place-items-center rounded-2xl bg-ayuda-soft">
              <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="4" width="18" height="13" rx="4" fill="none" stroke="#e8825e" strokeWidth="1.8" />
                <path d="M8 17l-1.5 3.5L12 17" fill="none" stroke="#e8825e" strokeWidth="1.8" strokeLinejoin="round" />
                <circle cx="9" cy="10.5" r="1.2" fill="#e8825e" />
                <circle cx="15" cy="10.5" r="1.2" fill="#e8825e" />
              </svg>
            </span>
            <h2 className="text-[22px] font-extrabold tracking-[-.02em] text-foreground">
              Necesito ayuda
            </h2>
            <Chevron />
          </div>
          <p className="text-[15.5px] leading-relaxed text-muted">
            Quiero hablar con un psicólogo voluntario o con alguien que me
            escuche. Toma menos de un minuto.
          </p>
          <span className="mt-1 justify-self-start rounded-full bg-ayuda px-[22px] py-3 text-[15px] font-bold text-white shadow-boton transition-colors group-hover:bg-ayuda-hover">
            Pedir ayuda
          </span>
        </Link>

        <Link href="/doy-ayuda" className={tarjeta}>
          <div className="flex items-center gap-3.5">
            <span className="grid size-[52px] flex-none place-items-center rounded-2xl bg-dar-soft">
              <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="9" cy="8" r="3.2" fill="none" stroke="#57b8ac" strokeWidth="1.8" />
                <path d="M3.5 20c.6-3.4 2.9-5.2 5.5-5.2s4.9 1.8 5.5 5.2" fill="none" stroke="#57b8ac" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M17 7.5v5M14.5 10h5" fill="none" stroke="#57b8ac" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <h2 className="text-[22px] font-extrabold tracking-[-.02em] text-foreground">
              Doy ayuda
            </h2>
            <Chevron />
          </div>
          <p className="text-[15.5px] leading-relaxed text-muted">
            Soy psicólogo(a) y quiero donar horas, o quiero acompañar
            escuchando. Regístrate como voluntario.
          </p>
          <span className="mt-1 justify-self-start rounded-full border-[1.5px] border-[#cfe4fa] bg-surface px-[21px] py-[11px] text-[15px] font-bold text-enlace transition-colors group-hover:border-ayuda">
            Ser voluntario
          </span>
        </Link>
      </section>

      <section className="grid items-center gap-4 rounded-card bg-surface p-[26px] shadow-card [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        <div className="grid gap-1.5">
          <h2 className="text-[19px] font-extrabold tracking-[-.02em] text-foreground">
            ¿Ya pediste ayuda?
          </h2>
          <p className="text-[15.5px] leading-snug text-muted">
            Consulta tu solicitud con el código que te dimos.
          </p>
        </div>
        <form action="/solicitud" className="flex items-center gap-2.5">
          <input
            name="codigo"
            placeholder="AYUDA-XXXX"
            aria-label="Código de solicitud"
            autoCapitalize="characters"
            className="min-w-0 flex-1 rounded-[14px] border-[1.5px] border-line-fuerte bg-[#f5f9fe] px-4 py-3.5 text-[16px] font-semibold tracking-[.04em] text-foreground uppercase focus:border-ayuda focus:bg-surface"
          />
          <button
            type="submit"
            className="flex-none rounded-[14px] bg-ayuda px-[26px] py-[15px] text-[15px] font-bold text-white shadow-boton transition-colors hover:bg-ayuda-hover"
          >
            Ver
          </button>
        </form>
      </section>

      <p className="mt-1.5 max-w-[70ch] px-0.5 text-[14.5px] leading-[1.65] text-muted">
        Este no es un servicio de emergencia. Si hay riesgo para tu vida o la de
        alguien más,{" "}
        <a href="tel:123" className="font-bold text-alerta hover:underline">
          llama al 123
        </a>
        . Mira también las{" "}
        <Link href="/recursos" className="font-semibold text-enlace hover:underline">
          líneas de ayuda
        </Link>
        .
      </p>
    </div>
  );
}
