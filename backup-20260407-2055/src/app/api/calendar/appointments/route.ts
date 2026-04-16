import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { CalendarCreateAppointmentSchema } from "@/lib/schemas";
import { requireApiKey, requireJson, apiError, apiOk, validationError } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createCalendarEvent, isValidSalonDay } from "@/lib/google-calendar";

// POST /api/calendar/appointments
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) return apiError("Demasiadas solicitudes.", 429, { "Retry-After": "60" });

  const jsonError = requireJson(req);
  if (jsonError) return jsonError;

  const authError = requireApiKey(req);
  if (authError) return authError;

  let body: unknown;
  try { body = await req.json(); }
  catch { return apiError("Body JSON inválido", 400); }

  const parsed = CalendarCreateAppointmentSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  const { cliente_nombre, cliente_telefono, trabajadora_id, servicio_id, fecha_hora_inicio } =
    parsed.data;

  // Validar que el día no sea domingo
  const dateStr = fecha_hora_inicio.slice(0, 10);
  if (!isValidSalonDay(dateStr)) {
    return apiError("El salón no trabaja los domingos", 422);
  }

  try {
    // 1. Servicio
    const { data: servicio, error: svcErr } = await getSupabaseAdmin()
      .from("servicios")
      .select("duracion_minutos, precio, nombre")
      .eq("id", servicio_id)
      .eq("activo", true)
      .single();

    if (svcErr || !servicio) return apiError("Servicio no encontrado o inactivo", 404);

    const duracion = servicio.duracion_minutos as number;
    if (!duracion || duracion <= 0 || duracion > 480) {
      return apiError("Duración del servicio inválida", 422);
    }

    const inicio  = new Date(fecha_hora_inicio);
    const fin     = new Date(inicio.getTime() + duracion * 60_000);
    const finIso  = fin.toISOString();

    // 2. Trabajadora + calendar ID
    const { data: trabajadora, error: tErr } = await getSupabaseAdmin()
      .from("trabajadoras")
      .select("id, nombre, google_calendar_id, activa")
      .eq("id", trabajadora_id)
      .single();

    if (tErr || !trabajadora) return apiError("Trabajadora no disponible", 404);
    if (!trabajadora.activa)  return apiError("Trabajadora no disponible", 404);

    const calendarId = trabajadora.google_calendar_id as string | null;
    if (!calendarId) return apiError("Trabajadora sin calendario configurado", 422);

    // 3. Race-condition check en Supabase
    const { data: conflicto, error: confErr } = await getSupabaseAdmin()
      .from("citas")
      .select("id")
      .eq("trabajadora_id", trabajadora_id)
      .neq("estado", "cancelada")
      .lt("fecha_hora_inicio", finIso)
      .gt("fecha_hora_fin", inicio.toISOString())
      .limit(1);

    if (confErr) throw confErr;
    if (conflicto && conflicto.length > 0) {
      return apiError("El horario ya no está disponible", 409);
    }

    // 4. Crear evento en Google Calendar
    const googleEventId = await createCalendarEvent({
      calendarId,
      summary:     `${servicio.nombre} — ${cliente_nombre}`,
      description: `Cliente: ${cliente_nombre}\nTeléfono: ${cliente_telefono}\nServicio: ${servicio.nombre}`,
      startIso:    inicio.toISOString(),
      endIso:      finIso,
    });

    // 5. Upsert cliente
    const { data: cliente, error: cliErr } = await getSupabaseAdmin()
      .from("clientes")
      .upsert(
        { nombre: cliente_nombre, telefono: cliente_telefono },
        { onConflict: "telefono", ignoreDuplicates: false }
      )
      .select("id")
      .single();

    if (cliErr || !cliente) throw cliErr;

    // 6. Crear cita en Supabase
    const { data: cita, error: citaErr } = await getSupabaseAdmin()
      .from("citas")
      .insert({
        cliente_id:        cliente.id,
        trabajadora_id,
        servicio_id,
        fecha_hora_inicio: inicio.toISOString(),
        fecha_hora_fin:    finIso,
        estado:            "pendiente",
        google_event_id:   googleEventId,
      })
      .select("id, fecha_hora_inicio, fecha_hora_fin, estado, google_event_id")
      .single();

    if (citaErr || !cita) {
      // Rollback: eliminar el evento de Google Calendar
      try {
        const { cancelCalendarEvent } = await import("@/lib/google-calendar");
        await cancelCalendarEvent(calendarId, googleEventId);
      } catch (rollbackErr) {
        console.error("[calendar/appointments rollback]", rollbackErr);
      }
      // 23P01 = exclusion_violation → race condition interceptada por la DB constraint
      if ((citaErr as any)?.code === "23P01") {
        return apiError("El horario ya no está disponible", 409);
      }
      throw citaErr;
    }

    return apiOk({ cita }, 201);
  } catch (err) {
    console.error("[calendar/appointments POST]", err);
    return apiError("Error interno", 500);
  }
}
