import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { CreateAppointmentSchema, AppointmentsDayQuerySchema } from "@/lib/schemas";
import { requireApiKey, requireJson, apiError, apiOk, validationError } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// ─── GET /api/appointments?date=YYYY-MM-DD ────────────────────────────────────
export async function GET(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const parsed = AppointmentsDayQuerySchema.safeParse({
    date: req.nextUrl.searchParams.get("date"),
  });
  if (!parsed.success) return validationError(parsed.error.issues);

  const { date } = parsed.data;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("citas")
      .select(`
        id, fecha_hora_inicio, fecha_hora_fin, estado, precio_cobrado, metodo_pago, notas,
        clientes   (id, nombre, telefono),
        trabajadoras (id, nombre),
        servicios    (id, nombre, duracion_minutos, precio)
      `)
      .gte("fecha_hora_inicio", `${date}T00:00:00+00:00`)
      .lte("fecha_hora_inicio", `${date}T23:59:59+00:00`)
      .order("fecha_hora_inicio");

    if (error) throw error;
    return apiOk({ date, citas: data });
  } catch (err) {
    console.error("[appointments GET]", err);
    return apiError("Error interno", 500);
  }
}

// ─── POST /api/appointments ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, remaining } = await checkRateLimit(ip);
  if (!allowed) {
    return apiError("Demasiadas solicitudes.", 429, { "Retry-After": "60" });
  }

  const jsonError = requireJson(req);
  if (jsonError) return jsonError;

  const authError = requireApiKey(req);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Body JSON inválido", 400);
  }

  const parsed = CreateAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues);
  }

  const { cliente_nombre, cliente_telefono, trabajadora_id, servicio_id, fecha_hora_inicio } = parsed.data;

  // HIGH-04 FIX: usar Intl para calcular hora Chile correctamente incluyendo DST.
  // Chile usa UTC-3 en verano (nov–mar) y UTC-4 en invierno (abr–oct).
  // El código anterior usaba UTC+3 hardcodeado, lo que daba 1h de error en invierno.
  const inicioDate = new Date(fecha_hora_inicio);
  const fmt = (unit: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("es-CL", { timeZone: "America/Santiago", ...unit })
      .format(inicioDate);
  const horaChile   = parseInt(fmt({ hour: "numeric", hour12: false }), 10);
  const minutoChile = parseInt(fmt({ minute: "numeric" }), 10);
  const totalMin    = horaChile * 60 + minutoChile;

  if (totalMin < 10 * 60 || totalMin >= 19 * 60) {
    return apiError("La cita debe estar dentro del horario del salón (10:00–19:00)", 422);
  }

  // Validar que no sea domingo según zona horaria Chile (no UTC)
  const diaSemana = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago", weekday: "short",
  }).format(inicioDate);
  if (diaSemana.startsWith("dom")) {
    return apiError("El salón no trabaja los domingos", 422);
  }

  try {
    // 1. Obtener duración del servicio
    const { data: servicio, error: svcErr } = await getSupabaseAdmin()
      .from("servicios")
      .select("duracion_minutos, precio")
      .eq("id", servicio_id)
      .eq("activo", true)
      .single();

    if (svcErr || !servicio) return apiError("Servicio no encontrado o inactivo", 404);

    const duracion = servicio.duracion_minutos as number;
    if (!duracion || duracion <= 0 || duracion > 480) {
      return apiError("Duración del servicio inválida", 422);
    }

    const inicio = new Date(fecha_hora_inicio);
    const fin    = new Date(inicio.getTime() + duracion * 60_000);

    // 2. Verificar que la trabajadora existe y está activa
    const { data: trabajadora, error: tErr } = await getSupabaseAdmin()
      .from("trabajadoras")
      .select("id")
      .eq("id", trabajadora_id)
      .eq("activa", true)
      .single();

    if (tErr || !trabajadora) return apiError("Trabajadora no disponible", 404);

    // 3. Verificar disponibilidad real (race condition check)
    const { data: conflicto, error: confErr } = await getSupabaseAdmin()
      .from("citas")
      .select("id")
      .eq("trabajadora_id", trabajadora_id)
      .neq("estado", "cancelada")
      .lt("fecha_hora_inicio", fin.toISOString())
      .gt("fecha_hora_fin", inicio.toISOString())
      .limit(1);

    if (confErr) throw confErr;
    if (conflicto && conflicto.length > 0) {
      return apiError("El horario ya no está disponible", 409);
    }

    // 4. Upsert cliente por teléfono
    const { data: cliente, error: cliErr } = await getSupabaseAdmin()
      .from("clientes")
      .upsert(
        { nombre: cliente_nombre, telefono: cliente_telefono },
        { onConflict: "telefono", ignoreDuplicates: false }
      )
      .select("id")
      .single();

    if (cliErr || !cliente) throw cliErr;

    // 5. Crear la cita
    const { data: cita, error: citaErr } = await getSupabaseAdmin()
      .from("citas")
      .insert({
        cliente_id:        cliente.id,
        trabajadora_id,
        servicio_id,
        fecha_hora_inicio: inicio.toISOString(),
        fecha_hora_fin:    fin.toISOString(),
        estado:            "pendiente",
      })
      .select("id, fecha_hora_inicio, fecha_hora_fin, estado")
      .single();

    if (citaErr || !cita) {
      // 23P01 = exclusion_violation → la constraint de no-overlap detectó un solapamiento
      // Esto ocurre cuando dos requests llegan simultáneas y ambas pasan el SELECT check
      if ((citaErr as any)?.code === "23P01") {
        return apiError("El horario ya no está disponible", 409);
      }
      throw citaErr;
    }

    return apiOk({ cita }, 201);
  } catch (err) {
    console.error("[appointments POST]", err);
    return apiError("Error interno", 500);
  }
}
