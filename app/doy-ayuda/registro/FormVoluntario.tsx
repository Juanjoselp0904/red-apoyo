"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { supabaseBrowser } from "@/lib/supabase/client";
import { registrarVoluntario, type EstadoForm } from "@/lib/actions/volunteers";

const campo =
  "w-full rounded-lg border border-line bg-surface px-4 py-3 text-[17px]";
const etiqueta = "block font-medium mb-1.5";

function Enviar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-dar px-6 py-4 text-white text-lg font-semibold disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Enviar mi registro"}
    </button>
  );
}

export function FormVoluntario({
  userId,
  inicial,
}: {
  userId: string;
  inicial: {
    nombre: string;
    kind: "psicologo" | "escucha";
    ciudad: string;
    whatsapp: string;
    bio: string;
    credencialPath: string;
  } | null;
}) {
  const [estado, action] = useActionState<EstadoForm, FormData>(
    registrarVoluntario,
    {},
  );
  const [kind, setKind] = useState(inicial?.kind ?? "escucha");
  const [credencialPath, setCredencialPath] = useState(
    inicial?.credencialPath ?? "",
  );
  const [subiendo, setSubiendo] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);

  async function subirCredencial(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    setErrorArchivo(null);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/credencial-${Date.now()}.${ext}`;
    const { error } = await supabaseBrowser()
      .storage.from("credenciales")
      .upload(path, file, { upsert: true });

    if (error) {
      setErrorArchivo("No se pudo subir el archivo. Intenta con una foto más liviana.");
    } else {
      setCredencialPath(path);
      setNombreArchivo(file.name);
    }
    setSubiendo(false);
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="credencialPath" value={credencialPath} />

      <div>
        <label htmlFor="nombre" className={etiqueta}>
          Tu nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          required
          defaultValue={inicial?.nombre}
          autoComplete="name"
          className={campo}
        />
        <p className="text-[14px] text-muted mt-1">
          Así te verá la persona a la que acompañes.
        </p>
      </div>

      <fieldset>
        <legend className={etiqueta}>¿Cómo quieres acompañar?</legend>
        <div className="space-y-2.5">
          <label className="flex gap-3 rounded-lg border border-line bg-surface p-4 cursor-pointer">
            <input
              type="radio"
              name="kind"
              value="escucha"
              checked={kind === "escucha"}
              onChange={() => setKind("escucha")}
              className="mt-1.5 size-4 shrink-0"
            />
            <span>
              <span className="font-medium block">Escuchando</span>
              <span className="text-[15px] text-muted">
                Acompañamiento humano, sin rol clínico.
              </span>
            </span>
          </label>
          <label className="flex gap-3 rounded-lg border border-line bg-surface p-4 cursor-pointer">
            <input
              type="radio"
              name="kind"
              value="psicologo"
              checked={kind === "psicologo"}
              onChange={() => setKind("psicologo")}
              className="mt-1.5 size-4 shrink-0"
            />
            <span>
              <span className="font-medium block">Como psicólogo(a)</span>
              <span className="text-[15px] text-muted">
                Requiere tarjeta profesional.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      {kind === "psicologo" && (
        <div>
          <span className={etiqueta}>
            Tarjeta profesional <span className="text-muted">(opcional)</span>
          </span>
          <p className="text-[14px] text-muted mb-2.5">
            Foto o PDF, máximo 5 MB. Adjuntarla agiliza mucho tu aprobación.
            Solo la ve el administrador; se guarda en un espacio privado.
          </p>

          <input
            id="credencial"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={subirCredencial}
            disabled={subiendo}
            className="peer sr-only"
          />
          <label
            htmlFor="credencial"
            className="inline-flex cursor-pointer items-center gap-2.5 rounded-lg border-[1.5px] border-line-fuerte bg-surface px-5 py-3.5 font-semibold text-enlace transition-colors hover:border-ayuda hover:bg-[#f5f9fe] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ayuda peer-disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 16v2.5A1.5 1.5 0 005.5 20h13a1.5 1.5 0 001.5-1.5V16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {subiendo
              ? "Subiendo…"
              : credencialPath
                ? "Cambiar archivo"
                : "Adjuntar tarjeta profesional"}
          </label>

          {credencialPath && !subiendo && (
            <p className="mt-2.5 flex items-center gap-2 text-[15px] font-medium text-dar">
              <span aria-hidden>✓</span>
              <span className="min-w-0 truncate">
                {nombreArchivo ?? "Archivo cargado"}
              </span>
            </p>
          )}
          {errorArchivo && (
            <p role="alert" className="text-[15px] text-alerta mt-2.5">
              {errorArchivo}
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="whatsapp" className={etiqueta}>
          Tu WhatsApp
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          required
          type="tel"
          inputMode="tel"
          defaultValue={inicial?.whatsapp}
          placeholder="300 123 4567"
          className={campo}
        />
        <p className="text-[14px] text-muted mt-1">
          Desde aquí escribirás a la persona. Ella verá tu número cuando la
          contactes.
        </p>
      </div>

      <div>
        <label htmlFor="ciudad" className={etiqueta}>
          Ciudad <span className="text-muted">(opcional)</span>
        </label>
        <input id="ciudad" name="ciudad" defaultValue={inicial?.ciudad} className={campo} />
      </div>

      <div>
        <label htmlFor="bio" className={etiqueta}>
          Cuéntanos brevemente de ti
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          maxLength={600}
          defaultValue={inicial?.bio}
          placeholder="Tu experiencia, tu disponibilidad, por qué quieres ayudar."
          className={campo}
        />
        <p className="text-[14px] text-muted mt-1">
          Esto es lo que lee el administrador para aprobarte.
        </p>
      </div>

      <label className="flex gap-3 rounded-lg border border-line bg-surface p-4 cursor-pointer">
        <input type="checkbox" name="acepto" required className="mt-1.5 size-4 shrink-0" />
        <span className="text-[15px]">
          Leí y acepto los compromisos del voluntariado, y entiendo que este
          no es un servicio de emergencia.
        </span>
      </label>

      {estado.error && (
        <p
          role="alert"
          className="rounded-lg border border-alerta bg-alerta-soft text-alerta px-4 py-3"
        >
          {estado.error}
        </p>
      )}

      <Enviar />
    </form>
  );
}
