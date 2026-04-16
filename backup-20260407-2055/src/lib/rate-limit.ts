import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limiter distribuido con Upstash Redis.
// Funciona correctamente en Vercel serverless (múltiples instancias).
const ratelimit = new Ratelimit({
  redis:     Redis.fromEnv(),
  limiter:   Ratelimit.slidingWindow(30, "1 m"),
  analytics: false,
});

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const { success, remaining } = await ratelimit.limit(ip);
  return { allowed: success, remaining };
}

export function getClientIp(req: Request): string {
  const headers = (req as any).headers;

  // x-real-ip lo setea Vercel/proxy y no puede ser falsificado por el cliente
  const realIp = headers?.get?.("x-real-ip");
  if (realIp) return realIp.trim();

  // Como fallback, usamos el último IP de x-forwarded-for (el que añade el proxy)
  // y NO el primero (que puede ser manipulado por el cliente).
  const forwarded = headers?.get?.("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((s: string) => s.trim());
    return ips[ips.length - 1] ?? "unknown";
  }

  return "unknown";
}
