import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { CalendarPatchAppointmentSchema } from "@/lib/schemas";
import { requireApiKey, apiError, apiOk, validationError } from "@/lib/auth";
import { cancelCalendarEvent } from "@/lib/google-calendar";
import { z } from "zod";

// PATCH /api/calendar/appointments/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return apiError("ID de cita inválido", 400);
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return apiError("Body JSON inválido", 400); }

  const parsed = CalendarPatchAppointmentSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  try {
    // 1. Obtener cita con google_event_id y calendar de la trabajadora
    const { data: cita, error: fetchErr } = await getSupabaseAdmin()
      .from("citas")
      .select(`
        id, estado, google_event_id,
        trabajadoras (google_calendar_id)
      `)
      .eq("id", id)
      .single();

    if (fetchErr || !cita) {
      return apiError("Cita no encontrada", 404);
    }

    if (cita.estado === "cancelada") {
      return apiError("La cita ya está cancelada", 409);
    }

    // 2. Cancelar en Google Calendar si corresponde
    const googleEventId = cita.google_event_id as string | null;
    const calendarId    = (cita.trabajadoras as any)?.google_calendar_id as string | null;

    if (googleEventId && calendarId) {
      try {
        await cancelCalendarEvent(calendarId, googleEventId);
      } catch (gcalErr: any) {
        // Si el evento ya no existe en Google Calendar, no bloqueamos la cancelación
        if (gcalErr?.code !== 404 && gcalErr?.status !== 404) {
          console.error("[calendar/appointments PATCH - gcal]", gcalErr);
          return apiError("Error al cancelar en Google Calendar", 502);
        }
      }
    }

    // 3. Actualizar Supabase
    const { data: updated, error: updateErr } = await getSupabaseAdmin()
      .from("citas")
      .update({ estado: "cancelada" })
      .eq("id", id)
      .select("id, estado, google_event_id")
      .single();

    if (updateErr) throw updateErr;

    return apiOk({ cita: updated });
  } catch (err) {
    console.error("[calendar/appointments PATCH]", err);
    return apiError("Error interno", 500);
  }
}
