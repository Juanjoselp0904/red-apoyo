import { redirect } from "next/navigation";

/** Punto de entrada del buscador por código en la portada. */
export default async function BuscarSolicitud({
  searchParams,
}: PageProps<"/solicitud">) {
  const { codigo } = await searchParams;
  const limpio = String(codigo ?? "")
    .trim()
    .toUpperCase();
  redirect(limpio ? `/solicitud/${encodeURIComponent(limpio)}` : "/");
}
