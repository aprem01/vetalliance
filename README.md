# VetAlliance

**The Bloomberg Terminal for Veterans** — a B2B SaaS MVP for federal contracting, built for SDVOSBs, VOSBs, Prime Contractors, and Agencies.

## Stack

- Next.js 14 (App Router) · TypeScript · Tailwind CSS
- shadcn/ui-style primitives (hand-written, no CLI)
- Supabase (Auth + Postgres + RLS) — optional at runtime
- Anthropic Claude `claude-sonnet-4-5` via `@anthropic-ai/sdk`
- Recharts, lucide-react, zod

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

App runs at http://localhost:3000.

**Zero-config demo**: with `.env.local` left blank, the app runs fully on seed data (100 opportunities, 15 agencies, 50 companies, 20 primes, 30 teaming requests) and AI features return clearly-labeled mock responses.

## Environment variables

| Var | Purpose | Behavior if missing |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Claude API calls for the 5 AI routes | Returns deterministic mock responses (labeled `mocked: true`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Auth skipped, app uses seed data |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key | Auth skipped |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin (future jobs) | Not yet used |
| `SAM_GOV_API_KEY` | SAM.gov Opportunities API (live feed for `/terminal/opportunities`) | Falls back to seed opportunities, flagged as demo data |

## External data sources

- **USASpending.gov** (no key required) — drives `/terminal/agencies`, `/terminal/incumbents`, and the Market Intelligence block on `/analytics`. Client in `lib/external/usaspending.ts`, cached 1h. Falls back to seed on any error.
- **SAM.gov Opportunities** (public key required) — drives `/terminal/opportunities`. Client in `lib/external/sam.ts`, cached 30m. Register for a key at https://sam.gov/content/api. Falls back to seed opportunities if `SAM_GOV_API_KEY` is unset.

## Supabase setup (optional)

1. Create a new project at https://supabase.com.
2. Open SQL editor, paste `supabase/schema.sql`, run it. This creates profiles, companies, opportunities, teaming_requests, pipeline_items, documents, advisor_messages with RLS.
3. Copy Project URL and anon key into `.env.local`.
4. Restart `npm run dev`. Sign up at `/signup` — the trigger auto-creates a profile row.

## Anthropic setup

1. Get an API key from https://console.anthropic.com.
2. Add to `.env.local` as `ANTHROPIC_API_KEY`.
3. The following routes will use live Claude:
   - `POST /api/ai/score-opportunity` — AI fit scoring
   - `POST /api/ai/generate-document` — capability statements, teaming drafts, etc.
   - `POST /api/ai/check-compliance` — FAR / DFARS clause analysis
   - `POST /api/ai/explain-match` — teaming partner fit rationale
   - `POST /api/ai/advisor` — streaming chat (used by bottom dock + `/advisor` page)

## Routes

Public: `/`, `/login`, `/signup`, `/onboarding`

Authed (under `(app)` group):
- `/dashboard`
- `/terminal/opportunities`, `/terminal/agencies`, `/terminal/incumbents`
- `/teaming/partners`, `/teaming/pipeline`, `/teaming/requests`
- `/compliance/far-check`, `/compliance/documents`
- `/analytics`
- `/state-markets`
- `/education`
- `/advisor`

## Deploy to Vercel

```bash
# Push to GitHub, then:
# 1. Import the repo in Vercel (https://vercel.com/new)
# 2. Add env vars from .env.example in Project Settings
# 3. Deploy — default Next.js 14 settings work out of the box
```

## Notes

- All external contracting data (SAM.gov, USASpending, FPDS) is **mocked** in `lib/seed/`. Real integration is a follow-on sprint.
- UEI / CAGE codes in seed data are **fake**, generated for visual realism only.
- The AI Advisor bottom dock is persistent across all `(app)` routes.
- Deadlines across seed data live 5–210 days out from 2026-04-12.
