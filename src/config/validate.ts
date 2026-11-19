import { DEFAULT_THEME, resolveTheme } from './theme'
import type { ShopConfig } from './types'

const HEX = /^#[0-9a-f]{6}$/i

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map(i => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export interface ShopReport {
  errors: string[]
  warnings: string[]
}

/** Checks a shop file. Errors stop the build; warnings are shown by `npm run shop:check`. */
export function checkShop(shop: ShopConfig, expectedId?: string): ShopReport {
  const errors: string[] = []
  const warnings: string[] = []

  if (!/^[a-z0-9-]+$/.test(shop.id)) errors.push(`id "${shop.id}" may only use lowercase letters, numbers and dashes`)
  if (expectedId && shop.id !== expectedId) errors.push(`id "${shop.id}" does not match the file name "${expectedId}.ts"`)
  if (!shop.name?.trim()) errors.push('name is required')
  if (!shop.tagline?.trim()) errors.push('tagline is required')

  if (shop.features.stock && !shop.features.clothChoice) {
    errors.push(
      'features.stock needs features.clothChoice: fabric can only be picked for Tailor-supplied cloth, ' +
      'and orders drop fabric while clothChoice is off, so stock would never be deducted',
    )
  }

  if (shop.logo.type === 'monogram' && shop.logo.letter !== undefined && [...shop.logo.letter].length !== 1) {
    errors.push('logo.letter must be a single character')
  }
  if (shop.logo.type === 'image' && !shop.logo.src.startsWith('/')) {
    errors.push('logo.src must start with "/" and point to a file in /public')
  }
  if (shop.favicon && !shop.favicon.startsWith('/')) errors.push('favicon must start with "/" and point to a file in /public')

  for (const [key, value] of Object.entries(shop.theme ?? {})) {
    if (!(key in DEFAULT_THEME)) errors.push(`theme.${key} is not a known colour`)
    else if (!HEX.test(value)) errors.push(`theme.${key} must be a 6-digit hex colour like #3f4a63 (got "${value}")`)
  }

  if (errors.length === 0) {
    const t = resolveTheme(shop.theme)
    const pairs: [string, string, string][] = [
      ['ink on canvas', t.ink, t.canvas],
      ['ink-soft on canvas', t['ink-soft'], t.canvas],
      ['white on brand (buttons)', '#ffffff', t.brand],
    ]
    for (const [label, fg, bg] of pairs) {
      const ratio = contrast(fg, bg)
      if (ratio < 4.5) warnings.push(`low contrast for ${label}: ${ratio.toFixed(1)}:1 (aim for 4.5:1 or more)`)
    }
  }

  return { errors, warnings }
}
