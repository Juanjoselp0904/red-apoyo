import Link from "next/link";
import { LineasCrisis } from "@/app/components/LineasCrisis";

export const metadata = { title: "Líneas de ayuda y recursos — Red de Apoyo" };

const AUTOCUIDADO = [
  {
    titulo: "Lo que sientes es una reacción normal",
    texto:
      "Después de un terremoto es común no poder dormir, sobresaltarse con cualquier ruido, sentir el cuerpo tenso, llorar sin motivo claro o sentirse ausente. No estás enloqueciendo: así responde el cuerpo a algo que fue real y grave.",
  },
  {
    titulo: "Primero lo básico",
    texto:
      "Agua, algo de comer, dormir aunque sea a ratos, un lugar seguro. Antes de resolver lo grande, sostén lo mínimo. Está bien hacer una sola cosa al día.",
  },
  {
    titulo: "Regula el cuerpo antes que la cabeza",
    texto:
      "Cuando llegue la angustia: respira lento, exhalando más largo que inhalando, por un minuto. Nombra cinco cosas que ves a tu alrededor. Pon los pies firmes en el piso. No busca hacerte sentir bien, busca bajar la alarma.",
  },
  {
    titulo: "Cuidado con las noticias",
    texto:
      "Revisar imágenes y videos del desastre una y otra vez mantiene el susto encendido. Infórmate en momentos puntuales del día y con fuentes oficiales.",
  },
  {
    titulo: "El duelo no tiene calendario",
    texto:
      "Si perdiste a alguien, no hay una forma correcta ni un tiempo correcto. Nadie tiene derecho a apurarte.",
  },
  {
    titulo: "Cuándo buscar ayuda profesional",
    texto:
      "Si después de varias semanas no puedes dormir, no logras retomar nada de tu vida diaria, tienes pensamientos de muerte, o estás usando alcohol o drogas para aguantar, no lo cargues solo: busca a un profesional o llama a una de las líneas.",
  },
];

const PARA_VOLUNTARIOS = [
  "Escuchar es la intervención. No hay que arreglar nada ni tener la frase perfecta.",
  "Evita “todo pasa por algo”, “peor están otros”, “tienes que ser fuerte”. Minimizan.",
  "Sirve más: “te escucho”, “tiene sentido que te sientas así”, “no tienes que estar bien ahora”.",
  "Pregunta antes de aconsejar: “¿quieres que te ayude a pensar en algo, o prefieres solo desahogarte?”.",
  "Si aparece riesgo de suicidio, pregúntalo directo y sin rodeos. Preguntar no lo provoca. Acompaña a llamar al 123 o a la línea de salud mental, y márcalo como derivación al cerrar el caso.",
  "Cuida tus límites: horarios claros, cupo bajo de casos, y habla con alguien de lo que a ti te mueve. Acompañar también pesa.",
];

export default function Recursos() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 space-y-10">
      <div>
        <Link href="/" className="text-[15px] text-muted underline underline-offset-4">
          ← Volver
        </Link>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          Líneas de ayuda y recursos
        </h1>
      </div>

      <LineasCrisis prominente titulo="Líneas de atención" />

      <section>
        <h2 className="text-xl font-semibold">
          Cómo cuidarte estos días
        </h2>
        <div className="mt-4 space-y-5">
          {AUTOCUIDADO.map((r) => (
            <div key={r.titulo}>
              <h3 className="font-semibold">{r.titulo}</h3>
              <p className="text-[15px] text-muted mt-1">{r.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-dar-soft p-5">
        <h2 className="text-xl font-semibold">Si eres voluntario</h2>
        <ul className="mt-3 space-y-2.5 text-[15px]">
          {PARA_VOLUNTARIOS.map((t) => (
            <li key={t} className="flex gap-3">
              <span aria-hidden className="text-dar font-bold">
                ·
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
