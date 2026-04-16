# Kitty Studio — Estado del Proyecto

> Archivo de contexto persistente. Actualizar al final de cada sesión.
> Última actualización: 2026-04-02

---

## El negocio

- **Nombre:** Kitty Studio
- **Ubicación:** Viña del Mar, Chile
- **Instagram:** @kittystudio._
- **Stack técnico elegido:** Next.js + Supabase + Vercel (desarrollo a medida, Opción C)
- **URL producción:** https://kittystudio.vercel.app

---

## Trabajadoras

| Nombre     | Rol                | Servicios aprox. | Notas                                             |
|------------|--------------------|-----------------|---------------------------------------------------|
| Kitty      | Dueña / estilista  | ~60 servicios   | Mayor capacidad. Prioridad SECUNDARIA en servicios compartidos |
| Constanza  | Estilista          | Menos que Kitty | Prioridad PRIMARIA para servicios que comparte con Kitty       |
| Nicole     | Estilista          | Menos que Kitty | Prioridad PRIMARIA para servicios que comparte con Kitty       |

**Regla de negocio clave:** Si un servicio lo puede hacer Kitty Y Constanza/Nicole,
se debe ofrecer primero a Constanza o Nicole. Kitty solo entra si las demás están ocupadas.

---

## Arquitectura técnica

### Base de datos (Supabase / PostgreSQL)

Tablas principales:
- `trabajadoras` — id, nombre, activa, porcentaje_comision
- `servicios` — id, nombre, descripcion, duracion_minutos, precio, categoria, activo
- `trabajadora_servicios` — relación N:N (qué servicios puede hacer cada una)
- `citas` — id, cliente_id, trabajadora_id, servicio_id, fecha_hora_inicio, fecha_hora_fin, estado, precio_cobrado
- `conversaciones` — chat_id (Telegram), mensajes (JSON history), updated_at
- `clientes` — id, nombre, telefono, email, notas

### Frontend

- **Framework:** Next.js (App Router)
- **Deploy:** Vercel
- **Panel admin:** en construcción (agenda, métricas, comisiones)

### Bot de Telegram

- **Ruta:** `src/app/api/webhook/telegram/route.ts`
- **Modelo IA:** claude-haiku-4-5-20251001
- **Rate limit:** 20 mensajes/hora por usuario (Upstash Redis)
- **Historia de conversación:** guardada en tabla `conversaciones` de Supabase (últimos 10 mensajes)
- **Reservas:** el bot genera un bloque `[BOOKING]{...}[/BOOKING]` que el route parsea y envía a `POST /api/appointments`

---

## Estado actual del desarrollo

### ✅ Completado

- [x] Tabla de servicios y trabajadoras en Supabase
- [x] Relación trabajadora_servicios (qué puede hacer cada una)
- [x] Route del bot de Telegram (`/api/webhook/telegram/route.ts`)
  - Autenticación con secret header
  - Rate limiting por chat_id
  - Historial de conversación en Supabase
  - Integración con Claude (Haiku)
  - Detección de booking y creación de cita via `/api/appointments`
  - Sanitización de inputs y protección contra prompt injection
  - Conocimiento de términos populares de pestañas (hawaianas, griegas, etc.)
- [x] **Lógica de prioridad de asignación** (implementada 2026-04-02)
  - `computePriorityMap()`: calcula dinámicamente los servicios compartidos Kitty/otras
  - `prioridad_asignacion` incluido en el contexto que recibe Claude
  - Regla en system prompt: ofrecer Constanza/Nicole primero, Kitty solo si no están disponibles

### 🔄 En progreso / Pendiente

- [ ] Route `/api/appointments` — verificar lógica de detección de conflictos (409)
- [ ] Panel de administración (agenda visual por día/semana/trabajadora)
- [ ] Métricas del negocio (KPIs: ingresos, servicios más pedidos, horarios peak)
- [ ] Cálculo de comisiones por trabajadora
- [ ] Recordatorios automáticos de citas (WhatsApp o SMS)
- [ ] Historial de clientes en el panel

---

## Decisiones técnicas tomadas

| Decisión                          | Resultado                          | Fecha       |
|-----------------------------------|------------------------------------|-------------|
| Plataforma                        | Next.js + Supabase + Vercel        | (sesión anterior) |
| Bot de Telegram vs WhatsApp       | Telegram (más fácil de integrar)   | (sesión anterior) |
| Modelo IA para el bot             | claude-haiku-4-5-20251001          | (sesión anterior) |
| Rate limit                        | Upstash Redis, 20 msg/hora         | (sesión anterior) |
| Historia de conversación          | Supabase tabla `conversaciones`    | (sesión anterior) |
| Prioridad Constanza/Nicole > Kitty | computePriorityMap() dinámico     | 2026-04-02  |

---

## Próximos pasos sugeridos

1. Reemplazar el `route.ts` de producción con la versión actualizada (incluye prioridad)
2. Probar con casos reales: cliente pide alisado → debería sugerir Constanza primero
3. Construir `/api/appointments` si no está completo (verificar conflicto de horarios)
4. Empezar panel admin con vista de agenda

---

## Archivos clave del proyecto

```
site/
├── src/
│   └── app/
│       └── api/
│           ├── webhook/
│           │   └── telegram/
│           │       └── route.ts        ← Bot Telegram (última versión en outputs/)
│           └── appointments/
│               └── route.ts            ← API de creación de citas
├── lib/
│   ├── supabase.ts                     ← Cliente Supabase admin
│   └── schemas.ts                      ← Zod schema CreateAppointmentSchema
```

---

## Notas sueltas

- El bot se llama "Kitty" internamente pero es la asistente virtual, no la dueña
- Las clientas usan "hawaianas" para extensiones rímel y "griegas" para volumen ruso — el bot ya conoce estos términos
- La zona horaria del salón es `-04:00` (Chile, hora de verano)
