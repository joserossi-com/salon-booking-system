import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { apiError, apiOk } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// ─── GET /api/services — público con rate limit ───────────────────────────────
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) return apiError("Demasiadas solicitudes.", 429, { "Retry-After": "60" });

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("servicios")
      .select("id, nombre, descripcion, duracion_minutos, precio, categoria")
      .eq("activo", true)
      .order("categoria")
      .order("nombre");

    if (error) throw error;
    return apiOk({ servicios: data });
  } catch (err) {
    console.error("[services GET]", err);
    return apiError("Error interno", 500);
  }
}
