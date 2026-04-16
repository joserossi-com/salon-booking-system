import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { PatchAppointmentSchema, VALID_TRANSITIONS } from "@/lib/schemas";
import { requireApiKey, requireJson, apiError, apiOk, validationError } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

// ─── PATCH /api/appointments/:id ──────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // MED-05 FIX: rate limit en PATCH — evita spam de cambios de estado
  const ip = getClientIp(req);
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) return apiError("Demasiadas solicitudes.", 429, { "Retry-After": "60" });

  // LOW-02 FIX: validar Content-Type para consistencia con el resto de endpoints
  const jsonError = requireJson(req);
  if (jsonError) return jsonError;

  const authError = requireApiKey(req);
  if (authError) return authError;

  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return apiError("ID de cita inválido", 400);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Body JSON inválido", 400);
  }

  const parsed = PatchAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues);
  }

  const updates = parsed.data;
  if (Object.keys(updates).length === 0) {
    return apiError("Sin campos para actualizar", 400);
  }

  try {
    // Obtener el estado actual antes de actualizar
    const { data: current, error: fetchErr } = await getSupabaseAdmin()
      .from("citas")
      .select("id, estado")
      .eq("id", id)
      .single();

    if (fetchErr || !current) return apiError("Cita no encontrada", 404);

    const estadoAnterior = current.estado as string;

    // Validar transición de estado si se está cambiando
    if (updates.estado) {
      const allowed = VALID_TRANSITIONS[estadoAnterior] ?? [];
      if (!allowed.includes(updates.estado)) {
        return apiError(
          `Transición de estado inválida: ${estadoAnterior} → ${updates.estado}`,
          422
        );
      }
    }

    const { data, error } = await getSupabaseAdmin()
      .from("citas")
      .update(updates)
      .eq("id", id)
      .select("id, estado, precio_cobrado, metodo_pago, notas")
      .single();

    if (error) {
      if (error.code === "PGRST116") return apiError("Cita no encontrada", 404);
      throw error;
    }

    // Audit log — registra cualquier cambio de estado para trazabilidad
    if (updates.estado && updates.estado !== estadoAnterior) {
      await getSupabaseAdmin()
        .from("citas_audit_log")
        .insert({
          cita_id:        id,
          estado_anterior: estadoAnterior,
          estado_nuevo:    updates.estado,
          changed_at:      new Date().toISOString(),
          source:          "api",
        })
        .then(({ error: logErr }) => {
          if (logErr) console.warn("[audit log] no se pudo registrar:", logErr.message);
        });
    }

    return apiOk({ cita: data });
  } catch (err) {
    console.error("[appointments PATCH]", err);
    return apiError("Error interno", 500);
  }
}
