import { google } from "googleapis";

// Chile: UTC-3 permanente (sin daylight saving desde 2015)
const CHILE_UTC_OFFSET_MIN = 3 * 60; // 180 min
const SALON_OPEN_HOUR      = 10;     // 10:00 hora Chile
const SALON_CLOSE_HOUR     = 19;     // 19:00 hora Chile
const SLOT_STEP_MIN        = 15;     // granularidad

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
 * minutesChile: e.g. 10*60 = 600 para las 10:00 hora Chile
 */
function chileMinToUTC(dateStr: string, minutesChile: number): Date {
  const totalUtcMin = minutesChile + CHILE_UTC_OFFSET_MIN;
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
        `${dateStr}T${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:00-03:00`
      );
    }
  }

  return slots;
}

export interface CreateEventParams {
  calendarId:  string;
  summary:     string;
  description: string;
  startIso:    string;
  endIso:      string;
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
