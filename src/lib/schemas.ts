import { z } from "zod";

const uuid = z.string().uuid();

// Sanitización de texto libre: recorta, elimina caracteres de control
function sanitizeText(max: number) {
  return z
    .string()
    .max(max)
    .transform((s) => s.trim().replace(/[\x00-\x1F\x7F]/g, ""));
}

export const AvailabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido. Usa YYYY-MM-DD"),
  servicio_id: uuid,
});

// Valida que una fecha ISO sea futura y no esté a más de 60 días
const futureDate = z
  .string()
  .datetime({ offset: true })
  .refine((s) => new Date(s) > new Date(), { message: "La fecha debe ser futura" })
  .refine(
    (s) => {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 60);
      return new Date(s) <= maxDate;
    },
    { message: "No se puede reservar con más de 60 días de anticipación" }
  );

export const CreateAppointmentSchema = z.object({
  cliente_nombre:     sanitizeText(100),
  cliente_telefono:   z.string().regex(/^\+?[\d\s\-]{7,20}$/, "Teléfono inválido"),
  trabajadora_id:     uuid,
  servicio_id:        uuid,
  fecha_hora_inicio:  futureDate,
});

export const AppointmentsDayQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido. Usa YYYY-MM-DD"),
});

// Transiciones válidas de estado (máquina de estados)
// pendiente → confirmada | cancelada
// confirmada → completada | cancelada
// completada y cancelada son estados finales
export const VALID_TRANSITIONS: Record<string, string[]> = {
  pendiente:  ["confirmada", "cancelada"],
  confirmada: ["completada", "cancelada"],
  completada: [],
  cancelada:  [],
};

export const PatchAppointmentSchema = z.object({
  estado:         z.enum(["pendiente", "confirmada", "cancelada", "completada"]).optional(),
  precio_cobrado: z.number().int().min(0).optional(),
  metodo_pago:    z.enum(["efectivo", "transferencia", "debito", "credito"]).optional(),
  notas:          sanitizeText(500).optional(),
});

// ── Calendar endpoints ────────────────────────────────────────────────────────

export const CalendarAvailabilitySchema = z.object({
  fecha:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido. Usa YYYY-MM-DD"),
  servicio_id:   uuid,
  trabajadora_id: uuid,
});

export const CalendarCreateAppointmentSchema = z.object({
  cliente_nombre:    sanitizeText(100),
  cliente_telefono:  z.string().regex(/^\+?[\d\s\-]{7,20}$/, "Teléfono inválido"),
  trabajadora_id:    uuid,
  servicio_id:       uuid,
  fecha_hora_inicio: futureDate,
});

export const CalendarPatchAppointmentSchema = z.object({
  estado: z.enum(["cancelada"]), // por ahora solo se puede cancelar
});
