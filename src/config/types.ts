// Types for a shop's settings file (see src/config/shops/*.ts).

/** Every colour token the app uses; each one is a `--color-<name>` CSS variable. */
export type ThemeToken =
  | 'canvas'
  | 'surface-muted'
  | 'surface-sunken'
  | 'line'
  | 'ink'
  | 'ink-soft'
  | 'ink-muted'
  | 'brand'
  | 'brand-deep'
  | 'brand-wash'
  | 'brand-tint'
  | 'brand-tint-strong'
  | 'accent'
  | 'accent-ink'
  | 'accent-soft'
  | 'accent-line'
  | 'accent-wash'
  | 'accent-tint'
  | 'accent-tint-strong'
  | 'danger'
  | 'danger-ink'
  | 'danger-soft'
  | 'danger-wash'
  | 'danger-tint'
  | 'danger-tint-strong'
  | 'success'
  | 'success-wash'
  | 'success-tint'
  | 'success-tint-strong'
  | 'info-ink'
  | 'info-tint'
  | 'info-tint-strong'
  | 'neutral-tint'
  | 'plum-ink'
  | 'plum-tint'
  | 'plum-tint-strong'
  | 'rose-ink'
  | 'rose-tint'
  | 'rose-tint-strong'

export type Theme = Record<ThemeToken, string>

export type LogoConfig =
  /** The Dhaaga needle-and-thread mark. */
  | { type: 'needle' }
  /** A single letter on the brand colour, for shops without a logo yet. */
  | { type: 'monogram'; letter?: string }
  /** An image file in /public, for example '/shops/jiyajee/logo.svg'. */
  | { type: 'image'; src: string }

export interface ShopFeatures {
  /** Dealer accounts and ledger (/dealers). */
  dealers: boolean
  /** Fabric stock (/inventory), low-stock alerts and fabric picking on orders. Needs clothChoice. */
  stock: boolean
  /** The "Cloth: Customer / Tailor" choice on each order item. Off means always Customer. */
  clothChoice: boolean
  /** WhatsApp messages to customers (order placed, status changes, payments). See README. */
  whatsapp: boolean
}


export interface ShopConfig {
  /** Lowercase letters, numbers and dashes. Must match the file name. */
  id: string
  name: string
  tagline: string
  logo: LogoConfig
  /** Optional browser-tab icon in /public, for example '/shops/jiyajee/favicon.png'. */
  favicon?: string
  features: ShopFeatures
  /** Colours to change from the defaults. Leave out to keep the Dhaaga palette. */
  theme?: Partial<Theme>
}

/** Identity function that type-checks a shop file. */
export function defineShop(config: ShopConfig): ShopConfig {
  return config
}
