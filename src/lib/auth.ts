import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

const UTF8_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

const BOT_API_KEY = process.env.BOT_API_KEY;

/**
 * Comparación de strings en tiempo constante.
 * Previene timing attacks donde un atacante mide microsegundos
 * para adivinar caracteres de la API key uno a uno.
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return timingSafeEqual(bufA, bufB);
}

/** Valida que el Content-Type sea application/json */
export function requireJson(req: NextRequest): NextResponse | null {
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return apiError("Content-Type debe ser application/json", 415);
  }
  return null;
}

export function requireApiKey(req: NextRequest): NextResponse | null {
  if (!BOT_API_KEY) {
    console.error("BOT_API_KEY no configurada");
    return apiError("Configuración interna incorrecta", 500);
  }
  const key = req.headers.get("x-api-key") ?? "";
  if (!safeCompare(key, BOT_API_KEY)) {
    return apiError("No autorizado", 401);
  }
  return null; // autorizado
}

export function apiError(
  message: string,
  status:  number,
  extraHeaders?: Record<string, string>
): NextResponse {
  // Nunca exponer stack traces ni detalles internos al cliente
  return NextResponse.json(
    { error: message },
    { status, headers: { ...UTF8_HEADERS, ...extraHeaders } }
  );
}

export function apiOk(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: UTF8_HEADERS });
}

/**
 * MED-04 FIX: Los mensajes de Zod incluyen detalles del schema (ej: "String must contain
 * at most 100 character(s)") que revelan la estructura interna al atacante.
 * Este helper loggea el detalle en server-side y devuelve un mensaje genérico al cliente.
 */
export function validationError(issues: { message: string; path: PropertyKey[] }[]): NextResponse {
  console.warn("[validation] input inválido:", JSON.stringify(issues));
  return apiError("Datos de entrada inválidos", 400);
}
