export type Linea = {
  nombre: string;
  numero: string;
  tel: string;
  detalle: string;
  destacada: boolean;
};

/**
 * Emergencias físicas: rescate, incendio, heridos, estructuras.
 * Números nacionales confirmados por el equipo.
 */
export const LINEAS_EMERGENCIA: Linea[] = [
  {
    nombre: "Línea única de emergencias",
    numero: "123",
    tel: "123",
    detalle: "Si no sabes a cuál llamar, llama a esta. Deriva a las demás.",
    destacada: true,
  },
  {
    nombre: "Atención de desastres",
    numero: "111",
    tel: "111",
    detalle: "Réplicas, colapsos, evacuaciones, personas atrapadas.",
    destacada: true,
  },
  {
    nombre: "Bomberos",
    numero: "119",
    tel: "119",
    detalle: "Incendios, fugas de gas, rescate en estructuras.",
    destacada: false,
  },
  {
    nombre: "Ambulancias",
    numero: "125",
    tel: "125",
    detalle: "Urgencias médicas y traslado de heridos.",
    destacada: false,
  },
  {
    nombre: "Cruz Roja Colombiana",
    numero: "132",
    tel: "132",
    detalle: "Primeros auxilios, búsqueda de familiares, ayuda humanitaria.",
    destacada: false,
  },
  {
    nombre: "Defensa Civil Colombiana",
    numero: "144",
    tel: "144",
    detalle: "Búsqueda y rescate, apoyo en zonas afectadas.",
    destacada: false,
  },
  {
    nombre: "Tránsito departamental",
    numero: "126",
    tel: "126",
    detalle: "Vías bloqueadas, accidentes, estado de las carreteras.",
    destacada: false,
  },
];

/**
 * Escucha y salud mental. Este es el grupo que se muestra de primero
 * cuando detectamos señales de riesgo en una solicitud.
 */
export const LINEAS_SALUD_MENTAL: Linea[] = [
  {
    nombre: "Línea 106 — orientación en salud mental",
    numero: "106",
    tel: "106",
    detalle:
      "Línea oficial del Ministerio de Salud. Apoyo emocional y primeros auxilios psicológicos. Gratuita desde fijo o celular, 24/7.",
    destacada: true,
  },
];
