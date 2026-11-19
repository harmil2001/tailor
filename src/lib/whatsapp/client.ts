/**
 * Thin client for the WhatsApp Business Cloud API (Meta).
 *
 * Environment variables (set in .env.local and in the host's settings):
 *   WHATSAPP_ACCESS_TOKEN     permanent token from a Meta System User (never the 24-hour test token)
 *   WHATSAPP_PHONE_NUMBER_ID  the sender's Phone Number ID from the WhatsApp API Setup page
 *
 * The access token is only ever put in the Authorization header. It is never logged.
 */
const DEFAULT_BASE = 'https://graph.facebook.com'
const DEFAULT_VERSION = 'v23.0'
const TIMEOUT_MS = 8000

export class WhatsAppApiError extends Error {
  constructor(message: string, readonly status?: number, readonly code?: number) {
    super(message)
    this.name = 'WhatsAppApiError'
  }
}

export interface WhatsAppCredentials {
  token: string
  phoneNumberId: string
  base: string
  version: string
}

/** Returns the credentials, or null when they are not set (the app then stays in test mode). */
export function getCredentials(): WhatsAppCredentials | null {
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim()
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()
  if (!token || !phoneNumberId) return null
  return {
    token,
    phoneNumberId,
    base: DEFAULT_BASE,
    version: DEFAULT_VERSION,
  }
}

async function request(creds: WhatsAppCredentials, path: string, init: RequestInit): Promise<unknown> {
  // One retry, and only when the network itself failed. A timeout or an error reply is not retried,
  // so a message can never be sent twice by the retry.
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(`${creds.base}/${creds.version}/${creds.phoneNumberId}/${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${creds.token}`, ...(init.headers ?? {}) },
        signal: controller.signal,
      })
      const text = await res.text()
      let json: Record<string, unknown> = {}
      try { json = text ? JSON.parse(text) : {} } catch { /* not JSON */ }

      if (!res.ok) {
        const err = (json.error ?? {}) as { message?: string; code?: number; error_data?: { details?: string } }
        const detail = err.error_data?.details ? ` (${err.error_data.details})` : ''
        throw new WhatsAppApiError(`${err.message ?? `HTTP ${res.status}`}${detail}`, res.status, err.code)
      }
      return json
    } catch (e) {
      if (e instanceof WhatsAppApiError) throw e
      if (e instanceof Error && e.name === 'AbortError') throw new WhatsAppApiError('WhatsApp did not answer in time')
      if (attempt === 1) throw new WhatsAppApiError('Could not reach WhatsApp')
    } finally {
      clearTimeout(timer)
    }
  }
  throw new WhatsAppApiError('Could not reach WhatsApp')
}

/** Uploads a file and returns its media id, to be used as a template's document header. */
export async function uploadMedia(creds: WhatsAppCredentials, file: Uint8Array, filename: string, mime: string): Promise<string> {
  const form = new FormData()
  form.append('messaging_product', 'whatsapp')
  form.append('type', mime)
  form.append('file', new Blob([file as BlobPart], { type: mime }), filename)
  const json = (await request(creds, 'media', { method: 'POST', body: form })) as { id?: string }
  if (!json.id) throw new WhatsAppApiError('WhatsApp did not return a media id')
  return json.id
}

export interface SendTemplateInput {
  /** Recipient, country code and digits only, for example 919414012345. */
  to: string
  name: string
  language: string
  /** Values for {{1}}, {{2}}… in order. */
  params: string[]
  /** For templates with a PDF header: the uploaded media id and the file name shown to the customer. */
  document?: { mediaId: string; filename: string }
}

/** Sends a template message and returns WhatsApp's message id. */
export async function sendTemplate(creds: WhatsAppCredentials, input: SendTemplateInput): Promise<string> {
  const components: unknown[] = []
  if (input.document) {
    components.push({
      type: 'header',
      parameters: [{ type: 'document', document: { id: input.document.mediaId, filename: input.document.filename } }],
    })
  }
  components.push({
    type: 'body',
    parameters: input.params.map(text => ({ type: 'text', text })),
  })

  const json = (await request(creds, 'messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: input.to,
      type: 'template',
      template: { name: input.name, language: { code: input.language }, components },
    }),
  })) as { messages?: { id?: string }[] }

  const id = json.messages?.[0]?.id
  if (!id) throw new WhatsAppApiError('WhatsApp did not return a message id')
  return id
}
