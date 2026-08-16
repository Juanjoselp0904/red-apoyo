# Red de Apoyo

Plataforma de acompañamiento emocional tras el terremoto. Conecta a quien
necesita hablar con **psicólogos voluntarios** o con **voluntarios de
escucha**, y hace el traspaso por WhatsApp.

- Quien pide ayuda **no crea cuenta**: llena un formulario y recibe un código
  (`AYUDA-XXXX`).
- Los voluntarios entran con enlace mágico y **solo ven casos después de ser
  aprobados** por un administrador.
- El teléfono de quien pide ayuda **se revela únicamente al tomar el caso**.

Stack: Next.js 16 (App Router) + Supabase (Postgres, Auth, Storage) → Vercel.

---

## Puesta en marcha

### 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. SQL Editor → pega y ejecuta `supabase/migrations/0001_init.sql`.
3. Authentication → Providers → deja **Email** activo con *magic link*.
   Desactiva "Confirm email" no es necesario; el magic link ya confirma.
4. Authentication → URL Configuration → agrega tus *Redirect URLs*:
   `http://localhost:3000/auth/callback` y
   `https://TU-DOMINIO/auth/callback`.

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Llena `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(Project Settings → API), y pon una cadena aleatoria larga en `IP_SALT`.

> Solo se usa la **anon key**. La service role key no hace falta en ningún
> lado: toda la autorización vive en la base de datos.

### 3. Correr

Este proyecto usa **pnpm**. Si no lo tienes: `corepack enable pnpm`.

```bash
pnpm install
pnpm dev
```

### 4. Hacerte administrador

Entra una vez a `/admin` con tu correo (te registra el usuario), y luego en
el SQL Editor:

```sql
insert into admins (user_id)
select id from auth.users where email = 'tucorreo@ejemplo.com';
```

Recarga `/admin`.

### 5. Retención de datos (opcional pero recomendado)

En Supabase → Database → Extensions activa `pg_cron` y programa:

```sql
select cron.schedule('anonimizar', '0 4 * * *',
  $$select public.anonimizar_casos_viejos()$$);
```

Borra teléfono y mensaje de los casos cerrados a los 30 días.

---

## Antes de lanzar — lista de chequeo

- [ ] **Líneas telefónicas** (`lib/lineas.ts`): las nacionales ya están
      confirmadas. Falta agregar las líneas locales de la zona afectada y
      revisar que el 111 y el 126 apliquen en ese departamento. Un número
      muerto aquí es peor que ningún número.
- [ ] **Auditoría de RLS**: con la anon key, desde la consola del navegador,
      confirma que estas dos consultas devuelven cero filas o error:
      ```js
      await supabase.from('requests').select('whatsapp')
      await supabase.from('volunteers').select('*')
      ```
- [ ] Probar la carrera: dos pestañas tomando el mismo caso; la segunda debe
      decir "Otra persona tomó este caso".
- [ ] Probar el flujo completo desde un celular real con datos móviles.
- [ ] Tener al menos un puñado de voluntarios aprobados **antes** de
      difundir el enlace. Una solicitud que nadie atiende hace daño.

## Despliegue

```bash
vercel --prod
```

Carga las tres variables de entorno en Vercel y agrega la URL de producción
a las Redirect URLs de Supabase.

---

## Estructura

```
app/
  page.tsx                    portada: necesito ayuda | doy ayuda
  necesito-ayuda/             formulario público (sin login)
  solicitud/[codigo]/         estado por código de seguimiento
  doy-ayuda/                  qué implica ser voluntario + compromisos
  doy-ayuda/registro/         magic link + perfil + tarjeta profesional
  voluntario/                 bandeja de casos, tomar y cerrar
  admin/                      aprobación de voluntarios y métricas
  recursos/                   líneas de crisis, autocuidado, guía de escucha
lib/
  actions/                    Server Actions (solicitudes, casos, voluntarios)
  supabase/                   clientes SSR y navegador
  whatsapp.ts                 normalización E.164 y armado del link wa.me
  validation.ts               esquemas zod + detección de señales de riesgo
  lineas.ts                   líneas de crisis ⚠️ verificar
supabase/migrations/          esquema, RLS y funciones
```

## Qué falta (siguiente iteración)

Chat interno, agenda de citas, notificaciones por correo al aprobar o al
recibir un caso, seguimiento de derivaciones, y matching por ciudad.
