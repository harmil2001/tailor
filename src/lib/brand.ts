// Single source of truth for the shop's brand name.
// Change it here and every screen, the browser tab and the PDF invoice follow.
export const BRAND = {
  name: 'Dhaaga',
  tagline: 'Clothing & Tailoring',
} as const

export const BRAND_FULL = `${BRAND.name} · ${BRAND.tagline}`
