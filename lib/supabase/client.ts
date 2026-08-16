"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Cliente de navegador. Solo se usa para el magic link y la subida de credencial. */
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
