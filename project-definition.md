# My Brothers — Project Definition

A mobile-first CRM and Order Management PWA for a local clothing & tailoring shop.
Built for internal use by shop staff (admins), with a public order status page for customers.

---

## Problem

The shop manages hundreds of customers and orders manually (paper/WhatsApp). There's no central place to:
- Track order status and delivery dates
- Store customer body measurements
- Know which orders are ready for pickup
- Send status updates to customers

---

## Solution

An internal web app (PWA) that staff use on their phones to:
1. Add and manage customers with body measurements
2. Create and track tailoring orders
3. Update order status and notify customers via WhatsApp
4. View revenue and order analytics
5. Send marketing offers to customers via WhatsApp

---

## Users

| Role | Who | Access |
|---|---|---|
| Admin | Shop staff / tailors | Full app access (login required) |
| Public | Customers | Read-only order status page (`/order/[id]`) |

Max ~5 admin accounts. No self-signup — accounts created manually.

---

## Core Features

### Customers
- Add customer with name + phone
- Store body measurements (JSONB — flexible fields per garment type)
- View customer's full order history
- Edit measurements at any time

### Orders
- Create order linked to a customer
- Support multiple items per order (e.g. shirt + trousers)
- Track: cloth source (Customer/Tailor), total amount, advance paid, notes
- Filter by status, period, customer
- Update order status: Pending → Stitching → Ready → Delivered (or Cancelled)

### WhatsApp Notifications
- On status change to Ready/Delivered: auto-generate a pre-filled `wa.me` link
- Opens WhatsApp with message ready — owner just taps Send
- No API setup required — works on any device with WhatsApp

### Marketing (planned)
- Compose an offer message
- Send to all customers via WhatsApp Business API (bulk)
- Fallback: manual send list with per-customer `wa.me` links

### Revenue
- View revenue metrics and order analytics

---

## Design Constraints

- **Mobile-first** — designed for 390px width, one-thumb use
- **Light mode only**
- **PWA** — installable on iPhone/Android home screen
- **No horizontal scroll** on any screen
- **Minimum 48px touch targets**

---

## Tech Stack

See `architecture.md` for full details.

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4 + Lucide React
- Neon (Serverless Postgres) + Drizzle ORM
- Auth.js v5 (Credentials — email + password)
- Vercel (Hobby) deployment

---

## Current Build Status

### Done
- Auth (login, session, proxy guard)
- Dashboard (metrics, quick actions, recent orders)
- Customer list (searchable)
- Customer detail (measurements editor, order history)
- Order list (status/period/sort/customer filters)
- Create order (multi-item, customer picker)
- Edit order (status update, WhatsApp trigger on Ready/Delivered)
- Public order status page (`/order/[id]`)
- Marketing page (UI scaffold)
- Revenue page

### Pending
- Marketing bulk send (wire to WhatsApp Business API)
