// The shop's brand name, read from its settings file (src/config/shops/<SHOP_ID>.ts).
// Change the name there and every screen, the browser tab and the PDF invoice follow.
import { SHOP } from '@/config'

export const BRAND = {
  name: SHOP.name,
  tagline: SHOP.tagline,
} as const

export const BRAND_FULL = `${BRAND.name} · ${BRAND.tagline}`
