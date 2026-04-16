/**
 * Cleanup duplicates in Google Calendar for Kitty Studio
 *
 * Lists all events in the specified date range across all worker calendars,
 * detects duplicates (same summary + same startTime), and deletes extras
 * keeping only one copy of each.
 *
 * Usage:
 *   npx tsx scripts/cleanup-duplicates.ts                    # 13-18 abril 2026
 *   npx tsx scripts/cleanup-duplicates.ts --all              # delete ALL events in range (not just dupes)
 *   npx tsx scripts/cleanup-duplicates.ts --dry-run          # show what would be deleted
 */

import { google } from "googleapis";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load env — prefer .env.vercel.production (has valid Google key), fallback .env.local
for (const envName of [".env.vercel.production", ".env.local"]) {
  try {
    const envPath = resolve(__dirname, `../${envName}`);
    const envFile = readFileSync(envPath, "utf8");
    for (const line of envFile.split("\n")) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* file not found */ }
}

const args = process.argv.slice(2);
const deleteAll = args.includes("--all");
const dryRun    = args.includes("--dry-run");

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) { console.error("Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY"); process.exit(1); }
  return new google.auth.JWT({ email, key, scopes: ["https://www.googleapis.com/auth/calendar"] });
}

// Worker calendar IDs — query from Supabase or hardcode
// Using the main calendar since all events are created there via service account
const MAIN_CALENDAR = "joserossi.angulo@gmail.com";

// Date range: April 13-18, 2026 (old test week) + April 20-25 (new test week)
const TIME_MIN = "2026-04-13T00:00:00-04:00";
const TIME_MAX = "2026-04-26T00:00:00-04:00";

interface CalEvent {
  id:      string;
  summary: string;
  start:   string;
  end:     string;
}

async function main() {
  const auth = getAuth();
  const calendar = google.calendar({ version: "v3", auth });

  console.log(`🔍 Buscando eventos en ${MAIN_CALENDAR}`);
  console.log(`   Rango: ${TIME_MIN} → ${TIME_MAX}`);
  console.log(`   Modo: ${deleteAll ? "DELETE ALL" : dryRun ? "DRY RUN" : "DUPLICATES ONLY"}\n`);

  // Also check each worker's calendar
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: workers } = await sb
    .from("trabajadoras")
    .select("id, nombre, google_calendar_id")
    .eq("activa", true);

  const calendarIds = new Set<string>();
  calendarIds.add(MAIN_CALENDAR);
  for (const w of workers ?? []) {
    if (w.google_calendar_id) calendarIds.add(w.google_calendar_id);
  }

  let totalDeleted = 0;

  for (const calId of calendarIds) {
    const workerName = workers?.find((w) => w.google_calendar_id === calId)?.nombre ?? calId;
    console.log(`\n📅 Calendario: ${workerName} (${calId})`);

    // List all events in range
    const allEvents: CalEvent[] = [];
    let pageToken: string | undefined;

    do {
      const res = await calendar.events.list({
        calendarId:   calId,
        timeMin:      new Date(TIME_MIN).toISOString(),
        timeMax:      new Date(TIME_MAX).toISOString(),
        singleEvents: true,
        orderBy:      "startTime",
        maxResults:   250,
        pageToken,
      });

      for (const e of res.data.items ?? []) {
        if (e.id && e.summary && e.start?.dateTime) {
          allEvents.push({
            id:      e.id,
            summary: e.summary,
            start:   e.start.dateTime,
            end:     e.end?.dateTime ?? "",
          });
        }
      }
      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);

    console.log(`   ${allEvents.length} eventos encontrados`);

    if (deleteAll) {
      // Delete ALL events in range
      for (const e of allEvents) {
        if (dryRun) {
          console.log(`   [DRY] Eliminaría: ${e.summary} @ ${e.start}`);
        } else {
          try {
            await calendar.events.delete({ calendarId: calId, eventId: e.id });
            totalDeleted++;
            console.log(`   🗑️  ${e.summary} @ ${e.start}`);
          } catch (err: any) {
            console.log(`   ⚠️  Error: ${e.summary}: ${err.message ?? err}`);
          }
          await new Promise((r) => setTimeout(r, 300)); // rate limit
        }
      }
    } else {
      // Find duplicates: group by summary + startTime
      const groups = new Map<string, CalEvent[]>();
      for (const e of allEvents) {
        const key = `${e.summary}|${e.start}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(e);
      }

      const dupes = [...groups.entries()].filter(([, events]) => events.length > 1);
      if (dupes.length === 0) {
        console.log("   ✅ Sin duplicados");
        continue;
      }

      console.log(`   ⚠️  ${dupes.length} grupos de duplicados:`);

      for (const [key, events] of dupes) {
        // Keep first, delete rest
        const [keep, ...toDelete] = events;
        console.log(`   "${key}" → ${events.length} copias, mantengo ${keep.id.slice(0, 8)}...`);

        for (const e of toDelete) {
          if (dryRun) {
            console.log(`     [DRY] Eliminaría: ${e.id}`);
          } else {
            try {
              await calendar.events.delete({ calendarId: calId, eventId: e.id });
              totalDeleted++;
              console.log(`     🗑️  Eliminado: ${e.id}`);
            } catch (err: any) {
              console.log(`     ⚠️  Error: ${err.message ?? err}`);
            }
            await new Promise((r) => setTimeout(r, 300));
          }
        }
      }
    }
  }

  console.log(`\n✅ Listo. ${dryRun ? "0 (dry-run)" : totalDeleted} eventos eliminados.`);
}

main().catch((err) => { console.error("Error:", err); process.exit(1); });
