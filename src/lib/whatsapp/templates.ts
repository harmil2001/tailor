/**
 * The WhatsApp message templates the app sends.
 *
 * WhatsApp only lets a business start a conversation with an APPROVED template, so the text below
 * must be submitted to Meta (WhatsApp Manager > Message templates, category "Utility") exactly as
 * written, with the same name and language. The numbered {{n}} values are filled in by the app.
 *
 * Meta's rules to keep in mind when editing: no variable at the very start or end of the body,
 * variables are numbered in order with no gaps, and a value cannot contain line breaks.
 */
import type { WhatsAppEvent } from '@/db/schema'

export type TemplateKey = 'order_confirmation' | 'order_status_update' | 'payment_receipt'

export interface TemplateDef {
  key: TemplateKey
  event: WhatsAppEvent
  /** Body text as submitted to Meta. */
  body: string
  /** Names of the {{1}}, {{2}}… values, in order. */
  params: string[]
  /** Sample values to give Meta when submitting the template. */
  samples: string[]
  /** The template has a PDF in its header. */
  pdfHeader: boolean
}

export const TEMPLATES: Record<TemplateKey, TemplateDef> = {
  order_confirmation: {
    key: 'order_confirmation',
    event: 'order_placed',
    body:
      'Hi {{1}}, thank you for your order {{2}} at {{3}}. Items: {{4}}. Total ₹{{5}}, advance paid ₹{{6}}, ' +
      'balance ₹{{7}}. Your order slip is attached. Track your order here: {{8}} Thank you.',
    params: ['customer name', 'order number', 'shop name', 'items', 'total', 'advance paid', 'balance', 'tracking link'],
    samples: ['Ramniwas', 'F6E3D41A', 'Dhaaga', 'Bandhgala suit', '5,200', '2,500', '2,700', 'https://example.com/order/f6e3d41a'],
    pdfHeader: true,
  },
  order_status_update: {
    key: 'order_status_update',
    event: 'status_update',
    body: 'Hi {{1}}, your order {{2}} at {{3}} is now {{4}}. Track your order here: {{5}} Thank you.',
    params: ['customer name', 'order number', 'shop name', 'status', 'tracking link'],
    samples: ['Ramniwas', 'F6E3D41A', 'Dhaaga', 'ready for pickup', 'https://example.com/order/f6e3d41a'],
    pdfHeader: false,
  },
  payment_receipt: {
    key: 'payment_receipt',
    event: 'payment_received',
    body:
      'Hi {{1}}, we received ₹{{2}} for your order {{3}} at {{4}}. Balance due: ₹{{5}}. ' +
      'Your updated order slip is attached. Thank you.',
    params: ['customer name', 'amount received', 'order number', 'shop name', 'balance'],
    samples: ['Ramniwas', '1,000', 'F6E3D41A', 'Dhaaga', '1,700'],
    pdfHeader: true,
  },
}

/** What the status is called inside the sentence "your order … is now …". */
export const STATUS_PHRASE: Record<string, string> = {
  Stitching: 'being stitched',
  Ready: 'ready for pickup',
  Delivered: 'delivered',
  Cancelled: 'cancelled',
}

/** Statuses a customer is told about. "Pending" is not sent. */
export const NOTIFY_STATUSES = Object.keys(STATUS_PHRASE)

/** Fills {{1}}, {{2}}… in a template body. Used to show the message in the test-mode log. */
export function renderBody(body: string, values: string[]): string {
  return body.replace(/\{\{(\d+)\}\}/g, (_, n) => values[Number(n) - 1] ?? '')
}

/** Meta does not allow line breaks, tabs or runs of 4+ spaces inside a value, and no empty values. */
export function cleanParam(value: string): string {
  return value.replace(/\s+/g, ' ').trim() || '-'
}
