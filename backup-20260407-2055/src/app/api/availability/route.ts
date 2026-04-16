import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { AvailabilityQuerySchema } from "@/lib/schemas";
import { requireApiKey, apiError, apiOk, validationError } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Horario del salón (hora local Chile = UTC-3, ajustable)
const SALON_OPEN_HOUR  = 9;   // 09:00
const SALON_CLOSE_HOUR = 19;  // 19:00
const SLOT_STEP_MIN    = 15;  // granularidad de slots

export async function GET(req: NextRequest) {
  // Rate limiting
  const ip = getClientIp(req);
  const { allowed, remaining } = await checkRateLimit(ip);
  if (!allowed) {
    return apiError("Demasiadas solicitudes. Intenta en un minuto.", 429, { "Retry-After": "60" });
  }

  // API Key
  const authError = requireApiKey(req);
  if (authError) return authError;

  // Validar query params
  const parsed = AvailabilityQuerySchema.safeParse({
    date:        req.nextUrl.searchParams.get("date"),
    servicio_id: req.nextUrl.searchParams.get("servicio_id"),
  });
  if (!parsed.success) {
    return validationError(parsed.error.issues);
  }
  const { date, servicio_id } = parsed.data;

  try {
    // 1. Obtener duración del servicio
    const { data: servicio, error: svcError } = await getSupabaseAdmin()
      .from("servicios")
      .select("duracion_minutos")
      .eq("id", servicio_id)
      .eq("activo", true)
      .single();

    if (svcError || !servicio) return apiError("Servicio no encontrado", 404);

    const duracion = servicio.duracion_minutos as number;

    // 2. Obtener citas del día para todas las trabajadoras (no canceladas)
    const dayStart = `${date}T00:00:00+00:00`;
    const dayEnd   = `${date}T23:59:59+00:00`;

    const { data: citas, error: citasError } = await getSupabaseAdmin()
      .from("citas")
      .select("trabajadora_id, fecha_hora_inicio, fecha_hora_fin")
      .gte("fecha_hora_inicio", dayStart)
      .lte("fecha_hora_inicio", dayEnd)
      .neq("estado", "cancelada");

    if (citasError) throw citasError;

    // 3. Obtener trabajadoras que saben hacer este servicio
    const { data: trabajadoras, error: tError } = await getSupabaseAdmin()
      .from("trabajadora_servicios")
      .select("trabajadora_id, trabajadoras!inner(nombre, activa)")
      .eq("servicio_id", servicio_id)
      .eq("trabajadoras.activa", true);

    if (tError) throw tError;

    // 4. Generar slots disponibles
    const slots: string[] = [];
    const baseDate = new Date(`${date}T00:00:00`);

    for (const { trabajadora_id } of trabajadoras ?? []) {
      const ocupadas = (citas ?? []).filter(c => c.trabajadora_id === trabajadora_id);

      for (let h = SALON_OPEN_HOUR * 60; h + duracion <= SALON_CLOSE_HOUR * 60; h += SLOT_STEP_MIN) {
        const slotStart = new Date(baseDate.getTime() + h * 60_000);
        const slotEnd   = new Date(slotStart.getTime() + duracion * 60_000);

        const libre = ocupadas.every(c => {
          const citaStart = new Date(c.fecha_hora_inicio);
          const citaEnd   = new Date(c.fecha_hora_fin);
          return slotEnd <= citaStart || slotStart >= citaEnd;
        });

        if (libre) {
          const iso = slotStart.toISOString().replace(".000Z", "-03:00");
          if (!slots.includes(iso)) slots.push(iso);
        }
      }
    }

    slots.sort();

    return apiOk({ date, servicio_id, slots });
  } catch (err) {
    console.error("[availability]", err);
    return apiError("Error interno", 500);
  }
}
