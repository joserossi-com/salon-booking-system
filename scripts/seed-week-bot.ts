/**
 * Seed Week — Simula una semana de reservas reales en Kitty Studio
 *
 * Crea 42 citas (7 por día, lun-sáb) pasando por el bot de Telegram completo
 * (Claude Haiku + Supabase + Google Calendar). Cada cita es una conversación
 * de 3 turnos con una "clienta" distinta.
 *
 * Uso:
 *   npx tsx scripts/seed-week-bot.ts              # crear citas
 *   npx tsx scripts/seed-week-bot.ts --cleanup     # eliminar citas del log
 *   npx tsx scripts/seed-week-bot.ts --target local
 *
 * Requisitos (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_WEBHOOK_SECRET
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

// ─── Load env ────────────────────────────────────────────────────────────────

try {
  const envPath = resolve(__dirname, "../.env.local");
  const envFile = readFileSync(envPath, "utf8");
  for (const line of envFile.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* no .env.local */ }

// ─── Config ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isCleanup = args.includes("--cleanup");
const isDirect  = args.includes("--direct");
const target = args.includes("--target") ? args[args.indexOf("--target") + 1] : "prod";

const WEBHOOK_URL = target === "local"
  ? "http://localhost:3000/api/webhook/telegram"
  : "https://kittystudio.vercel.app/api/webhook/telegram";

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";
const SUPABASE_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const BOT_API_KEY = process.env.BOT_API_KEY ?? "";
const CALENDAR_URL = target === "local"
  ? "http://localhost:3000/api/calendar/appointments"
  : "https://kittystudio.vercel.app/api/calendar/appointments";

if (!SUPABASE_URL || !SUPABASE_KEY) { console.error("Faltan vars de Supabase"); process.exit(1); }
if (!WEBHOOK_SECRET && !isCleanup && !isDirect) { console.error("Falta TELEGRAM_WEBHOOK_SECRET"); process.exit(1); }
if (!BOT_API_KEY && isDirect) { console.error("Falta BOT_API_KEY para modo --direct"); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const LOG_PATH = resolve(__dirname, "seed-week-bot-log.json");

// ─── Types ───────────────────────────────────────────────────────────────────

interface Booking {
  chatId:   number;
  nombre:   string;
  tel:      string;
  servicio: string;
  hora:     string;
  dayIndex: number; // 0=lunes ... 5=sábado
}

interface ConvMessage { role: "user" | "assistant"; content: string }

interface BookingResult {
  chatId:   number;
  nombre:   string;
  servicio: string;
  hora:     string;
  day:      string;
  status:   "ok" | "conflict" | "failed" | "timeout";
  detail:   string;
}

// ─── Date helpers ────────────────────────────────────────────────────────────

function getNextMonday(): Date {
  const d = new Date();
  const dow = d.getDay(); // 0=sun
  const daysAhead = dow === 0 ? 1 : (8 - dow);
  d.setDate(d.getDate() + daysAhead);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateHuman(d: Date): string {
  return d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
}

function formatDateISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAY_NAMES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

// ─── Bot communication ──────────────────────────────────────────────────────

async function sendToBot(chatId: number, text: string): Promise<void> {
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-telegram-bot-api-secret-token": WEBHOOK_SECRET,
    },
    body: JSON.stringify({
      message: {
        message_id: Math.floor(Math.random() * 100000),
        from: { id: chatId, first_name: "Seed", is_bot: false },
        chat: { id: chatId, type: "private" },
        date: Math.floor(Date.now() / 1000),
        text,
      },
    }),
  });
  if (!res.ok) throw new Error(`Webhook ${res.status}`);
}

async function waitBotResponse(
  chatId: number,
  expectedCount: number,
  timeoutMs = 60_000,
): Promise<string | null> {
  const chatIdStr = String(chatId);
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { data } = await supabase
      .from("conversaciones")
      .select("mensajes")
      .eq("chat_id", chatIdStr)
      .maybeSingle();
    const msgs = (data?.mensajes ?? []) as ConvMessage[];
    if (msgs.length >= expectedCount) {
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") return last.content;
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
  return null;
}

// ─── Booking conversation ────────────────────────────────────────────────────

async function runBooking(booking: Booking, dateHuman: string): Promise<BookingResult> {
  const base: Omit<BookingResult, "status" | "detail"> = {
    chatId: booking.chatId, nombre: booking.nombre,
    servicio: booking.servicio, hora: booking.hora, day: dateHuman,
  };
  let msgCount = 0;

  try {
    // Turn 1: servicio + fecha + hora
    await sendToBot(booking.chatId, `Hola! Quiero agendar ${booking.servicio} para el ${dateHuman} a las ${booking.hora}`);
    const r1 = await waitBotResponse(booking.chatId, msgCount + 2, 60_000);
    if (!r1) return { ...base, status: "timeout", detail: "Turn 1 timeout" };
    msgCount += 2;

    // Turn 2: nombre + teléfono
    await sendToBot(booking.chatId, `Soy ${booking.nombre}, mi número es ${booking.tel}`);
    const r2 = await waitBotResponse(booking.chatId, msgCount + 2, 60_000);
    if (!r2) return { ...base, status: "timeout", detail: "Turn 2 timeout" };
    msgCount += 2;

    // If bot asks for more info (e.g. apellido), handle it
    const needsMore = r2.toLowerCase().includes("apellido") ||
                      (r2.includes("?") && !r2.toLowerCase().includes("confirma"));
    if (needsMore) {
      // Give full name again more explicitly
      await sendToBot(booking.chatId, `Mi nombre completo es ${booking.nombre} y mi teléfono ${booking.tel}`);
      const r2b = await waitBotResponse(booking.chatId, msgCount + 2, 60_000);
      if (!r2b) return { ...base, status: "timeout", detail: "Turn 2b timeout" };
      msgCount += 2;
    }

    // Turn 3: confirm
    await sendToBot(booking.chatId, "dale, confirmo");
    const r3 = await waitBotResponse(booking.chatId, msgCount + 2, 60_000);
    if (!r3) return { ...base, status: "timeout", detail: "Turn 3 timeout" };
    msgCount += 2;

    // Check result
    const lower = r3.toLowerCase();
    if (lower.includes("✅") || lower.includes("agendada")) {
      return { ...base, status: "ok", detail: "Cita creada" };
    }
    if (lower.includes("⚠️") || lower.includes("no disponible") || lower.includes("conflicto")) {
      return { ...base, status: "conflict", detail: "Conflicto de horario" };
    }

    // If we got a summary instead of confirmation (bot hasn't seen [BOOKING] yet)
    // Try confirming one more time
    if (lower.includes("resumen") || lower.includes("confirma") || lower.includes("📅")) {
      await sendToBot(booking.chatId, "sí, confirmo");
      const r4 = await waitBotResponse(booking.chatId, msgCount + 2, 60_000);
      if (!r4) return { ...base, status: "timeout", detail: "Turn 4 timeout" };
      msgCount += 2;
      const l4 = r4.toLowerCase();
      if (l4.includes("✅") || l4.includes("agendada")) {
        return { ...base, status: "ok", detail: "Cita creada (turno extra)" };
      }
      if (l4.includes("⚠️") || l4.includes("no disponible")) {
        return { ...base, status: "conflict", detail: "Conflicto de horario" };
      }
      return { ...base, status: "failed", detail: `Respuesta inesperada: ${r4.slice(0, 120)}` };
    }

    return { ...base, status: "failed", detail: `Respuesta inesperada: ${r3.slice(0, 120)}` };
  } catch (err) {
    return { ...base, status: "failed", detail: String(err) };
  }
}

// ─── Direct booking (bypass Claude, call calendar API directly) ─────────────

/** Chile ISO offset for a date */
function chileOffset(dateStr: string): string {
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/Santiago", timeZoneName: "longOffset" });
  const parts = fmt.formatToParts(new Date(`${dateStr}T12:00:00Z`));
  const tz = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT-04:00";
  return tz.replace("GMT", "") || "-04:00";
}

/** Map service name (as client says it) → real service_id + trabajadora_id */
const SERVICE_MAP: Record<string, { servicioId: string; trabajadoraId: string }> = {
  // Nicole — uñas + depilación
  "esmaltado":                    { servicioId: "7bae8f20-b1f2-4f93-870d-0d89b5925223", trabajadoraId: "6f040372-3229-4d33-9442-61dfa176da8b" },
  "kapping":                      { servicioId: "1c6577f9-9931-4c41-8af2-0978701ca75c", trabajadoraId: "6f040372-3229-4d33-9442-61dfa176da8b" },
  "soft gel":                     { servicioId: "32d31e07-7162-42e0-a261-6e5359e38edf", trabajadoraId: "6f040372-3229-4d33-9442-61dfa176da8b" },
  "acrílicas con tips":           { servicioId: "64f38029-7b1a-45fa-b055-0b4860542bf9", trabajadoraId: "6f040372-3229-4d33-9442-61dfa176da8b" },
  "manicura":                     { servicioId: "f20f7eec-25ab-4dd3-b7e9-51ce475edb42", trabajadoraId: "6f040372-3229-4d33-9442-61dfa176da8b" },
  "polygel con tips":             { servicioId: "7bacf589-27a6-49c5-9987-5fcea5e7f37c", trabajadoraId: "6f040372-3229-4d33-9442-61dfa176da8b" },
  "pedicura con esmaltado":       { servicioId: "78b42e64-ffba-4843-9533-d99b9736d2d3", trabajadoraId: "6f040372-3229-4d33-9442-61dfa176da8b" },
  "depilación de piernas":        { servicioId: "539d440d-f29c-4b52-aa80-cd00d1d57d22", trabajadoraId: "6f040372-3229-4d33-9442-61dfa176da8b" },
  "depilación rostro completo":   { servicioId: "d198ef63-4d80-474a-b29b-9112f4a1757f", trabajadoraId: "6f040372-3229-4d33-9442-61dfa176da8b" },
  "depilación de cejas":          { servicioId: "336dd406-5906-4037-8396-ff854cc15a35", trabajadoraId: "6f040372-3229-4d33-9442-61dfa176da8b" },
  "depilación de axilas":         { servicioId: "cc4c20c1-84b6-4949-8e42-06cd0806b793", trabajadoraId: "6f040372-3229-4d33-9442-61dfa176da8b" },
  // Constanza — cabello + masajes
  "masaje relajante":             { servicioId: "f5a8269d-dfaa-4bbd-92c5-709c66d2ce12", trabajadoraId: "bd19a647-85d6-47a9-9f07-eb23b436301e" },
  "masaje con piedras calientes": { servicioId: "9f675346-6bb0-4241-a971-fb9dacd07788", trabajadoraId: "bd19a647-85d6-47a9-9f07-eb23b436301e" },
  "corte de cabello":             { servicioId: "685405df-9c76-441d-b978-7990bc7afc0f", trabajadoraId: "bd19a647-85d6-47a9-9f07-eb23b436301e" },
  // Kitty — pestañas + cejas + facial
  "extensiones clásicas de pestañas": { servicioId: "3ab8da94-4043-44ae-832a-c18f6326de77", trabajadoraId: "74dcd59f-9a56-40d2-867e-979134c50160" },
  "extensiones wispy":            { servicioId: "82803898-30ea-4a03-8048-f990e3b76062", trabajadoraId: "74dcd59f-9a56-40d2-867e-979134c50160" },
  "hawaianas":                    { servicioId: "db0b3f3d-ca6f-4347-95e6-d58a1354996e", trabajadoraId: "74dcd59f-9a56-40d2-867e-979134c50160" },
  "lifting de pestañas":          { servicioId: "df80fcd9-129c-4816-87f1-3da6ef3b7cfe", trabajadoraId: "74dcd59f-9a56-40d2-867e-979134c50160" },
  "perfilado de cejas":           { servicioId: "d9fbeb80-0ab6-4dcf-9c5a-38f53faac9e4", trabajadoraId: "74dcd59f-9a56-40d2-867e-979134c50160" },
  "laminado de cejas":            { servicioId: "a85917e8-725b-46d5-85ea-6c40c6a5e14e", trabajadoraId: "74dcd59f-9a56-40d2-867e-979134c50160" },
  "limpieza facial":              { servicioId: "e32c3642-7baf-412a-96e7-99f584eda648", trabajadoraId: "74dcd59f-9a56-40d2-867e-979134c50160" },
};

const WORKER_NAMES: Record<string, string> = {
  "6f040372-3229-4d33-9442-61dfa176da8b": "Nicole",
  "bd19a647-85d6-47a9-9f07-eb23b436301e": "Constanza",
  "74dcd59f-9a56-40d2-867e-979134c50160": "Kitty",
};

async function runBookingDirect(booking: Booking, dateISO: string): Promise<BookingResult> {
  const base: Omit<BookingResult, "status" | "detail"> = {
    chatId: booking.chatId, nombre: booking.nombre,
    servicio: booking.servicio, hora: booking.hora, day: dateISO,
  };
  const mapping = SERVICE_MAP[booking.servicio];
  if (!mapping) return { ...base, status: "failed", detail: `Servicio "${booking.servicio}" no mapeado` };

  const [hh, mm] = booking.hora.split(":").map(Number);
  const offset = chileOffset(dateISO);
  const fechaIso = `${dateISO}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00${offset}`;

  try {
    const res = await fetch(CALENDAR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": BOT_API_KEY },
      body: JSON.stringify({
        cliente_nombre:    booking.nombre,
        cliente_telefono:  booking.tel,
        trabajadora_id:    mapping.trabajadoraId,
        servicio_id:       mapping.servicioId,
        fecha_hora_inicio: fechaIso,
      }),
    });

    const worker = WORKER_NAMES[mapping.trabajadoraId] ?? "?";
    if (res.status === 201) {
      return { ...base, status: "ok", detail: `${worker}` };
    }
    if (res.status === 409) {
      return { ...base, status: "conflict", detail: `Conflicto (${worker})` };
    }
    const body = await res.text().catch(() => "");
    return { ...base, status: "failed", detail: `HTTP ${res.status}: ${body.slice(0, 100)}` };
  } catch (err) {
    return { ...base, status: "failed", detail: String(err).slice(0, 100) };
  }
}

// ─── Schedule ────────────────────────────────────────────────────────────────

// Schedule with explicit worker assignment to avoid conflicts.
// Each slot specifies hora + servicio + worker to guarantee no overlaps.
// Durations considered: esmaltado 45m, manicura 30m, depilación cejas 20m,
// perfilado 20m, kapping 90m, soft gel 90m, pedicura+esm 60m, masaje relaj 75m,
// masaje piedras 75m, corte 45m, ext clásicas 120m, ext wispy 150m, hawaianas 120m,
// lifting 60m, laminado cejas 60m, limpieza facial 75m, polygel 120m, dep piernas 60m
type SlotDef = { hora: string; servicio: string };
const SCHEDULE: SlotDef[][] = [
  // LUNES — 6 citas (Nicole 3, Kitty 2, Constanza 1)
  [
    { hora: "10:00", servicio: "esmaltado" },             // Nicole 45m → libre 10:45
    { hora: "11:00", servicio: "manicura" },               // Nicole 30m → libre 11:30
    { hora: "12:00", servicio: "depilación de cejas" },    // Nicole 20m → libre 12:20
    { hora: "10:00", servicio: "extensiones clásicas de pestañas" }, // Kitty 120m → libre 12:00
    { hora: "14:00", servicio: "lifting de pestañas" },    // Kitty 60m → libre 15:00
    { hora: "15:00", servicio: "masaje relajante" },       // Constanza 75m → libre 16:15
  ],
  // MARTES — 6 citas (Nicole 2, Kitty 2, Constanza 2)
  [
    { hora: "10:00", servicio: "kapping" },                // Nicole 90m → libre 11:30
    { hora: "14:00", servicio: "pedicura con esmaltado" }, // Nicole 60m → libre 15:00
    { hora: "10:00", servicio: "hawaianas" },              // Kitty 120m → libre 12:00
    { hora: "13:00", servicio: "perfilado de cejas" },     // Kitty 20m → libre 13:20
    { hora: "10:00", servicio: "masaje con piedras calientes" }, // Constanza 75m → libre 11:15
    { hora: "12:00", servicio: "corte de cabello" },       // Constanza 45m → libre 12:45
  ],
  // MIÉRCOLES — 5 citas (Nicole 2, Kitty 2, Constanza 1)
  [
    { hora: "10:00", servicio: "soft gel" },               // Nicole 90m → libre 11:30
    { hora: "15:00", servicio: "depilación de piernas" },  // Nicole 60m → libre 16:00
    { hora: "10:00", servicio: "extensiones wispy" },      // Kitty 150m → libre 12:30
    { hora: "14:00", servicio: "laminado de cejas" },      // Kitty 60m → libre 15:00
    { hora: "16:00", servicio: "masaje relajante" },       // Constanza 75m → libre 17:15
  ],
  // JUEVES — 5 citas (Nicole 2, Kitty 2, Constanza 1)
  [
    { hora: "10:00", servicio: "esmaltado" },              // Nicole 45m → libre 10:45
    { hora: "11:00", servicio: "polygel con tips" },       // Nicole 120m → libre 13:00
    { hora: "10:00", servicio: "limpieza facial" },        // Kitty 75m → libre 11:15
    { hora: "15:00", servicio: "perfilado de cejas" },     // Kitty 20m → libre 15:20
    { hora: "14:00", servicio: "corte de cabello" },       // Constanza 45m → libre 14:45
  ],
  // VIERNES — 5 citas (Nicole 2, Kitty 2, Constanza 1)
  [
    { hora: "10:00", servicio: "acrílicas con tips" },     // Nicole 120m → libre 12:00
    { hora: "16:00", servicio: "depilación de axilas" },   // Nicole 20m → libre 16:20
    { hora: "10:00", servicio: "hawaianas" },              // Kitty 120m → libre 12:00
    { hora: "14:00", servicio: "lifting de pestañas" },    // Kitty 60m → libre 15:00
    { hora: "10:00", servicio: "masaje con piedras calientes" }, // Constanza 75m → libre 11:15
  ],
  // SÁBADO — 5 citas (Nicole 2, Kitty 2, Constanza 1)
  [
    { hora: "10:00", servicio: "esmaltado" },              // Nicole 45m → libre 10:45
    { hora: "13:00", servicio: "depilación rostro completo" }, // Nicole 30m → libre 13:30
    { hora: "10:00", servicio: "extensiones clásicas de pestañas" }, // Kitty 120m → libre 12:00
    { hora: "14:00", servicio: "laminado de cejas" },      // Kitty 60m → libre 15:00
    { hora: "12:00", servicio: "masaje relajante" },       // Constanza 75m → libre 13:15
  ],
];

// Servicios variados (nombres tal como las clientas los piden)
const SERVICIOS = [
  "esmaltado", "kapping", "soft gel", "acrílicas con tips", "manicura",
  "pedicura con esmaltado", "extensiones clásicas de pestañas", "extensiones wispy",
  "hawaianas", "lifting de pestañas", "perfilado de cejas", "laminado de cejas",
  "depilación de cejas", "depilación de piernas", "depilación rostro completo",
  "masaje relajante", "masaje con piedras calientes", "limpieza facial",
  "corte de cabello", "polygel con tips", "depilación de axilas",
];

// Nombres chilenos variados (42 clientas únicas)
const NOMBRES = [
  "Valentina Rojas", "Camila Soto", "Francisca Muñoz", "Isidora Pérez",
  "Catalina Vega", "Javiera Castro", "Antonia Silva", "Sofía Morales",
  "Martina López", "Florencia Díaz", "Amanda Torres", "Constanza Herrera",
  "Macarena Fuentes", "Daniela Núñez", "Fernanda Reyes", "Gabriela Contreras",
  "Josefa Vargas", "Emilia Espinoza", "Agustina Bravo", "Paula Guzmán",
  "Trinidad Araya", "Ignacia Navarro", "Renata Figueroa", "Belén Ortiz",
  "Monserrat Parra", "Amparo Campos", "Magdalena Riquelme", "Rocío Tapia",
  "Victoria Sandoval", "Isabella Sepúlveda", "Julieta Vergara", "Luciana Aravena",
  "Clara Henríquez", "Elena Valenzuela", "Matilda Córdova", "Olivia Pizarro",
  "Alondra Cáceres", "Esperanza Molina", "Aurora Bustamante", "Regina Salas",
  "Alma Garrido", "Dominga Uribe",
];

function buildBookings(): Booking[] {
  const bookings: Booking[] = [];
  let nameIdx = 0;

  for (let day = 0; day < 6; day++) {
    for (let slot = 0; slot < SCHEDULE[day].length; slot++) {
      const s = SCHEDULE[day][slot];
      bookings.push({
        chatId:   88881001 + day * 100 + slot,
        nombre:   NOMBRES[nameIdx % NOMBRES.length],
        tel:      `+5691234${String(nameIdx + 1).padStart(4, "0")}`,
        servicio: s.servicio,
        hora:     s.hora,
        dayIndex: day,
      });
      nameIdx++;
    }
  }
  return bookings;
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

async function doCleanup() {
  if (!existsSync(LOG_PATH)) {
    console.log("No se encontró log en", LOG_PATH);
    process.exit(0);
  }
  const log = JSON.parse(readFileSync(LOG_PATH, "utf8")) as BookingResult[];
  const chatIds = log.map((r) => String(r.chatId));

  console.log(`🧹 Limpiando ${log.length} registros del log...`);

  // 1. Delete conversaciones
  if (chatIds.length > 0) {
    const { error } = await supabase.from("conversaciones").delete().in("chat_id", chatIds);
    console.log(error ? `  ⚠ conversaciones: ${error.message}` : `  ✓ ${chatIds.length} conversaciones`);
  }

  // 2. Delete citas + clientes for seed names
  const seedNames = [...new Set(log.map((r) => r.nombre))];
  for (const nombre of seedNames) {
    const { data: clientes } = await supabase.from("clientes").select("id").eq("nombre", nombre);
    if (clientes && clientes.length > 0) {
      const ids = clientes.map((c) => c.id);
      await supabase.from("citas").delete().in("cliente_id", ids);
      await supabase.from("clientes").delete().in("id", ids);
    }
  }
  console.log(`  ✓ Citas y clientes de ${seedNames.length} clientas eliminados`);
  console.log("✅ Cleanup completado.");
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (isCleanup) { await doCleanup(); return; }

  const monday = getNextMonday();
  const dates = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const mode = isDirect ? "DIRECT (calendar API)" : "BOT (Claude Haiku)";
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   SEED WEEK — KITTY STUDIO (42 citas)                ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log(`Modo:   ${mode}`);
  console.log(`Target: ${isDirect ? CALENDAR_URL : WEBHOOK_URL}`);
  console.log(`Semana: ${formatDateHuman(dates[0])} → ${formatDateHuman(dates[5])}`);
  console.log("");

  const bookings = buildBookings();
  const allResults: BookingResult[] = [];

  for (let day = 0; day < 6; day++) {
    const date = dates[day];
    const dateHuman = formatDateHuman(date);
    const dayBookings = bookings.filter((b) => b.dayIndex === day);
    const dateISO = formatDateISO(date);

    console.log(`\n📅 ${DAY_NAMES[day].toUpperCase()} ${dateISO} (${dayBookings.length} citas)`);

    const results: PromiseSettledResult<BookingResult>[] = [];

    if (isDirect) {
      // Direct mode: call calendar API — sequential with delay to avoid 429 rate limit
      for (const b of dayBookings) {
        try {
          const r = await runBookingDirect(b, dateISO);
          results.push({ status: "fulfilled", value: r });
        } catch (err) {
          results.push({ status: "rejected", reason: err });
        }
        await new Promise(r => setTimeout(r, 1500));
      }
    } else {
      // Bot mode: sequential conversations through Claude (slow, may timeout)
      for (const b of dayBookings) {
        try {
          const r = await runBooking(b, dateHuman);
          results.push({ status: "fulfilled", value: r });
        } catch (err) {
          results.push({ status: "rejected", reason: err });
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    for (const [i, r] of results.entries()) {
      const booking = dayBookings[i];
      if (r.status === "fulfilled") {
        const res = r.value;
        allResults.push(res);
        const icon = res.status === "ok" ? "✅" : res.status === "conflict" ? "⚠️ " : "❌";
        console.log(`  ${icon} ${res.nombre} — ${res.servicio} — ${res.hora} — ${res.detail}`);
      } else {
        const fail: BookingResult = {
          chatId: booking.chatId, nombre: booking.nombre,
          servicio: booking.servicio, hora: booking.hora,
          day: dateHuman, status: "failed", detail: String(r.reason),
        };
        allResults.push(fail);
        console.log(`  ❌ ${booking.nombre} — ${booking.servicio} — ${booking.hora} — ERROR: ${String(r.reason).slice(0, 80)}`);
      }
    }
  }

  // ── Summary ──

  const ok       = allResults.filter((r) => r.status === "ok").length;
  const conflict = allResults.filter((r) => r.status === "conflict").length;
  const failed   = allResults.filter((r) => r.status === "failed" || r.status === "timeout").length;

  console.log("\n════════════════════════════════════════════════════");
  console.log("  RESUMEN FINAL");
  console.log("════════════════════════════════════════════════════");
  console.log(`  ✅ ${ok} citas creadas exitosamente`);
  if (conflict > 0) console.log(`  ⚠️  ${conflict} conflictos de horario`);
  if (failed > 0)   console.log(`  ❌ ${failed} fallidas`);
  console.log(`  📊 Total: ${allResults.length} intentos`);

  // Save log
  writeFileSync(LOG_PATH, JSON.stringify(allResults, null, 2));
  console.log(`\n💾 Log guardado en ${LOG_PATH}`);
  console.log(`   Para cleanup: npx tsx scripts/seed-week-bot.ts --cleanup`);

  if (!isDirect) {
    // Cleanup conversaciones (no las citas — esas son el punto)
    const chatIds = allResults.map((r) => String(r.chatId));
    await supabase.from("conversaciones").delete().in("chat_id", chatIds);
    console.log(`🧹 ${chatIds.length} conversaciones de seed limpiadas`);
  }
  console.log("");
}

main().catch((err) => { console.error("Error fatal:", err); process.exit(2); });
