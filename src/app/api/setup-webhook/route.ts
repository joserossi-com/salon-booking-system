import { NextResponse } from "next/server";

// Ruta temporal de un solo uso para registrar el webhook de Telegram.
// Protegida con BOT_API_KEY. Eliminar después de usar.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== process.env.BOT_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!token || !baseUrl || !secret) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const webhookUrl = `${baseUrl}/api/webhook/telegram`;

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ["message"],
      secret_token: secret,
    }),
  });

  const data = await res.json();
  return NextResponse.json({ webhookUrl, telegram: data });
}
