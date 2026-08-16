import Link from "next/link";
import { LineasCrisis } from "@/app/components/LineasCrisis";

export default function NoEncontrada() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          No encontramos ese código
        </h1>
        <p className="mt-3 text-muted">
          Revisa que esté completo (tiene la forma AYUDA-XXXX). Si lo
          perdiste, puedes pedir acompañamiento de nuevo — no pasa nada.
        </p>
      </div>

      <Link
        href="/necesito-ayuda"
        className="inline-block rounded-xl bg-ayuda px-6 py-4 text-white font-semibold"
      >
        Pedir acompañamiento
      </Link>

      <LineasCrisis />
    </div>
  );
}
