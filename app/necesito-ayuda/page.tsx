import Link from "next/link";
import { LineasCrisis } from "@/app/components/LineasCrisis";
import { FormSolicitud } from "./FormSolicitud";

export const metadata = { title: "Necesito ayuda — Red de Apoyo" };

export default function NecesitoAyuda() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/" className="text-[15px] text-muted underline underline-offset-4">
        ← Volver
      </Link>

      <h1 className="mt-5 text-3xl font-bold tracking-tight">
        Cuéntanos qué necesitas
      </h1>
      <p className="mt-3 text-muted">
        Un voluntario te va a escribir por WhatsApp. No tienes que crear
        cuenta ni dar tus datos completos. Lo que escribas aquí solo lo verá
        la persona que te acompañe.
      </p>

      <div className="mt-8">
        <FormSolicitud />
      </div>

      <div className="mt-10">
        <LineasCrisis />
      </div>
    </div>
  );
}
