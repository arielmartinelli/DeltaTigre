import { NextResponse } from "next/server";
import { raw, withTimeout } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

/** Diagnostico: GET /api/health */
export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  const info = {
    tieneDatabaseUrl: !!url,
    host: url ? (url.split("@")[1] ?? "").split("/")[0] : null,
    usuario: url ? (url.split("://")[1] ?? "").split(":")[0] : null,
    tieneAuthSecret: !!process.env.AUTH_SECRET,
    tieneSupabaseUrl: !!process.env.SUPABASE_URL,
    tieneServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    region: process.env.VERCEL_REGION ?? "local",
  };

  const t0 = Date.now();
  try {
    const filas = await withTimeout(raw`select count(*)::int as n from properties`, 12000, "select properties");
    return NextResponse.json({ ok: true, ...info, ms: Date.now() - t0, propiedades: filas[0].n });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false, ...info, ms: Date.now() - t0,
        error: e instanceof Error ? e.message : String(e),
        codigo: (e as { code?: string })?.code ?? null,
      },
      { status: 500 }
    );
  }
}
