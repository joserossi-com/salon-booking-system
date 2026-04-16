# Beauty Salon Booking System

A full-stack digitalization project for a beauty salon — replacing manual WhatsApp-based scheduling with an online booking system, admin dashboard, and an AI-powered conversational agent via Telegram.

> **Portfolio project** — built end-to-end: database design, REST API, frontend, and AI integration.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion |
| UI Components | shadcn/ui, Base UI |
| Backend | Next.js API Routes (serverless) |
| Database | Supabase (PostgreSQL) |
| Authentication | Custom session-based admin auth |
| AI Agent | Anthropic Claude Haiku (conversational booking) |
| Bot Platform | Telegram Bot API |
| Rate Limiting | Upstash Redis (sliding window) |
| Calendar | Google Calendar API (service account) |
| Deployment | Vercel |
| Validation | Zod |

---

## Features

**Online Booking via AI Agent**
Customers interact with a Telegram bot powered by Claude Haiku. The agent collects name, phone, service, and preferred time — then creates the appointment in both Supabase and Google Calendar simultaneously. Includes conversation history, rate limiting (30 msg/hr per user), and prompt injection protection.

**Google Calendar Integration**
Each worker has a dedicated Google Calendar. When a booking is confirmed, the bot creates the event in the corresponding worker's calendar via the Google Calendar API (service account). Before confirming any appointment, the bot checks the worker's calendar for conflicts, enabling real-time availability verification. Customers can also ask the bot to cancel or reschedule an existing appointment — the bot deletes or updates the calendar event accordingly.

**Centralized Appointment System**
Appointments stored in Supabase with full conflict detection. Each service has a duration, so the system validates start + duration against business hours (Mon–Sat, 10:00–19:00) before confirming.

**Worker–Service Assignment**
Each worker is linked to the services they can perform via a junction table (`trabajadora_servicios`). The AI agent automatically assigns the right worker based on availability and capability — no manual coordination needed.

**Admin Dashboard**
Password-protected panel for the salon owner to view the daily agenda, manage workers and services, and track key business metrics.

**Business KPIs**
- Revenue by day / week / month
- Appointments completed vs. cancelled
- Most requested service (last 30 days)
- Top-earning worker
- Peak hours heatmap
- New vs. returning clients

**Automated Reminders**
Appointment confirmation sent immediately via Telegram. Reminder logic for upcoming bookings.

**Client History**
Every appointment is stored against a client profile (name + phone), enabling retention tracking and personalized service.

---

## Architecture

```
Client (Telegram)
       │
       ▼
Telegram Bot API ──► POST /api/webhook/telegram
                              │
                    ┌─────────┴──────────┐
                    │                    │
             Anthropic API         Supabase DB
           (Claude Haiku)        (PostgreSQL)
           Conversational          Services
             reasoning            Workers
                    │              Appointments
                    │              Conversations
                    └──► [BOOKING] / [CANCEL] / [MODIFY]
                                    │
                          POST /api/appointments
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                    Supabase DB        Google Calendar API
                  (conflict check +   (per-worker calendars)
                   insert/update/      create / delete /
                   delete cita)        update event

Web Client (Browser)
       │
       ▼
Next.js Frontend (Vercel)
       │
  ┌────┴────┐
  │         │
REST API   Admin
Routes    Dashboard
  │
Supabase DB
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Telegram Bot](https://core.telegram.org/bots#botfather) token
- An [Anthropic API](https://console.anthropic.com) key
- An [Upstash Redis](https://upstash.com) database (for rate limiting)
- (Optional) A Google Cloud service account for Calendar integration

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/salon-booking-system.git
cd salon-booking-system/site
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in all variables in `.env.local` (see [Environment Variables](#environment-variables) below).

### Set Up the Database

Run the schema in your Supabase SQL Editor:

```bash
# Apply schema
supabase/schema.sql

# (Optional) Seed with example data
supabase/seed.sql
```

### Register the Telegram Webhook

After starting the dev server or deploying to Vercel:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://your-domain.vercel.app/api/webhook/telegram" \
  -d "secret_token=YOUR_WEBHOOK_SECRET"
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | Your deployment URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | Secret to verify webhook requests |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `BOT_API_KEY` | Internal API key for bot→server communication |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google service account for Calendar |
| `GOOGLE_PRIVATE_KEY` | Google service account private key |
| `GOOGLE_CALENDAR_ID` | Google Calendar ID (per worker) |
| `ADMIN_PASSWORD` | Password for the admin dashboard |
| `ADMIN_SESSION_SECRET` | Session signing secret |

---

## Project Structure

```
site/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── appointments/      # REST endpoint: create/list/update appointments
│   │   │   ├── calendar/          # Google Calendar sync
│   │   │   ├── services/          # Services CRUD
│   │   │   ├── workers/           # Workers CRUD
│   │   │   ├── webhook/telegram/  # Telegram bot webhook + AI agent
│   │   │   └── setup-webhook/     # One-time webhook registration helper
│   │   ├── admin/                 # Admin dashboard (protected)
│   │   ├── equipo/                # Team page
│   │   ├── precios/               # Pricing page
│   │   └── page.tsx               # Landing page
│   ├── components/                # React components
│   └── lib/
│       ├── supabase.ts            # Supabase client helpers
│       ├── google-calendar.ts     # Google Calendar integration
│       ├── schemas.ts             # Zod validation schemas
│       ├── rate-limit.ts          # Upstash rate limiter config
│       ├── auth.ts                # Admin session logic
│       └── utils.ts               # Shared utilities
├── supabase/
│   ├── schema.sql                 # Full database schema
│   ├── seed.sql                   # Example data
│   └── add_google_calendar.sql    # Migration: calendar fields
├── public/images/                 # Service portfolio images
├── .env.example                   # Environment variable template
├── next.config.ts
└── package.json
```

---

## Database Schema

```
trabajadoras          Workers (name, commission %, active)
servicios             Services (name, price, duration, category)
trabajadora_servicios Worker ↔ Service mapping (junction table)
clientes              Client profiles (name, phone)
citas                 Appointments (worker, service, client, datetime, status)
conversaciones        Telegram chat history (for AI context window)
```

---

## Security Notes

- All `.env*` files excluded via `.gitignore` — secrets never committed
- Telegram webhooks verified with a `secret_token` header
- User input sanitized and validated with Zod before any DB write
- Rate limiting prevents abuse (30 messages/hour per Telegram user)
- Service role key only used server-side, never exposed to the browser
- Prompt injection attempts handled at the system prompt level

---

## Author

**José Rossi** — Industrial Engineer | Data & Full-Stack Development  
[LinkedIn](https://linkedin.com/in/jose-rossi) · [GitHub](https://github.com/joserossiuv)