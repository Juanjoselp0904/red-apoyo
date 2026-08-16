import Link from "next/link";

export const metadata = { title: "Doy ayuda — Red de Apoyo" };

const COMPROMISOS = [
  "Escucho sin juzgar, sin dar consejos que no me pidieron y sin comparar el dolor de nadie.",
  "No prometo lo que no puedo cumplir. Si no voy a poder acompañar, cierro el caso para que otra persona lo tome.",
  "Nunca pido dinero, datos bancarios, fotos ni favores. Nunca ofrezco alojamiento o traslados por este medio.",
  "Si detecto riesgo de suicidio, violencia o abuso, no lo manejo solo: comparto las líneas de emergencia y lo marco como derivación.",
  "Lo que me cuenten es confidencial. No lo comparto, no lo publico y no lo uso para nada más.",
];

export default function DoyAyuda() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/" className="text-[15px] text-muted underline underline-offset-4">
        ← Volver
      </Link>

      <h1 className="mt-5 text-3xl font-bold tracking-tight">
        Gracias por querer ayudar
      </h1>
      <p className="mt-3 text-muted">
        Hay dos formas de acompañar. Ninguna requiere que estés disponible
        todo el día: tú defines cuántos casos tomas.
      </p>

      <div className="mt-8 grid gap-4">
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-xl font-semibold">Psicólogo(a) voluntario(a)</h2>
          <p className="mt-1.5 text-[15px] text-muted">
            Donas horas de atención profesional. Si puedes, adjunta la foto de
            tu tarjeta profesional: agiliza mucho tu aprobación. La revisa un
            administrador y no se publica en ningún lado.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-xl font-semibold">Voluntario(a) de escucha</h2>
          <p className="mt-1.5 text-[15px] text-muted">
            No necesitas ser profesional. Necesitas tiempo, paciencia y
            discreción. Acompañas, escuchas y das aliento — no diagnosticas ni
            das tratamiento.
          </p>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-semibold">
        Los compromisos que aceptas
      </h2>
      <p className="mt-1.5 text-[15px] text-muted">
        Las personas que van a escribirte están en un momento frágil. Esto no
        es negociable.
      </p>
      <ul className="mt-4 space-y-3">
        {COMPROMISOS.map((c) => (
          <li key={c} className="flex gap-3 text-[15px]">
            <span aria-hidden className="text-dar font-bold">
              ✓
            </span>
            <span>{c}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-xl border border-line bg-dar-soft p-5">
        <h2 className="font-semibold">Cómo funciona</h2>
        <ol className="mt-2 space-y-1.5 text-[15px] list-decimal list-inside">
          <li>Te registras con tu correo (te llega un enlace, sin contraseña).</li>
          <li>Un administrador revisa tu perfil y lo aprueba.</li>
          <li>Ves los casos abiertos, sin datos de contacto.</li>
          <li>Tomas uno y ahí sí se te muestra el WhatsApp para escribirle.</li>
          <li>Al terminar, cierras el caso con una nota breve.</li>
        </ol>
      </div>

      <Link
        href="/doy-ayuda/registro"
        className="mt-8 block rounded-xl bg-dar px-6 py-4 text-center text-white text-lg font-semibold"
      >
        Quiero registrarme como voluntario
      </Link>
    </div>
  );
}
