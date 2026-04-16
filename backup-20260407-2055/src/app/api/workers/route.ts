import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { apiError, apiOk } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// ─── GET /api/workers — público con rate limit ────────────────────────────────
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) return apiError("Demasiadas solicitudes.", 429, { "Retry-After": "60" });

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("trabajadoras")
      .select(`
        id, nombre,
        trabajadora_servicios (
          servicios (id, nombre, categoria, duracion_minutos, precio)
        )
      `)
      .eq("activa", true)
      .order("nombre");

    if (error) throw error;

    const workers = (data ?? []).map((t) => ({
      id:        t.id,
      nombre:    t.nombre,
      servicios: (t.trabajadora_servicios as any[]).map((ts) => ts.servicios),
    }));

    return apiOk({ trabajadoras: workers });
  } catch (err) {
    console.error("[workers GET]", err);
    return apiError("Error interno", 500);
  }
}
