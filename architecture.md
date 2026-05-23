# My Brothers — Clothing & Tailoring

A mobile-first CRM and Order Management tool for "My Brothers — Clothing & Tailoring" shop.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components + Server Actions, no separate backend needed |
| Styling | Tailwind CSS v4 + Lucide React | Mobile-first utility classes |
| Database | Neon (Serverless Postgres) | Always-on free tier, never pauses, ~500MB free |
| Auth | Auth.js v5 (NextAuth) | Free, self-hosted, built for Next.js App Router |
| ORM | Drizzle ORM | Type-safe queries, schema-as-code, migration support |
| Deployment | Vercel (Hobby) | Best DX for Next.js, free tier sufficient for internal tool |

---

## Deployment

- **Platform:** Vercel Hobby plan
- **Why:** 5 internal admin users, no public-facing traffic beyond a read-only order status page — well within free tier limits
- **Fallback:** Cloudflare Pages if Vercel ever restricts commercial use

---

## Database

- **Provider:** Neon (Serverless Postgres, Singapore region, Postgres 17)
- **Expected data size:** ~500 customers, ~2000 orders/year ≈ 10–20MB — free tier will never be exceeded

### Schema

**`users`** — fixed admin accounts (5 max), credentials auth only
```
id (uuid PK), name, email (unique), password_hash, created_at
```

**`customers`** — shop-wide, no user ownership
```
id (uuid PK), name, phone, measurements (JSONB), created_at
```
`measurements` stores flexible key-value pairs e.g. `{ chest: "42", waist: "34", inseam: "30" }`

**`orders`** — shop-wide, userId is audit-only (not access control)
```
id (uuid PK), customer_id (FK → customers, cascade delete),
user_id (FK → users, set null on delete, audit only),
items (JSONB — array of { name: string }),
cloth_provided_by (enum: Customer | Tailor),
order_date (date), total_amount (numeric), advance_paid (numeric),
status (enum: Pending | Stitching | Ready | Delivered | Cancelled),
notes (text nullable), created_at
```

**Enums:** `order_status`, `cloth_provided_by`

---

## Authentication

- **Provider:** Auth.js v5 with Credentials provider
- **Strategy:** Email + password login
- **Users:** Fixed admin accounts, created manually via seed script — no signup flow
- **Public access:** `/order/[id]` is fully public, no login required
- **Proxy:** `src/proxy.ts` (Next.js 16 renamed middleware → proxy) — cookie-presence check only, no DB calls

---

## User Access Model

```
Admin (staff)
└── Full access: Dashboard, Customers, Orders, Revenue, Marketing

Public (Customers)
└── Read-only: /order/[id] — view their order status only
```

---

## Route Structure

```
src/app/
  layout.tsx                    — root layout (fonts, metadata)
  globals.css                   — Tailwind v4 config + global styles
  login/                        — public login page
  (app)/                        — auth-gated shell (TopBar + BottomNav)
    page.tsx                    — dashboard
    customers/
      page.tsx                  — customer list (searchable)
      [id]/page.tsx             — customer detail + measurements editor
    orders/
      page.tsx                  — order list (status/period/sort/customer filters)
    marketing/
      page.tsx                  — marketing tab (wa.me bulk send UI)
    revenue/
      page.tsx                  — revenue tab
  order/[id]/                   — public order status page (no auth)
  api/auth/[...nextauth]/       — Auth.js handler
```

---

## Component Structure

```
src/components/
  ui/           TopBar, BottomNav, ProfileSheet, TieLogo, FilterSelect, Toaster
  dashboard/    MetricCard, RecentOrderCard
  customers/    CustomerCard, CreateCustomerSheet
  orders/       OrderCard, CreateOrderSheet, EditOrderSheet
```

---

## Key Architectural Decisions

**Server Components for reads** — all lists and metrics fetch directly from Neon inside Server Components. No API layer for internal reads.

**Server Actions for mutations** — creating/editing orders and customers, updating status, saving measurements.

**JSONB for measurements** — customer body measurements vary per garment type. JSONB avoids rigid columns while staying in Postgres.

**JSONB for order items** — orders support multiple items (e.g. shirt + trousers). Stored as `{ name: string }[]`.

**Orders never filtered by userId** — all admins see all orders. `userId` is audit-only (who created it).

**WhatsApp — wa.me links (current)** — when order status changes to Ready/Delivered on save, the server action returns a pre-filled `wa.me` URL. The client auto-opens it so the owner just hits Send in WhatsApp. Zero API setup required.

**WhatsApp — Meta Business Cloud API (planned)** — for the marketing tab bulk send feature. Will use a BSP (e.g. AiSensy) when ready.

---

## Environment Variables

```env
# Neon
DATABASE_URL=

# Auth.js
AUTH_SECRET=
AUTH_URL=

# Meta WhatsApp Business API (future — marketing bulk send only)
META_WHATSAPP_TOKEN=
META_PHONE_NUMBER_ID=
```
