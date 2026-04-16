import { google } from "googleapis";

// Chile SÍ tiene DST desde 2019 (decreto 975):
//   - UTC-3 en verano (primer sábado de septiembre → primer sábado de abril)
//   - UTC-4 en invierno (primer sábado de abril → primer sábado de septiembre)
// Antes se asumía UTC-3 fijo, lo que causaba shift de 1h en invierno.
const SALON_OPEN_HOUR  = 10;  // 10:00 hora Chile
const SALON_CLOSE_HOUR = 19;  // 19:00 hora Chile
const SLOT_STEP_MIN    = 15;  // granularidad

/**
 * Calcula el offset UTC de Chile para una fecha dada, respetando DST.
 * Retorna minutos positivos para offset negativo (ej: UTC-4 → 240).
 */
function getChileOffsetMinutes(dateStr: string): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santiago",
    timeZoneName: "longOffset",
  });
  const d = new Date(`${dateStr}T12:00:00Z`); // mediodía para evitar bordes DST
  const parts = fmt.formatToParts(d);
  const tz = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT-04:00";
  const match = tz.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) return 4 * 60; // fallback UTC-4
  const sign = match[1] === "-" ? 1 : -1; // GMT-04:00 → +240 min
  return sign * (parseInt(match[2]) * 60 + parseInt(match[3]));
}

/** Retorna el suffix ISO (ej: "-04:00" o "-03:00") para una fecha en Chile */
function getChileIsoSuffix(dateStr: string): string {
  const offsetMin = getChileOffsetMinutes(dateStr);
  const sign = offsetMin >= 0 ? "-" : "+";
  const h = Math.floor(Math.abs(offsetMin) / 60);
  const m = Math.abs(offsetMin) % 60;
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getGoogleAuth() {
  const email      = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !privateKey) {
    throw new Error("Faltan variables de entorno de Google Service Account");
  }
  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

/**
 * Convierte "YYYY-MM-DD" + hora en Chile (minutos desde medianoche) a Date UTC.
 * Usa el offset real de Chile para esa fecha (respetando DST).
 */
function chileMinToUTC(dateStr: string, minutesChile: number): Date {
  const offsetMin = getChileOffsetMinutes(dateStr);
  const totalUtcMin = minutesChile + offsetMin;
  const utcHour = Math.floor(totalUtcMin / 60);
  const utcMin  = totalUtcMin % 60;
  return new Date(
    `${dateStr}T${String(utcHour).padStart(2, "0")}:${String(utcMin).padStart(2, "0")}:00Z`
  );
}

export interface BusySlot {
  start: Date;
  end:   Date;
}

/** Retorna los bloques ocupados del Google Calendar de la trabajadora para el día */
export async function getBusySlots(calendarId: string, dateStr: string): Promise<BusySlot[]> {
  const auth     = getGoogleAuth();
  const calendar = google.calendar({ version: "v3", auth });

  const timeMin = chileMinToUTC(dateStr, SALON_OPEN_HOUR  * 60).toISOString();
  const timeMax = chileMinToUTC(dateStr, SALON_CLOSE_HOUR * 60).toISOString();

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: [{ id: calendarId }],
    },
  });

  const busy = res.data.calendars?.[calendarId]?.busy ?? [];
  return busy.map((b) => ({
    start: new Date(b.start as string),
    end:   new Date(b.end   as string),
  }));
}

/** Genera slots libres de `duracionMin` minutos para el día */
export function generateAvailableSlots(
  dateStr:    string,
  duracionMin: number,
  busy:        BusySlot[]
): string[] {
  const slots: string[] = [];
  const openMin  = SALON_OPEN_HOUR  * 60; // 600
  const closeMin = SALON_CLOSE_HOUR * 60; // 1140

  for (let m = openMin; m + duracionMin <= closeMin; m += SLOT_STEP_MIN) {
    const slotStart = chileMinToUTC(dateStr, m);
    const slotEnd   = new Date(slotStart.getTime() + duracionMin * 60_000);

    const libre = busy.every((b) => slotEnd <= b.start || slotStart >= b.end);

    if (libre) {
      const h   = Math.floor(m / 60);
      const min = m % 60;
      slots.push(
        `${dateStr}T${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:00${getChileIsoSuffix(dateStr)}`
      );
    }
  }

  return slots;
}

// Paleta Kitty Studio → color más cercano disponible en Google Calendar
// Kitty (74dcd59f): Banana (5) ≈ dorado #A67C2A
// Nicole (6f040372): Flamingo (4) ≈ crema cálida
// Constanza (bd19a647): Lavender (1) ≈ blanco/neutro
export const WORKER_COLOR: Record<string, string> = {
  "74dcd59f-9a56-40d2-867e-979134c50160": "5", // Kitty     → Banana (dorado)
  "6f040372-3229-4d33-9442-61dfa176da8b": "4", // Nicole    → Flamingo (crema)
  "bd19a647-85d6-47a9-9f07-eb23b436301e": "1", // Constanza → Lavender (blanco)
};

export interface CreateEventParams {
  calendarId:   string;
  summary:      string;
  description:  string;
  startIso:     string;
  endIso:       string;
  trabajadoraId?: string;
}

/**
 * Busca un evento existente en el mismo calendarId con el mismo startTime.
 * Retorna el eventId si existe, null si no. Esto previene duplicados cuando
 * el mismo booking se procesa más de una vez (retries, re-runs de seeds).
 */
export async function findExistingEvent(
  calendarId: string,
  startIso:   string,
  endIso:     string,
): Promise<string | null> {
  const auth     = getGoogleAuth();
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.events.list({
    calendarId,
    timeMin:      new Date(startIso).toISOString(),
    timeMax:      new Date(endIso).toISOString(),
    singleEvents: true,
    maxResults:   5,
  });

  const events = res.data.items ?? [];
  // Match: any event that starts at the exact same time
  const startMs = new Date(startIso).getTime();
  const match = events.find((e) => {
    const eStart = new Date(e.start?.dateTime ?? "").getTime();
    return eStart === startMs;
  });

  return match?.id ?? null;
}

/** Crea un evento en Google Calendar y retorna el eventId */
export async function createCalendarEvent(params: CreateEventParams): Promise<string> {
  const auth     = getGoogleAuth();
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.events.insert({
    calendarId: params.calendarId,
    requestBody: {
      summary:     params.summary,
      description: params.description,
      start: { dateTime: params.startIso, timeZone: "America/Santiago" },
      end:   { dateTime: params.endIso,   timeZone: "America/Santiago" },
      colorId: params.trabajadoraId ? (WORKER_COLOR[params.trabajadoraId] ?? "0") : "0",
    },
  });

  const eventId = res.data.id;
  if (!eventId) throw new Error("Google Calendar no devolvió un eventId");
  return eventId;
}

/** Elimina un evento de Google Calendar */
export async function cancelCalendarEvent(calendarId: string, eventId: string): Promise<void> {
  const auth     = getGoogleAuth();
  const calendar = google.calendar({ version: "v3", auth });
  await calendar.events.delete({ calendarId, eventId });
}

/** true si el día es lunes–sábado en hora Chile */
export function isValidSalonDay(dateStr: string): boolean {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay(); // 0=Dom
  return dow >= 1 && dow <= 6;
}
