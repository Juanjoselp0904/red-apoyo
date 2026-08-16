"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { crearSolicitud, type EstadoForm } from "@/lib/actions/requests";

const campo =
  "w-full rounded-lg border border-line bg-surface px-4 py-3 text-[17px]";
const etiqueta = "block font-medium mb-1.5";

function Enviar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-ayuda px-6 py-4 text-white text-lg font-semibold disabled:opacity-60"
    >
      {pending ? "Enviando…" : "Pedir acompañamiento"}
    </button>
  );
}

export function FormSolicitud() {
  const [estado, action] = useActionState<EstadoForm, FormData>(
    crearSolicitud,
    {},
  );

  return (
    <form action={action} className="space-y-6">
      <div>
        <label htmlFor="nombre" className={etiqueta}>
          ¿Cómo te llamamos?
        </label>
        <input
          id="nombre"
          name="nombre"
          required
          autoComplete="given-name"
          placeholder="Tu nombre de pila"
          className={campo}
        />
        <p className="text-[14px] text-muted mt-1">
          Con tu nombre de pila basta. No pedimos apellidos ni documento.
        </p>
      </div>

      <div>
        <label htmlFor="urgencia" className={etiqueta}>
          ¿Qué tan pronto necesitas hablar?
        </label>
        <select id="urgencia" name="urgencia" defaultValue="pronto" className={campo}>
          <option value="urgente">Lo necesito hoy</option>
          <option value="pronto">En los próximos días</option>
          <option value="puedo_esperar">Puedo esperar</option>
        </select>
      </div>

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
          autoComplete="tel"
          placeholder="300 123 4567"
          className={campo}
        />
        <p className="text-[14px] text-muted mt-1">
          Solo lo verá el voluntario que tome tu caso, y solo en ese momento.
          Nadie más puede verlo.
        </p>
      </div>

      <div>
        <label htmlFor="ciudad" className={etiqueta}>
          Ciudad o municipio <span className="text-muted">(opcional)</span>
        </label>
        <input id="ciudad" name="ciudad" autoComplete="address-level2" className={campo} />
      </div>

      <div>
        <label htmlFor="mensaje" className={etiqueta}>
          ¿Quieres contarnos algo? <span className="text-muted">(opcional)</span>
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          maxLength={1500}
          placeholder="Escribe lo que quieras, o déjalo vacío. Como te sientas cómodo."
          className={campo}
        />
      </div>

      {estado.error && (
        <p
          role="alert"
          className="rounded-lg border border-alerta bg-alerta-soft text-alerta px-4 py-3"
        >
          {estado.error}
        </p>
      )}

      <Enviar />

      <p className="text-[14px] text-muted">
        Al enviar aceptas que un voluntario te contacte por WhatsApp. Este no
        es un servicio de emergencia. Puedes cancelar tu solicitud cuando
        quieras.
      </p>
    </form>
  );
}
