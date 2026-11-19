/**
 * Sends the WhatsApp messages for an order: order placed, status changed, payment received.
 *
 * Rules this file keeps:
 *  - It never throws. A WhatsApp problem must not stop an order from being saved.
 *  - No message goes to a customer who has not agreed to WhatsApp updates.
 *  - Without WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID it runs in test mode: the message is
 *    logged to the database and the terminal, and nothing is sent.
 *  - Every attempt is written to the whatsapp_messages table, with the reason when it fails.
 */
import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { orders, whatsappMessages } from '@/db/schema'
import type { WhatsAppEvent } from '@/db/schema'
import { FEATURES } from '@/lib/features'
import { BRAND } from '@/lib/brand'
import { orderPDFBytes } from '@/lib/generateOrderPDF'
import { normalizeIndianPhone } from './phone'
import { getCredentials, sendTemplate, uploadMedia } from './client'
import {
  NOTIFY_STATUSES, STATUS_PHRASE, TEMPLATES, cleanParam, renderBody,
  type TemplateKey,
} from './templates'

export type WhatsAppOutcome = 'sent' | 'dry_run' | 'skipped' | 'failed' | 'disabled'

export interface WhatsAppResult {
  outcome: WhatsAppOutcome
  /** Short sentence for the screen. */
  message: string
}

export type OrderWhatsAppEvent =
  | { type: 'order_placed' }
  | { type: 'status_update'; status: string }
  | { type: 'payment_received'; amount: number }

const EVENT_TEMPLATE: Record<WhatsAppEvent, TemplateKey> = {
  order_placed: 'order_confirmation',
  status_update: 'order_status_update',
  payment_received: 'payment_receipt',
}

const DEFAULT_PUBLIC_BASE = 'https://graph.facebook.com'

function inr(n: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)
}

/** The public address of this app, used for the customer's tracking link. */
export function getAppUrl(): string {
  const fromEnv = process.env.APP_URL?.trim() || process.env.AUTH_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000'
}

function isLocalUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(url)
}

function shortError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)
  return msg.slice(0, 300)
}

function describe(e: WhatsAppEvent, detail: string | null): string {
  if (e === 'order_placed') return 'order confirmation'
  if (e === 'status_update') return `status update (${detail})`
  return `payment receipt (₹${detail})`
}

const MESSAGES: Record<WhatsAppOutcome, (extra?: string) => string> = {
  sent: () => 'WhatsApp message sent',
  dry_run: () => 'WhatsApp test mode: message logged, not sent',
  skipped: extra => `WhatsApp not sent: ${extra}`,
  failed: extra => `WhatsApp failed: ${extra}`,
  disabled: () => 'WhatsApp is switched off',
}

function result(outcome: WhatsAppOutcome, extra?: string): WhatsAppResult {
  return { outcome, message: MESSAGES[outcome](extra) }
}

export async function sendOrderWhatsApp(
  orderId: string,
  event: OrderWhatsAppEvent,
): Promise<WhatsAppResult> {
  if (!FEATURES.whatsapp) return result('disabled')

  try {
    if (event.type === 'status_update' && !NOTIFY_STATUSES.includes(event.status)) {
      return result('skipped', `customers are not told about "${event.status}"`)
    }

    const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId), with: { customer: true } })
    if (!order) return result('failed', 'order not found')
    const customer = order.customer

    const key = EVENT_TEMPLATE[event.type]
    const def = TEMPLATES[key]
    const name = key // the template name registered with Meta
    const language = 'en'
    const detail =
      event.type === 'status_update' ? event.status
      : event.type === 'payment_received' ? String(event.amount)
      : null

    const base = {
      orderId,
      customerId: customer.id,
      event: event.type as WhatsAppEvent,
      detail,
      template: name,
    }

    // Skip, with a reason that is saved in the log
    const skip = async (reason: string, phone: string | null = null) => {
      await db.insert(whatsappMessages).values({ ...base, toPhone: phone, status: 'skipped', error: reason })
        .catch(e => console.error('[whatsapp] could not log skipped message', shortError(e)))
      return result('skipped', reason)
    }

    if (!customer.whatsappOptIn) return skip('the customer has not agreed to WhatsApp updates')
    const to = normalizeIndianPhone(customer.phone)
    if (!to) return skip('the phone number is not a valid Indian mobile number')

    // Build the message values, in the order of {{1}}, {{2}}…
    const total = parseFloat(order.totalAmount) || 0
    const advance = parseFloat(order.advancePaid) || 0
    const orderNo = order.id.slice(0, 8).toUpperCase()
    const trackUrl = `${getAppUrl()}/order/${order.id}`
    const firstName = customer.name.trim().split(/\s+/)[0] || customer.name
    const itemNames = order.items.map(i => i.name).join(', ').slice(0, 100)

    let values: string[]
    if (event.type === 'order_placed') {
      values = [firstName, orderNo, BRAND.name, itemNames, inr(total), inr(advance), inr(Math.max(total - advance, 0)), trackUrl]
    } else if (event.type === 'status_update') {
      values = [firstName, orderNo, BRAND.name, STATUS_PHRASE[event.status], trackUrl]
    } else {
      values = [firstName, inr(event.amount), orderNo, BRAND.name, inr(Math.max(total - advance, 0))]
    }
    values = values.map(cleanParam)

    const creds = getCredentials()

    // Test mode: log it, show it in the terminal, send nothing
    if (!creds) {
      console.log(`[whatsapp:test-mode] to ${to}: ${renderBody(def.body, values)}${def.pdfHeader ? ' [+ PDF]' : ''}`)
      await db.insert(whatsappMessages).values({ ...base, toPhone: to, status: 'dry_run' })
        .catch(e => console.error('[whatsapp] could not log test message', shortError(e)))
      return result('dry_run')
    }

    // A tracking link that points at localhost is useless to a customer
    if (creds.base === DEFAULT_PUBLIC_BASE && isLocalUrl(getAppUrl())) {
      return skip('set APP_URL to the live website address so the tracking link works for customers', to)
    }

    // Record the attempt BEFORE sending. For order_placed the unique key means a second request
    // for the same order cannot send a second confirmation.
    const dedupeKey = event.type === 'order_placed' ? `${orderId}:order_placed` : null
    const [row] = await db.insert(whatsappMessages)
      .values({ ...base, toPhone: to, status: 'queued', dedupeKey })
      .onConflictDoNothing()
      .returning({ id: whatsappMessages.id })
    if (!row) return result('skipped', 'this confirmation was already sent')

    try {
      let document: { mediaId: string; filename: string } | undefined
      if (def.pdfHeader) {
        const { bytes, filename } = orderPDFBytes({
          id: order.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          items: order.items,
          orderDate: order.orderDate,
          status: order.status,
          totalAmount: order.totalAmount,
          advancePaid: order.advancePaid,
          notes: order.notes,
        })
        document = { mediaId: await uploadMedia(creds, bytes, filename, 'application/pdf'), filename }
      }
      const providerId = await sendTemplate(creds, { to, name, language, params: values, document })
      // Save the WhatsApp message id. Delivery reports can arrive before this write finishes, so
      // only move "queued" to "sent": never overwrite a later status (delivered, read, failed).
      await db.update(whatsappMessages).set({
        providerMessageId: providerId,
        status: sql`CASE WHEN ${whatsappMessages.status} = 'queued' THEN 'sent' ELSE ${whatsappMessages.status} END`,
      }).where(eq(whatsappMessages.id, row.id))
      return result('sent')
    } catch (e) {
      const reason = shortError(e)
      console.error(`[whatsapp] ${describe(event.type, detail)} for order ${orderNo} failed: ${reason}`)
      await db.update(whatsappMessages).set({ status: 'failed', error: reason }).where(eq(whatsappMessages.id, row.id))
        .catch(err => console.error('[whatsapp] could not log failure', shortError(err)))
      return result('failed', reason)
    }
  } catch (e) {
    console.error('[whatsapp] unexpected error', shortError(e))
    return result('failed', 'unexpected error, see the server log')
  }
}
