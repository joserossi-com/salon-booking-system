import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { CalendarAvailabilitySchema } from "@/lib/schemas";
import { requireApiKey, apiError, apiOk, validationError } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getBusySlots,
  generateAvailableSlots,
  isValidSalonDay,
} from "@/lib/google-calendar";

// GET /api/calendar/availability?fecha=YYYY-MM-DD&servicio_id=X&trabajadora_id=Y
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) return apiError("Demasiadas solicitudes. Intenta en un minuto.", 429, { "Retry-After": "60" });

  const authError = requireApiKey(req);
  if (authError) return authError;

  const parsed = CalendarAvailabilitySchema.safeParse({
    fecha:          req.nextUrl.searchParams.get("fecha"),
    servicio_id:    req.nextUrl.searchParams.get("servicio_id"),
    trabajadora_id: req.nextUrl.searchParams.get("trabajadora_id"),
  });
  if (!parsed.success) return validationError(parsed.error.issues);

  const { fecha, servicio_id, trabajadora_id } = parsed.data;

  // Domingos: salón cerrado
  if (!isValidSalonDay(fecha)) {
    return apiOk({ fecha, servicio_id, trabajadora_id, slots: [] });
  }

  try {
    // 1. Duración del servicio
    const { data: servicio, error: svcErr } = await getSupabaseAdmin()
      .from("servicios")
      .select("duracion_minutos")
      .eq("id", servicio_id)
      .eq("activo", true)
      .single();

    if (svcErr || !servicio) return apiError("Servicio no encontrado", 404);

    // 2. Google Calendar ID de la trabajadora
    const { data: trabajadora, error: tErr } = await getSupabaseAdmin()
      .from("trabajadoras")
      .select("google_calendar_id, activa")
      .eq("id", trabajadora_id)
      .single();

    if (tErr || !trabajadora) return apiError("Trabajadora no encontrada", 404);
    if (!trabajadora.activa)  return apiError("Trabajadora no disponible", 404);

    const calendarId = trabajadora.google_calendar_id as string | null;
    if (!calendarId) return apiError("Trabajadora sin calendario configurado", 422);

    // 3. Consultar Google Calendar
    const busy  = await getBusySlots(calendarId, fecha);
    const slots = generateAvailableSlots(fecha, servicio.duracion_minutos as number, busy);

    return apiOk({ fecha, servicio_id, trabajadora_id, slots });
  } catch (err) {
    console.error("[calendar/availability]", err);
    return apiError("Error interno", 500);
  }
}
