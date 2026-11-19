/**
 * Turns the phone number a shop typed into the form WhatsApp needs: country code, digits only,
 * no plus sign (for example "9414012345" becomes "919414012345").
 * Only Indian mobile numbers are accepted. Returns null when the number cannot be used.
 */
export function normalizeIndianPhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  let digits = raw.replace(/[^\d]/g, '')

  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  else if (digits.length === 13 && digits.startsWith('091')) digits = digits.slice(3)

  // Indian mobile numbers are 10 digits and start with 6, 7, 8 or 9
  if (!/^[6-9]\d{9}$/.test(digits)) return null
  return `91${digits}`
}
