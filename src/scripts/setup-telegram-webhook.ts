/**
 * setup-telegram-webhook.ts
 * Registra el webhook de Telegram apuntando al endpoint de Kitty Studio.
 *
 * Uso:
 *   TELEGRAM_BOT_TOKEN=tu-token \
 *   NEXT_PUBLIC_BASE_URL=https://kittystudio.vercel.app \
 *   TELEGRAM_WEBHOOK_SECRET=tu-secret \
 *   npx tsx src/scripts/setup-telegram-webhook.ts
 */

const token         = process.env.TELEGRAM_BOT_TOKEN;
const baseUrl       = process.env.NEXT_PUBLIC_BASE_URL;
const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token)         { console.error("❌  Falta TELEGRAM_BOT_TOKEN");        process.exit(1); }
if (!baseUrl)       { console.error("❌  Falta NEXT_PUBLIC_BASE_URL");      process.exit(1); }
if (!webhookSecret) { console.error("❌  Falta TELEGRAM_WEBHOOK_SECRET");   process.exit(1); }

const webhookUrl = `${baseUrl}/api/webhook/telegram`;

async function main() {
  console.log(`\n📡  Registrando webhook en: ${webhookUrl}\n`);

  const res = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        url:             webhookUrl,
        allowed_updates: ["message"],
        secret_token:    webhookSecret,   // ← valida que el request viene de Telegram
      }),
    }
  );

  const data = await res.json() as { ok: boolean; description?: string };

  if (data.ok) {
    console.log("✅  Webhook registrado correctamente.");
    console.log(`    Telegram enviará mensajes a: ${webhookUrl}`);
    console.log(`    Secret token: configurado ✓`);
  } else {
    console.error("❌  Error al registrar el webhook:", data.description);
    process.exit(1);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
